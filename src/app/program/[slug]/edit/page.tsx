import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EditProgramForm } from "./edit-form"

interface EditPageProps {
  params: Promise<{ slug: string }>
}

export default async function EditProgramPage({ params }: EditPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) notFound()

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .eq("author_id", user.id)
    .single()

  if (!program) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Program</h1>
      <EditProgramForm program={program} />
    </div>
  )
}
