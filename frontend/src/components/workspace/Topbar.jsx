import { BookOpen, PanelLeft, PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Topbar({
  onOpenSidebar,
  onOpenSource,
  workspaceName,
  paperCount,
  hasWorkspace,
  pdfCollapsed,
  onTogglePdfCollapse,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
        <PanelLeft className="size-4" />
      </Button>

      <div className="flex min-w-0 flex-1 items-baseline gap-3">
        <h1 className="truncate font-serif text-[1.15rem] leading-none font-medium tracking-tight text-foreground">
          {hasWorkspace ? workspaceName : "No workspace selected"}
        </h1>
        {hasWorkspace && (
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            {paperCount} {paperCount === 1 ? "paper" : "papers"}
          </span>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="xl:hidden" onClick={onOpenSource} aria-label="View source">
          <BookOpen className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden xl:inline-flex"
          onClick={onTogglePdfCollapse}
          aria-label={pdfCollapsed ? "Show reader" : "Hide reader"}
          title={pdfCollapsed ? "Show reader" : "Hide reader"}
        >
          {pdfCollapsed ? <PanelRightOpen className="size-4" /> : <PanelRightClose className="size-4" />}
        </Button>
      </div>
    </header>
  )
}
