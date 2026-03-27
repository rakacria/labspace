import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, GitFork, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const revalidate = 30

const PAGE_SIZE = 100

interface LeaderboardPageProps {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata() {
  return { title: "Leaderboard — Labspace" }
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1"))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  const { data: programs, count } = await supabase
    .from("programs")
    .select(
      `
      *,
      author:profiles!programs_author_id_fkey(*),
      parent:programs!programs_forked_from_fkey(id, title, slug)
    `,
      { count: "exact" }
    )
    .eq("is_public", true)
    .not("best_val_bpb", "is", null)
    .order("best_val_bpb", { ascending: true })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const entries = programs ?? []
  const globalOffset = from

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {count ?? 0} submissions ranked by lowest val_bpb
          </p>
        </div>
        {totalPages > 1 && (
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-24 border rounded-2xl bg-card">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No submissions yet</h3>
          <p className="text-muted-foreground mt-1">Be the first to submit a program!</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden bg-card shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1fr_auto] gap-4 px-5 py-3 border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span className="text-center">#</span>
            <span>Program</span>
            <span className="text-right">val_bpb</span>
          </div>

          {entries.map((entry, i) => {
            const rank = globalOffset + i + 1
            return (
              <Link
                key={entry.id}
                href={`/program/${entry.slug}`}
                className="grid grid-cols-[48px_1fr_auto] gap-4 px-5 py-4 border-b last:border-b-0 items-center hover:bg-muted/30 transition-colors group"
              >
                {/* Rank */}
                <span
                  className={cn(
                    "text-center font-bold text-sm",
                    rank === 1 && "text-yellow-500",
                    rank === 2 && "text-slate-400",
                    rank === 3 && "text-amber-600",
                    rank > 3 && "text-muted-foreground"
                  )}
                >
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </span>

                {/* Program info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0 rounded-lg border">
                    <AvatarImage src={entry.author?.avatar_url ?? undefined} />
                    <AvatarFallback className="rounded-lg text-xs font-bold bg-primary/10 text-primary">
                      {entry.author?.username?.slice(0, 2).toUpperCase() ?? "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {entry.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        @{entry.author?.username ?? "unknown"}
                      </span>
                      {entry.parent && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          <GitFork className="h-2.5 w-2.5 mr-0.5" />
                          fork
                        </Badge>
                      )}
                      {entry.fork_count > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <GitFork className="h-3 w-3" />
                          {entry.fork_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-green-600">
                    {entry.best_val_bpb?.toFixed(4) ?? "—"}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] text-muted-foreground">val_bpb</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 ? (
            <Link
              href={`/leaderboard?page=${page - 1}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1")}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1 opacity-40 pointer-events-none")}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          )}

          <span className="text-sm text-muted-foreground px-4">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/leaderboard?page=${page + 1}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1")}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1 opacity-40 pointer-events-none")}>
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      )}
    </div>
  )
}
