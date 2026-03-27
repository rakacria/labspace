import { createClient } from "@/lib/supabase/server"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { FlaskConical, Trophy, GitFork, TrendingDown, Search, Compass } from "lucide-react"
import Link from "next/link"

export const revalidate = 30

export default async function HomePage() {
  const supabase = await createClient()

  const { data: programs } = await supabase
    .from("programs")
    .select(
      `
      *,
      author:profiles!programs_author_id_fkey(*),
      parent:programs!programs_forked_from_fkey(id, title, slug)
    `
    )
    .eq("is_public", true)
    .not("best_val_bpb", "is", null)
    .order("best_val_bpb", { ascending: true })
    .limit(10)

  const entries =
    programs?.map((p, i) => ({
      ...p,
      rank: i + 1,
    })) ?? []

  const totalPrograms = entries.length
  const totalForks = entries.reduce((acc, e) => acc + e.fork_count, 0)
  const bestBpb = entries[0]?.best_val_bpb ?? null

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="absolute inset-0 bg-grid-black/[0.02]" />
        <div className="relative px-6 py-20 text-center flex flex-col items-center justify-center">
          <FlaskConical className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Labspace
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Share, discover, and compete with autonomous AI research programs.
          </p>

          <div className="w-full max-w-md relative">
            <input
              type="text"
              placeholder="Search programs..."
              className="w-full rounded-full pl-6 pr-12 py-4 bg-background shadow-lg outline-none ring-1 ring-border focus:ring-primary focus:ring-2 transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Link href="/discover" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              <Compass className="h-4 w-4" />
              Discover activity
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/leaderboard" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Full leaderboard
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top 10</h2>
            <Link href="/leaderboard" className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
              View all <Trophy className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!entries || entries.length === 0 ? (
            <div className="text-center py-20 border rounded-2xl bg-card shadow-sm">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No programs yet</h3>
              <p className="text-muted-foreground mt-1">
                Be the first to submit a program!
              </p>
            </div>
          ) : (
            <LeaderboardTable entries={entries} />
          )}
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Stats</h2>
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-foreground/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best val_bpb</p>
                    <p className="font-bold text-lg">{bestBpb !== null ? bestBpb.toFixed(4) : "—"}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-foreground/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Programs</p>
                    <p className="font-bold text-lg">{totalPrograms}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-foreground/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <GitFork className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total forks</p>
                    <p className="font-bold text-lg">{totalForks}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

