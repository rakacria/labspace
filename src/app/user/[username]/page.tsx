import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { GitFork, Trophy, Calendar, ExternalLink, TrendingDown, Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface UserPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: UserPageProps) {
  const { username } = await params
  return { title: `@${username} — Labspace` }
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!profile) notFound()

  const { data: programs } = await supabase
    .from("programs")
    .select(`*, parent:programs!programs_forked_from_fkey(id, title, slug)`)
    .eq("author_id", profile.id)
    .eq("is_public", true)
    .order("best_val_bpb", { ascending: true })

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const isOwnProfile = currentUser?.id === profile.id
  const totalForks = programs?.reduce((acc, p) => acc + p.fork_count, 0) ?? 0
  const bestProgram = programs?.[0]

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Left column: user info ── */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24">
            {/* Avatar */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
                <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center lg:text-left">
                <h1 className="text-2xl font-extrabold tracking-tight">{profile.username}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  github.com/{profile.github_username}
                </a>
              )}
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border p-3 text-center bg-card">
                <p className="text-xl font-bold">{programs?.length ?? 0}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Q&apos;s</p>
              </div>
              <div className="rounded-xl border p-3 text-center bg-card">
                <p className="text-xl font-bold">{totalForks}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Forks</p>
              </div>
              <div className="rounded-xl border p-3 text-center bg-card">
                <p className="text-lg font-bold font-mono text-green-600 truncate">
                  {bestProgram?.best_val_bpb?.toFixed(3) ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Best</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Center column: program list ── */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">
                Library <span className="text-muted-foreground font-normal text-base">({programs?.length ?? 0})</span>
              </h2>
            </div>
          </div>

          {!programs || programs.length === 0 ? (
            <div className="text-center py-20 border rounded-2xl bg-card text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No programs published yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <Link
                  key={program.id}
                  href={`/program/${program.slug}`}
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/30 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {program.title}
                    </p>
                    {program.parent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ↳ forked from{" "}
                        <span className="hover:underline">{program.parent.title}</span>
                      </p>
                    )}
                    {program.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {program.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {program.best_val_bpb !== null && (
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-green-600">
                          {program.best_val_bpb.toFixed(4)}
                        </span>
                        <div className="flex items-center justify-end gap-0.5">
                          <TrendingDown className="h-3 w-3 text-green-500" />
                          <span className="text-[10px] text-muted-foreground">val_bpb</span>
                        </div>
                      </div>
                    )}
                    {program.fork_count > 0 && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <GitFork className="h-3 w-3" />
                        {program.fork_count}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        {/* ── Right column: actions (own profile) or stats ── */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-24 flex flex-col gap-4">
            {isOwnProfile ? (
              <>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Your account
                  </p>
                  <Link
                    href="/submit"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "w-full rounded-full gap-1.5 font-bold"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Submit new Q
                  </Link>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Personal best
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-green-600">
                        {bestProgram?.best_val_bpb?.toFixed(4) ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">val_bpb</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Top result
                </p>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-green-600">
                      {bestProgram?.best_val_bpb?.toFixed(4) ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">val_bpb</p>
                  </div>
                </div>
                {bestProgram && (
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {bestProgram.title}
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
