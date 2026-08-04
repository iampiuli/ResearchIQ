import { Logo } from "@/components/shared/Logo"
import { GithubIcon } from "@/components/shared/icons"

export function Footer() {
  return (
    <footer id="about" className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo />
            <p className="text-sm text-muted-foreground">Built by Piuli Biswas</p>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">© 2026 ResearchIQ</p>
        </div>
      </div>
    </footer>
  )
}
