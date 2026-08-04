import { FileStack, FileText, MessageSquareText, Quote } from "lucide-react"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"

const HIGHLIGHTS = [
  { icon: MessageSquareText, label: "AI Chat" },
  { icon: FileText, label: "PDF Viewer" },
  { icon: Quote, label: "Grounded Citations" },
  { icon: FileStack, label: "Multi-paper Workspace" },
]

export function WorkspacePreview() {
  return (
    <section id="workspace" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>Workspace</SectionBadge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            One workspace, every paper
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            Sources, the PDF viewer, and AI chat live side by side, so you never lose context
            switching between papers.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="surface-strong overflow-hidden rounded-2xl">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="size-2.5 rounded-full bg-gray-200" />
              <span className="size-2.5 rounded-full bg-gray-200" />
              <span className="size-2.5 rounded-full bg-gray-200" />
              <span className="ml-3 text-xs text-muted-foreground">researchiq.app/workspace</span>
            </div>

            <img
              src="/screenshots/workspace.webp"
              alt="The ResearchIQ workspace, showing the paper library sidebar, an AI chat answer with citation chips, and the PDF viewer open side by side"
              className="block w-full h-auto"
              width={1680}
              height={880}
            />
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-md bg-indigo-50">
                <Icon className="size-3.5 text-indigo-600" strokeWidth={1.75} />
              </span>
              {label}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
