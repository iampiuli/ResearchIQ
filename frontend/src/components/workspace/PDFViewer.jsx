import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ANNOTATION_MARKERS = [16, 38, 64, 82]

const LINE_SETS = [
  ["60%", "100%", "92%", "78%"],
  ["45%", "95%", "88%", "70%", "60%"],
  ["70%", "100%", "85%", "50%"],
]

function TextLine({ width, tone = "gray" }) {
  return (
    <div
      className={cn("h-2 rounded-full", tone === "gray" ? "bg-gray-100" : "bg-indigo-200/70")}
      style={{ width }}
    />
  )
}

function PageSkeleton({ page, showCitation }) {
  const lines = LINE_SETS[page % LINE_SETS.length]

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="h-3 w-2/5 rounded-full bg-gray-200" />
        <div className="h-2 w-1/5 rounded-full bg-gray-100" />
      </div>

      <div className="space-y-2">
        {lines.map((width, i) => (
          <TextLine key={i} width={width} />
        ))}
      </div>

      {/* A user-made highlighter mark — distinct from the AI citation highlight below. */}
      <div className="space-y-1.5 rounded-sm bg-amber-100/80 px-1.5 py-1.5">
        <div className="h-2 w-[88%] rounded-full bg-amber-300/60" />
        <div className="h-2 w-[64%] rounded-full bg-amber-300/60" />
      </div>

      <div className="space-y-2">
        <TextLine width="82%" />
        <TextLine width="96%" />
      </div>

      {showCitation && (
        <div className="space-y-2 rounded-md border-l-2 border-indigo-500 bg-indigo-50/70 py-2 pl-3 pr-2">
          <TextLine width="92%" tone="indigo" />
          <TextLine width="80%" tone="indigo" />
          <TextLine width="60%" tone="indigo" />
          <span className="mt-1 inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">
            Cited in answer
          </span>
        </div>
      )}

      <div className="space-y-2">
        {[...lines].reverse().map((width, i) => (
          <TextLine key={i} width={width} />
        ))}
      </div>
    </div>
  )
}

function ZoomControls({ zoom, onZoomIn, onZoomOut }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-white shadow-xs">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none"
        onClick={onZoomOut}
        disabled={zoom <= 50}
        aria-label="Zoom out"
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-11 border-x border-border text-center text-xs tabular-nums text-muted-foreground">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none"
        onClick={onZoomIn}
        disabled={zoom >= 200}
        aria-label="Zoom in"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}

function PageControls({ page, totalPages, onPrevPage, onNextPage }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-white shadow-xs">
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none"
        onClick={onPrevPage}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3.5" />
      </Button>
      <span className="border-x border-border px-2.5 text-xs tabular-nums text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none"
        onClick={onNextPage}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  )
}

export function PDFViewer({
  paper,
  page,
  zoom,
  highlightedPage,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onClose,
}) {
  if (!paper) return null

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-sm leading-snug font-semibold text-foreground" title={paper.title}>
            {paper.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {paper.authors} · {paper.journal} · {paper.year}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="Close preview">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
        <PageControls page={page} totalPages={paper.pages} onPrevPage={onPrevPage} onNextPage={onNextPage} />
      </div>

      <div className="relative flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="pointer-events-none absolute inset-y-6 left-2 hidden w-2 sm:block">
          {ANNOTATION_MARKERS.map((top) => (
            <span
              key={top}
              className="absolute size-2 rounded-full bg-indigo-400 shadow-[0_0_0_2px_white]"
              style={{ top: `${top}%` }}
              title="Highlighted citation"
            />
          ))}
        </div>

        <div
          className="mx-auto origin-top rounded-lg border border-border bg-white p-8 shadow-sm transition-transform"
          style={{ width: "min(100%, 480px)", transform: `scale(${zoom / 100})` }}
        >
          <PageSkeleton page={page} showCitation={page === highlightedPage} />
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium tabular-nums text-muted-foreground shadow-sm">
            {page} / {paper.pages}
          </span>
        </div>
      </div>
    </div>
  )
}
