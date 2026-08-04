import { useEffect, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ChevronLeft, ChevronRight, FileWarning, Minus, Plus, X } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

function ZoomControls({ zoom, onZoomIn, onZoomOut }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-card shadow-xs">
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
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-card shadow-xs">
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
        Page {page} of {totalPages ?? "…"}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-none"
        onClick={onNextPage}
        disabled={!totalPages || page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  )
}

/** Page-shaped shimmer standing in for a PDF page while it loads or re-renders. */
function PageSkeleton() {
  return (
    <div className="mx-auto flex aspect-[8.5/11] w-[280px] animate-pulse flex-col gap-3 rounded-sm border border-border bg-card p-6 shadow-sm sm:w-[340px]">
      <div className="h-3 w-2/3 rounded bg-muted" />
      <div className="mt-3 h-2 w-full rounded bg-muted" />
      <div className="h-2 w-full rounded bg-muted" />
      <div className="h-2 w-5/6 rounded bg-muted" />
      <div className="mt-4 h-2 w-full rounded bg-muted" />
      <div className="h-2 w-full rounded bg-muted" />
      <div className="h-2 w-3/4 rounded bg-muted" />
      <div className="mt-4 h-28 w-full rounded bg-muted" />
    </div>
  )
}

function DocumentError() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
      <FileWarning className="size-6 text-red-400" />
      <p className="font-medium text-foreground">Couldn't load this PDF.</p>
      <p className="max-w-[220px] text-xs">The file may be missing or the server may be unreachable.</p>
    </div>
  )
}

export function PDFViewer({
  paper,
  page,
  zoom,
  highlightedPage,
  numPages,
  onDocumentLoad,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onClose,
}) {
  useEffect(() => {
    onDocumentLoad?.(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper?.id])

  const fileProp = useMemo(() => (paper?.fileUrl ? { url: paper.fileUrl } : null), [paper?.fileUrl])

  if (!paper) return null

  const subtitle = [paper.authors, paper.journal, paper.year].filter(Boolean).join(" · ")

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-sm leading-snug font-semibold text-foreground" title={paper.title}>
            {paper.title}
          </p>
          {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="Close preview">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
        <PageControls page={page} totalPages={numPages} onPrevPage={onPrevPage} onNextPage={onNextPage} />
      </div>

      <div className="relative flex-1 overflow-auto bg-gray-50 p-6">
        {highlightedPage != null && highlightedPage === page && (
          <div className="mx-auto mb-3 flex max-w-fit items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
            <AlertCircle className="size-3" />
            Cited in answer
          </div>
        )}

        <div className="mx-auto w-fit">
          {fileProp ? (
            <Document
              file={fileProp}
              onLoadSuccess={({ numPages: loadedPages }) => onDocumentLoad?.(loadedPages)}
              onLoadError={() => onDocumentLoad?.(0)}
              loading={<PageSkeleton />}
              error={<DocumentError />}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${paper.id}-${page}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Page
                    pageNumber={page}
                    scale={zoom / 100}
                    loading={<PageSkeleton />}
                    error={<DocumentError />}
                    className="shadow-sm"
                  />
                </motion.div>
              </AnimatePresence>
            </Document>
          ) : (
            <DocumentError />
          )}
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium tabular-nums text-muted-foreground shadow-sm">
            {page} / {numPages ?? "…"}
          </span>
        </div>
      </div>
    </div>
  )
}
