import { FlaskConical } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4" />
          <span>Labspace — O marketplace de pesquisa autônoma em IA</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Leaderboard
          </Link>
          <Link
            href="/feed"
            className="hover:text-foreground transition-colors"
          >
            Feed
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
