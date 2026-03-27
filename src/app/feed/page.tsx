import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Rss,
  FlaskConical,
  GitFork,
  Trophy,
  MessageSquare,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ActivityType } from "@/types/database"

export const revalidate = 15

const activityConfig: Record<
  ActivityType,
  { icon: React.ElementType; label: string; color: string }
> = {
  new_program: {
    icon: FlaskConical,
    label: "submeteu novo programa",
    color: "text-blue-500",
  },
  new_submission: {
    icon: TrendingDown,
    label: "submeteu resultado",
    color: "text-green-500",
  },
  fork: {
    icon: GitFork,
    label: "fez fork de um programa",
    color: "text-purple-500",
  },
  new_record: {
    icon: Trophy,
    label: "bateu o recorde!",
    color: "text-yellow-500",
  },
  comment: {
    icon: MessageSquare,
    label: "comentou",
    color: "text-muted-foreground",
  },
}

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from("activities")
    .select(
      `
      *,
      user:profiles!activities_user_id_fkey(*),
      program:programs!activities_program_id_fkey(id, title, slug)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Rss className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Feed</h1>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
          <Rss className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma atividade ainda</h3>
          <p className="text-muted-foreground mt-1">
            Quando programas forem submetidos, a atividade aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const config =
              activityConfig[activity.type as ActivityType] ??
              activityConfig.new_program
            const Icon = config.icon

            return (
              <Card key={activity.id}>
                <CardContent className="flex items-start gap-3 py-4">
                  <div
                    className={`mt-0.5 rounded-full p-2 bg-muted ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link
                        href={`/user/${activity.user?.username}`}
                        className="font-medium hover:underline"
                      >
                        @{activity.user?.username}
                      </Link>{" "}
                      {config.label}
                      {activity.program && (
                        <>
                          {" "}
                          <Link
                            href={`/program/${activity.program.slug}`}
                            className="font-medium hover:underline text-primary"
                          >
                            {activity.program.title}
                          </Link>
                        </>
                      )}
                    </p>
                    {activity.type === "new_record" &&
                      activity.metadata?.val_bpb && (
                        <Badge className="mt-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Trophy className="h-3 w-3 mr-1" />
                          val_bpb:{" "}
                          {(activity.metadata.val_bpb as number).toFixed(4)}
                        </Badge>
                      )}
                    {activity.type === "new_submission" &&
                      activity.metadata?.val_bpb && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-green-500"
                        >
                          val_bpb:{" "}
                          {(activity.metadata.val_bpb as number).toFixed(4)}
                        </Badge>
                      )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={activity.user?.avatar_url ?? undefined}
                      alt={activity.user?.username}
                    />
                    <AvatarFallback className="text-xs">
                      {activity.user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
