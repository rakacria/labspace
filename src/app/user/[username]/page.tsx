import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GitFork, Trophy, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UserPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: UserPageProps) {
  const { username } = await params
  return {
    title: `@${username} — Labspace`,
  }
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
    .select(
      `
      *,
      parent:programs!programs_forked_from_fkey(id, title, slug)
    `
    )
    .eq("author_id", profile.id)
    .eq("is_public", true)
    .order("best_val_bpb", { ascending: true })

  const totalForks =
    programs?.reduce((acc, p) => acc + p.fork_count, 0) ?? 0
  const bestProgram = programs?.[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Profile header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={profile.avatar_url ?? undefined}
            alt={profile.username}
          />
          <AvatarFallback className="text-2xl">
            {profile.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-muted-foreground mt-1">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
            {profile.github_username && (
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                {profile.github_username}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Membro{" "}
              {formatDistanceToNow(new Date(profile.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{programs?.length ?? 0}</p>
          <p className="text-sm text-muted-foreground">Programas</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{totalForks}</p>
          <p className="text-sm text-muted-foreground">Forks recebidos</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold font-mono text-green-500">
            {bestProgram?.best_val_bpb?.toFixed(4) ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground">Melhor val_bpb</p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Programs list */}
      <h2 className="text-xl font-bold mb-4">
        Programas ({programs?.length ?? 0})
      </h2>

      {!programs || programs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg text-muted-foreground">
          Nenhum programa publicado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <Link
                    href={`/program/${program.slug}`}
                    className="font-medium hover:underline"
                  >
                    {program.title}
                  </Link>
                  {program.parent && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ↳ fork de{" "}
                      <Link
                        href={`/program/${program.parent.slug}`}
                        className="hover:underline"
                      >
                        {program.parent.title}
                      </Link>
                    </p>
                  )}
                  {program.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {program.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {program.best_val_bpb !== null && (
                    <span className="font-mono font-bold text-green-500">
                      {program.best_val_bpb.toFixed(4)}
                    </span>
                  )}
                  {program.fork_count > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <GitFork className="h-3 w-3" />
                      {program.fork_count}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
