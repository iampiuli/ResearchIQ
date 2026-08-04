import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { formatFileSize, formatUploadedAt } from "@/lib/utils"

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground" title={value}>
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
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-lg transition-[transform,opacity] duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
          {paper && (
            <>
              <div className="flex items-start justify-between gap-2">
                <Dialog.Title className="text-sm font-semibold text-foreground">Paper details</Dialog.Title>
                <Dialog.Close className="rounded-lg p-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground">
                  <X className="size-4" />
                </Dialog.Close>
              </div>
              <dl className="mt-3 divide-y divide-border text-sm">
                <Row label="Filename" value={paper.title} />
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
