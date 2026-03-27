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
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FileText, Eye, Save } from "lucide-react"
import type { Program } from "@/types/database"

interface EditProgramFormProps {
  program: Program
}

export function EditProgramForm({ program }: EditProgramFormProps) {
  const [title, setTitle] = useState(program.title)
  const [description, setDescription] = useState(program.description ?? "")
  const [content, setContent] = useState(program.content)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    const { error: updateError } = await supabase
      .from("programs")
      .update({
        title,
        description: description || null,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", program.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push(`/program/${program.slug}`)
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program.md</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit">
            <TabsList className="mb-4">
              <TabsTrigger value="edit" className="gap-1">
                <FileText className="h-4 w-4" />
                Editar
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                required
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose prose-invert max-w-none border rounded-lg p-6 min-h-[300px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || !title || !content}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
