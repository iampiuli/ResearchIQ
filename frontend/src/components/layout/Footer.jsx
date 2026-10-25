import { Logo } from "@/components/shared/Logo"
import { GithubIcon } from "@/components/shared/icons"

export function Footer() {
  return (
    <footer id="about" className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-10 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-[13px] text-muted-foreground">Built by Piuli Biswas · © 2026</p>
        </div>

        <a
          href="https://github.com/iampiuli/ResearchIQ"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-2 rounded text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <GithubIcon className="size-4" />
          GitHub
        </a>
      </div>
    </footer>
  )
}
