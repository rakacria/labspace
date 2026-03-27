-- ============================================
-- Labspace MVP — Database Schema
-- ============================================

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Programs
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  forked_from UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  fork_count INT DEFAULT 0 NOT NULL,
  best_val_bpb FLOAT,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public programs are viewable by everyone"
  ON public.programs FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own programs"
  ON public.programs FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own programs"
  ON public.programs FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own programs"
  ON public.programs FOR DELETE
  USING (auth.uid() = author_id);

-- 3. Submissions
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  val_bpb FLOAT NOT NULL,
  hardware TEXT,
  runtime_s INT,
  notes TEXT,
  log_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions are viewable by everyone"
  ON public.submissions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_program', 'new_submission', 'fork', 'new_record', 'comment')),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by everyone"
  ON public.activities FOR SELECT
  USING (true);

CREATE POLICY "System can insert activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_programs_best_val_bpb ON public.programs (best_val_bpb ASC NULLS LAST) WHERE is_public = true;
CREATE INDEX idx_programs_author_id ON public.programs (author_id);
CREATE INDEX idx_programs_forked_from ON public.programs (forked_from);
CREATE INDEX idx_programs_slug ON public.programs (slug);
CREATE INDEX idx_submissions_program_id ON public.submissions (program_id);
CREATE INDEX idx_submissions_val_bpb ON public.submissions (val_bpb ASC);
CREATE INDEX idx_comments_program_id ON public.comments (program_id);
CREATE INDEX idx_activities_created_at ON public.activities (created_at DESC);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, github_username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'user_name',
      NEW.raw_user_meta_data ->> 'preferred_username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'user_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update best_val_bpb on new submission
CREATE OR REPLACE FUNCTION public.update_best_val_bpb()
RETURNS TRIGGER AS $$
DECLARE
  current_best FLOAT;
  is_new_record BOOLEAN := false;
BEGIN
  -- Get current global best
  SELECT MIN(best_val_bpb) INTO current_best
  FROM public.programs
  WHERE is_public = true AND best_val_bpb IS NOT NULL;

  -- Update program's best
  UPDATE public.programs
  SET best_val_bpb = (
    SELECT MIN(val_bpb) FROM public.submissions WHERE program_id = NEW.program_id
  ),
  updated_at = now()
  WHERE id = NEW.program_id;

  -- Check if this is a new global record
  IF current_best IS NULL OR NEW.val_bpb < current_best THEN
    is_new_record := true;
  END IF;

  -- Log activity
  INSERT INTO public.activities (user_id, type, program_id, metadata)
  VALUES (
    NEW.user_id,
    CASE WHEN is_new_record THEN 'new_record' ELSE 'new_submission' END,
    NEW.program_id,
    jsonb_build_object('val_bpb', NEW.val_bpb, 'hardware', NEW.hardware)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_submission
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_best_val_bpb();

-- Increment fork_count and log activity on fork
CREATE OR REPLACE FUNCTION public.handle_fork()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.forked_from IS NOT NULL THEN
    UPDATE public.programs
    SET fork_count = fork_count + 1
    WHERE id = NEW.forked_from;

    INSERT INTO public.activities (user_id, type, program_id, metadata)
    VALUES (
      NEW.author_id,
      'fork',
      NEW.id,
      jsonb_build_object('forked_from_id', NEW.forked_from)
    );
  ELSE
    INSERT INTO public.activities (user_id, type, program_id)
    VALUES (NEW.author_id, 'new_program', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_program
  AFTER INSERT ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.handle_fork();

-- Log comment activity
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activities (user_id, type, program_id)
  VALUES (NEW.user_id, 'comment', NEW.program_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

-- ============================================
-- Storage bucket for training logs
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('training-logs', 'training-logs', true);

CREATE POLICY "Anyone can view training logs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'training-logs');

CREATE POLICY "Authenticated users can upload training logs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'training-logs' AND auth.role() = 'authenticated');
