import { FileText, Loader2, PanelLeft, Search, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1"

export function Topbar({ onOpenSidebar, onOpenSource, onUploadClick, isUploading, uploadDisabled }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-white px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
        <PanelLeft className="size-4" />
      </Button>

      <button
        type="button"
        className={cn(
          "flex max-w-md flex-1 items-center gap-2.5 rounded-xl border border-border bg-muted px-3.5 py-2.5 text-sm text-muted-foreground shadow-xs outline-none transition-all duration-150 hover:border-gray-300 hover:bg-white hover:shadow-sm",
          FOCUS_RING
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={2} />
        <span className="flex-1 truncate text-left font-normal text-muted-foreground">
          Search papers, workspaces…
        </span>
        <kbd className="hidden shrink-0 rounded-md border border-border bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-1.5 rounded-lg shadow-xs sm:inline-flex"
          onClick={onUploadClick}
          disabled={isUploading || uploadDisabled}
        >
          {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          {isUploading ? "Uploading…" : "Upload"}
        </Button>
        <Button variant="ghost" size="icon" className="xl:hidden" onClick={onOpenSource} aria-label="View source">
          <FileText className="size-4" />
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
