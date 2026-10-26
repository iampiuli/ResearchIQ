import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, FileWarning, Highlighter, Minus, Plus, X } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { fetchPdfBlobUrl } from "@/lib/api"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

/** Fetches the PDF with the user's token (an <iframe>/URL can't send headers) and exposes it as a blob URL. */
function usePdfBlobUrl(url) {
  const [state, setState] = useState({ url: null, blobUrl: null, failed: false })

  useEffect(() => {
    if (!url) return undefined
    const controller = new AbortController()
    let created = null
    fetchPdfBlobUrl(url, controller.signal)
      .then((blobUrl) => {
        created = blobUrl
        setState({ url, blobUrl, failed: false })
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState({ url, blobUrl: null, failed: true })
      })
    return () => {
      controller.abort()
      if (created) URL.revokeObjectURL(created)
    }
  }, [url])

  // Ignore a result that belongs to a previously selected paper.
  const current = state.url === url
  return { blobUrl: current ? state.blobUrl : null, failed: current && state.failed }
}

function ZoomControls({ zoom, onZoomIn, onZoomOut }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={onZoomOut} disabled={zoom <= 50} aria-label="Zoom out">
        <Minus className="size-3.5" />
      </Button>
      <span className="w-10 text-center text-xs tabular-nums text-muted-foreground">{zoom}%</span>
      <Button variant="ghost" size="icon-sm" onClick={onZoomIn} disabled={zoom >= 200} aria-label="Zoom in">
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}

function PageControls({ page, totalPages, onPrevPage, onNextPage }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      <Button variant="ghost" size="icon-sm" onClick={onPrevPage} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="size-3.5" />
      </Button>
      <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
        {page} <span className="text-border-strong">/</span> {totalPages ?? "…"}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
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
    <div className="mx-auto flex aspect-[8.5/11] w-[280px] animate-pulse flex-col gap-3 rounded-sm bg-paper p-6 shadow-[var(--shadow-page)] sm:w-[340px]">
      <div className="h-3 w-2/3 rounded bg-secondary" />
      <div className="mt-3 h-2 w-full rounded bg-secondary" />
      <div className="h-2 w-full rounded bg-secondary" />
      <div className="h-2 w-5/6 rounded bg-secondary" />
      <div className="mt-4 h-2 w-full rounded bg-secondary" />
      <div className="h-2 w-full rounded bg-secondary" />
      <div className="h-2 w-3/4 rounded bg-secondary" />
      <div className="mt-4 h-28 w-full rounded bg-secondary" />
    </div>
  )
}

function DocumentError() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
      <FileWarning className="size-6 text-destructive/70" strokeWidth={1.5} />
      <p className="font-serif text-base text-foreground">Couldn't load this PDF.</p>
      <p className="max-w-[220px] text-xs leading-relaxed">The file may be missing or the server may be unreachable.</p>
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

  const { blobUrl, failed: fileFailed } = usePdfBlobUrl(paper?.fileUrl)

  if (!paper) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-sidebar px-8 text-center">
        <p className="font-serif text-lg text-foreground">Nothing open</p>
        <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
          Select a paper or click a source under an answer to read it here.
        </p>
      </div>
    )
  }

  const subtitle = [paper.authors, paper.journal, paper.year].filter(Boolean).join(" · ")

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <p className="eyebrow">Reading</p>
          <p className="mt-1 truncate font-serif text-[15px] leading-snug text-foreground" title={paper.title}>
            {paper.title}
          </p>
          {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="-mt-1 -mr-2 shrink-0" onClick={onClose} aria-label="Close reader">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <PageControls page={page} totalPages={numPages} onPrevPage={onPrevPage} onNextPage={onNextPage} />
        <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>

      <div className="scroll-thin relative flex-1 overflow-auto p-6">
        {highlightedPage != null && highlightedPage === page && (
          <div className="mx-auto mb-4 flex max-w-fit items-center gap-1.5 rounded-full bg-marker px-3 py-1 text-[11px] font-medium text-marker-foreground">
            <Highlighter className="size-3" />
            Cited in answer
          </div>
        )}

        <div className="mx-auto w-fit">
          {fileFailed ? (
            <DocumentError />
          ) : !blobUrl ? (
            <PageSkeleton />
          ) : (
            <Document
              file={blobUrl}
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
                    className={
                      highlightedPage != null && highlightedPage === page
                        ? "shadow-[0_0_0_3px_var(--marker),var(--shadow-page)]"
                        : "shadow-[var(--shadow-page)]"
                    }
                  />
                </motion.div>
              </AnimatePresence>
            </Document>
          )}
        </div>
      </div>
    </div>
  )
}
