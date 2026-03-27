import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProgramContent } from "./program-content"

interface ProgramPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProgramPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: program } = await supabase
    .from("programs")
    .select("title, description")
    .eq("slug", slug)
    .single()

  if (!program) return { title: "Program not found" }

  return {
    title: `${program.title} — Labspace`,
    description: program.description,
  }
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: program } = await supabase
    .from("programs")
    .select(
      `
      *,
      author:profiles!programs_author_id_fkey(*),
      parent:programs!programs_forked_from_fkey(id, title, slug)
    `
    )
    .eq("slug", slug)
    .single()

  if (!program) notFound()

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, user:profiles!submissions_user_id_fkey(*)")
    .eq("program_id", program.id)
    .order("val_bpb", { ascending: true })

  const { data: rawForks } = await supabase
    .from("programs")
    .select("id, title, slug, best_val_bpb, author:profiles!programs_author_id_fkey(username, avatar_url)")
    .eq("forked_from", program.id)
    .order("best_val_bpb", { ascending: true })

  const forks = (rawForks ?? []).map((f: any) => ({
    ...f,
    author: Array.isArray(f.author) ? f.author[0] ?? null : f.author,
  }))

  const { data: comments } = await supabase
    .from("comments")
    .select("*, user:profiles!comments_user_id_fkey(*)")
    .eq("program_id", program.id)
    .order("created_at", { ascending: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <ProgramContent
      program={program}
      submissions={submissions ?? []}
      forks={forks}
      comments={comments ?? []}
      currentUserId={user?.id ?? null}
    />
  )
}
