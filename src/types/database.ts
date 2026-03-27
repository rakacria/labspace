export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  github_username: string | null
  created_at: string
}

export type Program = {
  id: string
  author_id: string
  title: string
  slug: string
  content: string
  description: string | null
  forked_from: string | null
  fork_count: number
  best_val_bpb: number | null
  is_public: boolean
  created_at: string
  updated_at: string
  // joined
  author?: Profile
  parent?: Pick<Program, "id" | "title" | "slug"> | null
}

export type Submission = {
  id: string
  program_id: string
  user_id: string
  val_bpb: number
  hardware: string | null
  runtime_s: number | null
  notes: string | null
  log_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  // joined
  user?: Profile
  program?: Pick<Program, "id" | "title" | "slug">
}

export type Comment = {
  id: string
  program_id: string
  user_id: string
  content: string
  created_at: string
  // joined
  user?: Profile
}

export type ActivityType =
  | "new_program"
  | "new_submission"
  | "fork"
  | "new_record"
  | "comment"

export type Activity = {
  id: string
  user_id: string
  type: ActivityType
  program_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  // joined
  user?: Profile
  program?: Pick<Program, "id" | "title" | "slug">
}

export type LeaderboardEntry = Program & {
  author: Profile
  rank: number
}
