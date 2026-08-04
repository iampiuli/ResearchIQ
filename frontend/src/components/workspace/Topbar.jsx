import { FileText, PanelLeft, PanelRightClose, PanelRightOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1"

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
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
        <PanelLeft className="size-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {hasWorkspace ? workspaceName : "No workspace selected"}
        </h1>
        {hasWorkspace && (
          <p className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {paperCount} {paperCount === 1 ? "Paper" : "Papers"}
          </p>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <Button variant="ghost" size="icon" className="xl:hidden" onClick={onOpenSource} aria-label="View source">
          <FileText className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden xl:inline-flex"
          onClick={onTogglePdfCollapse}
          aria-label={pdfCollapsed ? "Show source panel" : "Hide source panel"}
          title={pdfCollapsed ? "Show source panel" : "Hide source panel"}
        >
          {pdfCollapsed ? <PanelRightOpen className="size-4" /> : <PanelRightClose className="size-4" />}
        </Button>
        <button
          type="button"
          className={cn(
            "flex size-8 items-center justify-center rounded-full bg-indigo-600 text-white outline-none transition-transform duration-150 hover:scale-105 hover:shadow-md active:scale-95",
            FOCUS_RING
          )}
          aria-label="Account"
          title="Account"
        >
          <User className="size-4" strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
