import { ArrowRight } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { GithubIcon, XIcon } from "@/components/shared/icons"

const PRODUCT_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "GitHub", href: "https://github.com", external: true },
]

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "X (Twitter)", href: "https://x.com", icon: XIcon },
]

export function Footer() {
  return (
    <footer id="about" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              AI-powered research assistant for reading, comparing, and citing academic papers
              faster — without losing the rigor.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon"
                  render={<a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} />}
                  nativeButton={false}
                  className="rounded-full"
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Product
              </p>
              <ul className="mt-4 space-y-3">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-3 sm:justify-between">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Get started
              </p>
              <Button render={<a href="#top" />} nativeButton={false} className="gap-2">
                Try ResearchIQ
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ResearchIQ. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built for researchers, by researchers.</p>
        </div>
      </div>
    </footer>
  )
}
