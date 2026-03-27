"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  GitFork,
  Cpu,
  FileText,
  MessageSquare,
  Network,
  Trophy,
  Share,
  Heart,
  PlayCircle,
  Star,
  ChevronLeft
} from "lucide-react"
import type { Program, Submission, Comment } from "@/types/database"
import { formatDistanceToNow } from "date-fns"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface ProgramContentProps {
  program: Program
  submissions: Submission[]
  forks: Array<{
    id: string
    title: string
    slug: string
    best_val_bpb: number | null
    author: { username: string; avatar_url: string | null } | null
  }>
  comments: Comment[]
  currentUserId: string | null
}

export function ProgramContent({
  program,
  submissions,
  forks,
  comments: initialComments,
  currentUserId,
}: ProgramContentProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleFork() {
    if (!currentUserId) {
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/program/${program.slug}`,
        },
      })
      return
    }

    const slug = `${program.slug}-fork-${Date.now().toString(36)}`

    const { data, error } = await supabase
      .from("programs")
      .insert({
        author_id: currentUserId,
        title: `Fork de ${program.title}`,
        slug,
        content: program.content,
        description: program.description,
        forked_from: program.id,
      })
      .select("slug")
      .single()

    if (!error && data) {
      router.push(`/program/${data.slug}/edit`)
    }
  }

  async function handleComment() {
    if (!currentUserId || !newComment.trim()) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from("comments")
      .insert({
        program_id: program.id,
        user_id: currentUserId,
        content: newComment.trim(),
      })
      .select("*, user:profiles!comments_user_id_fkey(*)")
      .single()

    if (!error && data) {
      setComments([...comments, data])
      setNewComment("")
    }
    setSubmitting(false)
  }

  // Generate color palette based on username length to give variety
  const authorName = program.author?.username || "Unknown"
  const gradientStr = useMemo(() => {
    const hsl1 = `${(authorName.length * 25) % 360}, 70%, 85%`
    const hsl2 = `${(authorName.length * 45) % 360}, 80%, 75%`
    return `linear-gradient(135deg, hsl(${hsl1}), hsl(${hsl2}))`
  }, [authorName])

  return (
    <div className="bg-[#FAF9F7] min-h-screen pb-16">
      {/* HEADER TOP (voltar, actions) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center px-2">
         <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white/80 backdrop-blur border-none shadow-sm hover:bg-white text-gray-700" onClick={() => router.push('/')}>
            <ChevronLeft className="h-5 w-5" />
         </Button>
         <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white/80 backdrop-blur border-none shadow-sm hover:bg-white text-gray-700">
               <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-white/80 backdrop-blur border-none shadow-sm hover:bg-white text-gray-700">
               <Share className="h-5 w-5" />
            </Button>
         </div>
      </div>

      {/* TOP BANNER / COVER */}
      <div className="relative w-full h-[400px] mb-8 overflow-hidden flex flex-col items-center justify-center pt-8 rounded-b-[40px] shadow-[0_10px_30px_rgb(0,0,0,0.05)]" style={{ background: gradientStr }}>
        
        {/* Fake Book Cover inside Banner */}
        <div className="relative w-[180px] h-[260px] shadow-[0_20px_40px_rgb(0,0,0,0.3)] rounded-r-lg rounded-l-sm mt-8 group transition-transform duration-300 hover:-translate-y-2 bg-white">
             {/* Book Binding/Ribbon */}
             <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-black/20 to-transparent z-20 rounded-l-sm" />
             <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

             {program.author?.avatar_url ? (
               <img src={program.author.avatar_url} alt="Cover" className="w-full h-full object-cover rounded-r-lg rounded-l-sm" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white rounded-r-lg rounded-l-sm">
                 <h2 className="text-xl font-bold px-4 text-center break-words leading-tight">{program.title}</h2>
               </div>
             )}

             {/* Play button overlay from the design */}
             <div className="absolute inset-0 flex items-center justify-center z-30">
                 <Button variant="default" size="icon" className="h-14 w-14 rounded-full bg-primary/90 text-primary-foreground hover:scale-110 transition-transform shadow-xl border-[3px] border-white/40">
                     <PlayCircle className="h-7 w-7 ml-1" />
                 </Button>
             </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16">
          <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 text-center relative z-10 mx-auto max-w-3xl">
             
             {/* Title & Author */}
             <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight mb-3">
                {program.title}
             </h1>
             <p className="text-muted-foreground flex items-center justify-center gap-2 mb-8">
                By <span className="font-semibold text-primary">{program.author?.username || 'Unknown'}</span>
                • <time className="text-sm opacity-80">{new Date(program.created_at).getFullYear()}</time>
             </p>

             {/* Price / Stats Ribbon */}
             <div className="flex justify-center items-center gap-6 md:gap-10 mb-8 border-y border-slate-100 py-6">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Val BPB</span>
                    <div className="text-2xl font-black text-slate-900">
                        {program.best_val_bpb !== null ? (
                          <span className="flex items-center gap-1">
                             R$ {(program.best_val_bpb * 100).toFixed(2)}
                          </span>
                        ) : '---'}
                    </div>
                 </div>

                 <div className="w-px h-10 bg-slate-200" />

                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Reviews</span>
                    <div className="text-xl font-bold text-slate-900 flex items-center gap-1">
                        4.8 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 -mt-0.5" />
                    </div>
                 </div>

                 <div className="w-px h-10 bg-slate-200" />

                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Forks</span>
                    <div className="text-xl font-bold text-slate-900 flex items-center gap-1">
                        {program.fork_count} <GitFork className="w-4 h-4 text-emerald-500 -mt-0.5" />
                    </div>
                 </div>
             </div>

             {/* CTA Buttons */}
             <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                 <Button className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform" onClick={handleFork}>
                     <GitFork className="mr-2 h-5 w-5" /> Fork this book
                 </Button>
                 {program.parent && (
                    <Link 
                       href={`/program/${program.parent.slug}`}
                       className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-full hover:bg-slate-50 transition-colors flex items-center justify-center")}
                    >
                        Original
                    </Link>
                 )}
             </div>

             {/* Description */}
             <div className="mt-12 text-left">
                <h3 className="text-xl font-bold text-slate-800 mb-4 font-serif">Synopsis</h3>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                   {program.description || "No description provided for this work. It remains a mystery wrapped in an enigma."}
                </p>
             </div>
          </div>

          {/* TAB CONTENT SECTION */}
          <div className="mt-12 mx-auto max-w-4xl px-0 sm:px-2">
             <Tabs defaultValue="program" className="w-full">
                <TabsList className="w-full justify-start h-auto p-1.5 bg-white/60 backdrop-blur border border-slate-200 rounded-full mb-8 overflow-x-auto shadow-sm">
                   <TabsTrigger value="program" className="rounded-full px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                     <FileText className="h-4 w-4 mr-2 hidden sm:block" /> Chapter 1
                   </TabsTrigger>
                   <TabsTrigger value="results" className="rounded-full px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                     <Trophy className="h-4 w-4 mr-2 hidden sm:block" /> Results
                   </TabsTrigger>
                   <TabsTrigger value="lineage" className="rounded-full px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                     <Network className="h-4 w-4 mr-2 hidden sm:block" /> Lineage
                   </TabsTrigger>
                   <TabsTrigger value="comments" className="rounded-full px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                     <MessageSquare className="h-4 w-4 mr-2 hidden sm:block" /> Discussion
                   </TabsTrigger>
                </TabsList>

                <TabsContent value="program" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Card className="rounded-[32px] overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                      <CardTitle className="font-serif text-2xl text-slate-800">The Source Code</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {program.content || "*No content*"}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="results" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Card className="rounded-[32px] overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                      <CardTitle className="font-serif text-2xl text-slate-800">Evaluation Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-100">
                      {submissions.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <Cpu className="h-12 w-12 text-slate-200 mb-4" />
                            <p>No evaluations submitted yet.</p>
                        </div>
                      ) : (
                        submissions.map((sub) => (
                          <div key={sub.id} className="p-6 md:px-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                             <div>
                               <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="default" className="rounded-md px-2">
                                    Completed
                                  </Badge>
                                  <span className="text-sm font-medium text-slate-500">
                                    {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                                  </span>
                               </div>
                               <div className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1.5 rounded-md inline-block">
                                  val_bpb: {sub.val_bpb !== null ? sub.val_bpb.toFixed(4) : "—"}
                               </div>
                             </div>
                             {sub.log_url && (
                                <a href={sub.log_url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full font-semibold")}>View Logs</a>
                             )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lineage" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Card className="rounded-[32px] overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                      <CardTitle className="font-serif text-2xl text-slate-800">Forks & Derivatives</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-slate-100">
                      {forks.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                          No forks created yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                           {forks.map((fork) => (
                             <Link key={fork.id} href={`/program/${fork.slug}`}>
                                <div className="p-5 border border-slate-100 rounded-[20px] hover:border-primary/40 hover:shadow-md transition-all h-full bg-slate-50/30">
                                   <div className="flex items-center gap-2 mb-3">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={fork.author?.avatar_url ?? undefined} />
                                        <AvatarFallback>{fork.author?.username?.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium text-sm text-slate-700">{fork.author?.username}</span>
                                   </div>
                                   <h4 className="font-bold text-slate-900 mb-3 truncate">{fork.title}</h4>
                                   <div className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 inline-block text-slate-500">
                                      val: {fork.best_val_bpb?.toFixed(4) ?? "—"}
                                   </div>
                                </div>
                             </Link>
                           ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comments" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <Card className="rounded-[32px] overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                      <CardTitle className="font-serif text-2xl text-slate-800">Community Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                      {currentUserId ? (
                        <div className="mb-10 flex gap-4 items-start">
                          <Avatar className="h-10 w-10 border mt-1 shadow-sm">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <Textarea
                              placeholder="Write a review..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="rounded-[20px] resize-none min-h-[100px] border-slate-200 focus-visible:ring-primary/20 bg-slate-50/50 p-4"
                            />
                            <div className="flex justify-end">
                                <Button 
                                  onClick={handleComment} 
                                  disabled={!newComment.trim() || submitting}
                                  className="rounded-full px-8 shadow-sm font-semibold"
                                >
                                  {submitting ? "Publishing..." : "Publish Review"}
                                </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-primary/5 rounded-[20px] p-6 mb-8 text-center text-primary/80 border border-primary/10">
                          <Link href="/login" className="font-bold hover:underline">Log in</Link> para deixar um review.
                        </div>
                      )}

                      <div className="space-y-6">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-10 w-10 border shadow-sm">
                              <AvatarImage
                                src={comment.user?.avatar_url ?? undefined}
                                alt={comment.user?.username}
                              />
                            </Avatar>
                            <div className="flex-1 bg-slate-50 rounded-[24px] rounded-tl-none p-5 border border-slate-100">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-slate-900">
                                  {comment.user?.username}
                                </span>
                                <span className="text-xs text-slate-400 font-medium tracking-wide">
                                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
             </Tabs>
          </div>
      </div>
    </div>
  )
}