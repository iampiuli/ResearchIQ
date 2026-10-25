import { Dialog } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"

/**
 * Controlled confirmation for permanently deleting a paper from the server.
 * Pass the paper to confirm, or null to keep it closed. `onConfirm` receives
 * the paper; the dialog closes itself right after, and the caller reports
 * success or failure (e.g. via a toast).
 */
export function DeletePaperDialog({ paper, onOpenChange, onConfirm }) {
  return (
    <Dialog.Root open={paper != null} onOpenChange={(open) => !open && onOpenChange(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px] transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-strong/70 bg-paper p-6 shadow-[var(--shadow-float)] transition-[transform,opacity] duration-150 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0">
          {paper && (
            <>
              <p className="eyebrow">Delete paper</p>
              <Dialog.Title className="mt-2 font-serif text-xl leading-snug font-medium text-foreground">
                Delete “{paper.title}”?
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                This permanently removes the PDF and its search index from the server, and takes it out of every
                workspace. It can't be undone. To only take it out of this workspace, use “Remove from workspace”
                instead.
              </Dialog.Description>
              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onConfirm(paper)
                    onOpenChange(null)
                  }}
                >
                  Delete permanently
                </Button>
              </div>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
