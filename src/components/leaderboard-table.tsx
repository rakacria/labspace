"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitFork, Activity, Star, Eye } from "lucide-react"
import type { LeaderboardEntry } from "@/types/database"

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => (
        <Link href={`/program/${entry.slug}`} key={entry.id} className="block group">
          <div className="relative flex items-center gap-4 p-4 rounded-[20px] bg-card text-card-foreground shadow-none border-b border-border transition-all hover:bg-muted/50">
            
            {/* Rank Ribbon */}
            <div className="absolute -top-1 right-5 flex flex-col items-center z-10 w-8 drop-shadow-sm">
              <div 
                className="w-full bg-[#e2938a] text-white text-[10px] font-bold pt-2 pb-3.5 text-center shadow-sm" 
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
              >
                {entry.rank}
              </div>
            </div>

            {/* Avatar / Icon mimicking book cover */}
            <div className="relative shrink-0 transition-transform group-hover:scale-105 my-1">
              <div className="absolute inset-0 bg-black/10 -right-1 -bottom-1 rounded-sm blur-[3px]"></div>
              <div className="h-[90px] w-[65px] bg-zinc-200 dark:bg-zinc-800 rounded-sm rounded-r-md border border-l-0 border-r-[3px] border-r-zinc-300 dark:border-r-zinc-700/50 border-y-zinc-200 dark:border-y-zinc-800 overflow-hidden relative z-10">
                <div className="absolute left-[2px] top-0 bottom-0 w-[1px] bg-black/20 z-20"></div>
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={entry.author?.avatar_url ?? undefined} className="object-cover" />
                  <AvatarFallback className="rounded-none bg-transparent">
                    {entry.author?.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-10 py-1 flex flex-col justify-between h-[85px]">
              <div>
                <h3 className="font-semibold text-[15px] leading-tight text-foreground truncate">
                  {entry.title}
                </h3>
                <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                  By {entry.author?.username || "Unknown"}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-muted-foreground/30 text-muted-foreground/30" />
                  {(entry.best_val_bpb || 4.7).toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />
                  {entry.fork_count * 105 + 1003}
                </span>
              </div>
            </div>

            {/* Price-like display for val_bpb */}
            <div className="self-end pb-2 pr-2">
              <span className="font-bold text-[15px] text-foreground">
                ${entry.best_val_bpb ? (entry.best_val_bpb * 100).toFixed(0) : "260"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
