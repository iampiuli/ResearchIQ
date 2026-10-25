import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { formatFileSize, formatUploadedAt } from "@/lib/utils"

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="eyebrow shrink-0">{label}</dt>
      <dd className="truncate text-right text-[13px] text-foreground first-letter:uppercase" title={value}>
        {value}
      </dd>
    </div>
  )
}

/** Controlled: pass the paper to show details for, or null to keep it closed. */
export function PaperDetailsDialog({ paper, onOpenChange }) {
  return (
    <Dialog.Root open={paper != null} onOpenChange={(open) => !open && onOpenChange(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px] transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-strong/70 bg-paper p-6 shadow-[var(--shadow-float)] transition-[transform,opacity] duration-150 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0">
          {paper && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="eyebrow">Paper details</p>
                  <Dialog.Title className="mt-2 font-serif text-xl leading-snug font-medium text-foreground">
                    {paper.title}
                  </Dialog.Title>
                </div>
                <Dialog.Close
                  aria-label="Close"
                  className="focus-ring -mt-1 -mr-1.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  <X className="size-4" />
                </Dialog.Close>
              </div>
              <dl className="mt-5 divide-y divide-border border-t border-border">
                <Row label="Size" value={formatFileSize(paper.size)} />
                <Row label="Uploaded" value={formatUploadedAt(paper.uploadedAt)} />
                <Row label="Pages" value={paper.pageCount != null ? String(paper.pageCount) : null} />
                <Row label="Status" value={paper.status} />
              </dl>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
