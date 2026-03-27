"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FileText, Eye, Upload, FlaskConical } from "lucide-react"

export default function SubmitPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [valBpb, setValBpb] = useState("")
  const [hardware, setHardware] = useState("")
  const [runtimeMin, setRuntimeMin] = useState("")
  const [notes, setNotes] = useState("")
  const [logFile, setLogFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("You need to be signed in to submit.")
        setSubmitting(false)
        return
      }

      const slug = `${generateSlug(title)}-${Date.now().toString(36)}`

      // Upload log file if provided
      let logUrl: string | null = null
      if (logFile) {
        const filePath = `${user.id}/${slug}/${logFile.name}`
        const { error: uploadError } = await supabase.storage
          .from("training-logs")
          .upload(filePath, logFile)
        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("training-logs").getPublicUrl(filePath)
          logUrl = publicUrl
        }
      }

      // Create program
      const { data: program, error: programError } = await supabase
        .from("programs")
        .insert({
          author_id: user.id,
          title,
          slug,
          content,
          description: description || null,
        })
        .select("id, slug")
        .single()

      if (programError) {
        setError(programError.message)
        setSubmitting(false)
        return
      }

      // Create submission with result
      if (valBpb) {
        const { error: subError } = await supabase.from("submissions").insert({
          program_id: program.id,
          user_id: user.id,
          val_bpb: parseFloat(valBpb),
          hardware: hardware || null,
          runtime_s: runtimeMin ? parseInt(runtimeMin) * 60 : null,
          notes: notes || null,
          log_url: logUrl,
        })
        if (subError) {
          setError(subError.message)
          setSubmitting(false)
          return
        }
      }

      router.push(`/program/${program.slug}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <FlaskConical className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Submit Program</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program info */}
        <Card>
          <CardHeader>
            <CardTitle>Program Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Ex: GLU-sweep-v1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Short description</Label>
              <Input
                id="description"
                placeholder="e.g. Exploring GLU variants for 46M models"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Program.md content */}
        <Card>
          <CardHeader>
            <CardTitle>Program.md *</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList className="mb-4">
                <TabsTrigger value="edit" className="gap-1">
                  <FileText className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <Textarea
                  placeholder="Paste or write your program.md here... (Markdown)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="prose prose-invert max-w-none border rounded-lg p-6 min-h-[300px]">
                  {content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">
                      Nothing to preview yet...
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle>Result (optional for now)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="val_bpb">val_bpb</Label>
                <Input
                  id="val_bpb"
                  type="number"
                  step="0.0001"
                  placeholder="Ex: 1.0780"
                  value={valBpb}
                  onChange={(e) => setValBpb(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hardware">Hardware</Label>
                <Input
                  id="hardware"
                  placeholder="Ex: 1x A100 80GB"
                  value={hardware}
                  onChange={(e) => setHardware(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="runtime">Runtime (minutes)</Label>
                <Input
                  id="runtime"
                  type="number"
                  placeholder="Ex: 120"
                  value={runtimeMin}
                  onChange={(e) => setRuntimeMin(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes about the experiment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="log">Upload training log</Label>
              <Input
                id="log"
                type="file"
                accept=".txt,.log,.csv,.json,.jsonl"
                onChange={(e) => setLogFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: .txt, .log, .csv, .json, .jsonl
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title || !content}>
            <Upload className="h-4 w-4 mr-1" />
            {submitting ? "Submitting..." : "Submit program"}
          </Button>
        </div>
      </form>
    </div>
  )
}
