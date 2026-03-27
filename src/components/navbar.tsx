"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"    
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FlaskConical, LogOut, Plus, User } from "lucide-react"
import type { Profile } from "@/types/database"

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [supabase.auth])

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setProfile(null)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b-[0.5px] border-black/5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-800"> 
            <FlaskConical className="h-6 w-6 text-primary" />
            Labspace
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/feed"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              My Library
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />     
          ) : profile ? (
            <>
              <Link href="/submit" className={buttonVariants({ size: "sm", className: "rounded-full hidden sm:flex font-bold" })}>  
                <Plus className="h-4 w-4 mr-1" />
                Publish
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="relative h-10 w-10 rounded-full cursor-pointer focus:outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all shadow-sm"      
                >
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarImage
                      src={profile.avatar_url ?? undefined}
                      alt={profile.username}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-[0_10px_40px_rgb(0,0,0,0.08)] border-slate-100 mt-2">
                  <div className="px-2 py-2 mb-2 border-b border-slate-50">
                    <p className="font-bold text-slate-800 text-sm">{profile.username}</p>
                    <p className="text-xs text-slate-400">Scientist</p>
                  </div>
                  <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 mb-1">
                    <Link href={`/user/${profile.username}`} className="flex items-center w-full text-slate-600 font-medium">
                      <User className="mr-3 h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-600 focus:text-red-700 py-2.5 font-medium hover:bg-red-50">
                    <LogOut className="mr-3 h-4 w-4 opacity-70" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={handleLogin} size="sm" variant="outline" className="rounded-full font-bold border-slate-200">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
