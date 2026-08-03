import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { WorkspaceLayout } from "@/layouts/WorkspaceLayout"
import { Sidebar } from "@/components/workspace/Sidebar"
import { Topbar } from "@/components/workspace/Topbar"
import { ChatMessage, TypingIndicator } from "@/components/workspace/ChatMessage"
import { ChatInput } from "@/components/workspace/ChatInput"
import { PDFViewer } from "@/components/workspace/PDFViewer"
import { cn, formatRelativeTime } from "@/lib/utils"
import { fetchPapers, fileUrlFor, sendChatMessage, uploadPapers } from "@/lib/api"

// Each of these deliberately contains a phrase intent_service.py recognizes
// as a synthesis-style query, so it automatically pulls representative
// context from every paper attached to the workspace rather than a single
// global top-k match — no special-casing needed here on the frontend.
const SUGGESTED_PROMPTS = [
  "Summarize these papers",
  "Compare these papers",
  "What are the research gaps?",
  "What datasets are used?",
  "What benchmarks are used?",
  "Give me a literature review of these papers",
  "What future work do these papers suggest?",
]

const WORKSPACES_STORAGE_KEY = "researchiq.workspaces"
const ACTIVE_WORKSPACE_ID_KEY = "researchiq.activeWorkspaceId"
// Pre-workspace model — read once for a one-time migration, then discarded.
const LEGACY_CONVERSATIONS_STORAGE_KEY = "researchiq.conversations"

let messageId = 1

/** Map the backend's PaperSummary shape (snake_case) to what the UI components expect. */
function toUiPaper(paperSummary) {
  return {
    id: paperSummary.id,
    title: paperSummary.original_filename || paperSummary.filename,
    filename: paperSummary.filename,
    fileUrl: fileUrlFor(paperSummary.filename),
    size: paperSummary.size,
    uploadedAt: paperSummary.uploaded_at,
    status: paperSummary.status,
    pageCount: paperSummary.page_count ?? null,
  }
}

/**
 * Loads workspaces from storage, migrating the pre-workspace "conversations"
 * model exactly once: each old conversation becomes a workspace with no
 * attached papers (that concept didn't exist yet, so there's nothing to
 * carry over) but keeps its messages/name/timestamps. The legacy key is
 * deleted immediately after a successful migration so it cannot re-fire.
 */
function loadWorkspaces() {
  try {
    const raw = localStorage.getItem(WORKSPACES_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Corrupt current data — fall through to an empty workspace list below.
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_CONVERSATIONS_STORAGE_KEY)
    if (!legacyRaw) return []

    const legacyConversations = JSON.parse(legacyRaw)
    const migrated = legacyConversations.map((conversation) => ({
      id: conversation.id,
      name: conversation.title,
      attachedPaperIds: [],
      messages: conversation.messages ?? [],
      activePaperId: null,
      createdAt: conversation.updatedAt ?? Date.now(),
      updatedAt: conversation.updatedAt ?? Date.now(),
    }))
    localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(migrated))
    localStorage.removeItem(LEGACY_CONVERSATIONS_STORAGE_KEY)
    return migrated
  } catch {
    return []
  }
}

function loadStoredActiveWorkspaceId() {
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_ID_KEY) || null
  } catch {
    return null
  }
}

export function WorkspacePage() {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState(null)

  const [workspaces, setWorkspaces] = useState(loadWorkspaces)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(loadStoredActiveWorkspaceId)
  // Mirrors activeWorkspaceId synchronously so an in-flight /chat response can
  // tell, after the fact, whether the user has since switched workspaces —
  // state updates alone would lag by a render and misattribute the reply.
  const activeWorkspaceIdRef = useRef(activeWorkspaceId)

  const [papers, setPapers] = useState([])
  const [papersStatus, setPapersStatus] = useState("loading") // loading | success | error
  const [papersError, setPapersError] = useState(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadFeedback, setUploadFeedback] = useState(null) // { type: "success" | "error", message }
  const fileInputRef = useRef(null)

  const [activePaperId, setActivePaperId] = useState(null)
  const [activePage, setActivePage] = useState(1)
  const [highlightedPage, setHighlightedPage] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [numPages, setNumPages] = useState(null)

  const [searchQuery, setSearchQuery] = useState("")

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)

  const scrollRef = useRef(null)

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null
  const activePaper = papers.find((paper) => paper.id === activePaperId) ?? null

  // Only papers attached to the active workspace are ever shown or searched —
  // this is the workspace's whole reason to exist.
  const attachedPapers = activeWorkspace
    ? papers.filter((paper) => activeWorkspace.attachedPaperIds.includes(paper.id))
    : []
  const filteredPapers = attachedPapers.filter((paper) =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // A request can be pending for a workspace the user has since navigated
  // away from — only show the indicator when it belongs to what's on screen.
  const isThinkingHere = isThinking && pendingWorkspaceId === activeWorkspaceId

  async function loadPapers() {
    setPapersStatus("loading")
    setPapersError(null)
    try {
      const data = await fetchPapers()
      setPapers(data.map(toUiPaper))
      setPapersStatus("success")
    } catch (err) {
      setPapersStatus("error")
      setPapersError(err.message || "Failed to load papers.")
    }
  }

  useEffect(() => {
    loadPapers()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isThinkingHere])

  // Persist workspaces (incl. their messages and attached papers) across reloads.
  useEffect(() => {
    try {
      localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces))
    } catch {
      // Storage can fail (quota, private mode) — history just won't survive a reload.
    }
  }, [workspaces])

  useEffect(() => {
    try {
      if (activeWorkspaceId) localStorage.setItem(ACTIVE_WORKSPACE_ID_KEY, activeWorkspaceId)
      else localStorage.removeItem(ACTIVE_WORKSPACE_ID_KEY)
    } catch {
      // Non-fatal — just won't restore the active workspace after a reload.
    }
  }, [activeWorkspaceId])

  // A stored active-workspace id may no longer exist (e.g. storage edited by
  // hand, or a workspace deleted in a future version) — validate once on mount.
  useEffect(() => {
    if (activeWorkspaceId && !workspaces.some((workspace) => workspace.id === activeWorkspaceId)) {
      setActiveWorkspace(null)
    }
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Switching workspaces restores that workspace's own conversation — none of
  // this is shared across workspaces. Deliberately does NOT touch
  // activePaperId (see the next effect): this only fires on an actual
  // workspace switch, not on every workspace mutation (e.g. a message
  // arriving mid-conversation, or a paper being attached).
  useEffect(() => {
    const workspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null
    setMessages(workspace?.messages ?? [])
    setDraft("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId])

  // Keeps a valid paper selected for the active workspace's PDF viewer.
  // Runs on workspace switch AND whenever the active workspace's attached
  // papers change (e.g. right after an upload) — that second trigger is the
  // fix: previously activePaperId was only derived on switch, so uploading
  // the first paper into an already-active workspace left it stuck at null
  // (blank viewer) even though attachedPaperIds was correctly populated.
  // Never overrides an already-valid selection, so explicit paper/citation
  // clicks (which set activePaperId to one of the workspace's own attached
  // papers) are never clobbered by this effect re-running afterwards.
  const attachedPaperIdsKey = activeWorkspace?.attachedPaperIds.join(",") ?? ""
  useEffect(() => {
    if (!activeWorkspace) {
      if (activePaperId !== null) setActivePaperId(null)
      return
    }
    // Already valid (e.g. an explicit paper/citation click just set this) —
    // leave page/zoom/highlight alone, don't clobber the user's viewing state.
    if (activePaperId && activeWorkspace.attachedPaperIds.includes(activePaperId)) return

    setActivePaperId(activeWorkspace.activePaperId ?? activeWorkspace.attachedPaperIds[0] ?? null)
    setActivePage(1)
    setHighlightedPage(null)
    setZoom(100)
    setNumPages(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId, attachedPaperIdsKey])

  /** Sets which workspace is active, keeping the synchronous ref in lockstep. */
  function setActiveWorkspace(id) {
    activeWorkspaceIdRef.current = id
    setActiveWorkspaceId(id)
  }

  /** Applies `updater` to one workspace's stored state, regardless of what's currently on screen. */
  function updateWorkspace(workspaceId, updater) {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId ? { ...updater(workspace), updatedAt: Date.now() } : workspace
      )
    )
  }

  function appendMessageToWorkspace(workspaceId, message) {
    updateWorkspace(workspaceId, (workspace) => ({ ...workspace, messages: [...workspace.messages, message] }))
  }

  function handleCitationClick(citation) {
    setActivePaperId(citation.paperId)
    setSourceOpen(true)
    if (activeWorkspaceId) updateWorkspace(activeWorkspaceId, (w) => ({ ...w, activePaperId: citation.paperId }))
    if (typeof citation.page === "number") {
      setActivePage(citation.page)
      setHighlightedPage(citation.page)
      setZoom(100)
    }
  }

  function handleSelectPaper(paper) {
    setActivePaperId(paper.id)
    setActivePage(1)
    setHighlightedPage(null)
    setZoom(100)
    setSourceOpen(true)
    if (activeWorkspaceId) updateWorkspace(activeWorkspaceId, (w) => ({ ...w, activePaperId: paper.id }))
  }

  async function handleSend() {
    const content = draft.trim()
    if (!content || isThinking || !activeWorkspace) return

    const workspaceId = activeWorkspaceId
    const paperIds = activeWorkspace.attachedPaperIds
    const userMessage = { id: `m${messageId++}`, role: "user", content }

    appendMessageToWorkspace(workspaceId, userMessage)
    setMessages((prev) => [...prev, userMessage])
    setDraft("")
    setIsThinking(true)
    setPendingWorkspaceId(workspaceId)

    try {
      const data = await sendChatMessage(content, paperIds)
      const citations = (data.sources ?? []).map((source) => ({
        paperId: source.paper_id,
        // /chat returns ChromaDB's stored (UUID-based) filename, not the
        // original upload name — resolve the human-readable title from the
        // already-fetched papers list when we have it, falling back to the
        // stored filename if this paper isn't in the loaded list.
        paperTitle: papers.find((paper) => paper.id === source.paper_id)?.title ?? source.filename,
      }))
      const assistantMessage = { id: `m${messageId++}`, role: "assistant", content: data.answer, citations }
      appendMessageToWorkspace(workspaceId, assistantMessage)
      // The user may have switched to a different (or new) workspace while
      // this request was in flight — only reflect the reply on screen if
      // they're still looking at the workspace it belongs to.
      if (activeWorkspaceIdRef.current === workspaceId) {
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (err) {
      const assistantMessage = {
        id: `m${messageId++}`,
        role: "assistant",
        content: err.message || "Something went wrong while generating an answer. Please try again.",
        isError: true,
      }
      appendMessageToWorkspace(workspaceId, assistantMessage)
      if (activeWorkspaceIdRef.current === workspaceId) {
        setMessages((prev) => [...prev, assistantMessage])
      }
    } finally {
      setIsThinking(false)
      setPendingWorkspaceId(null)
    }
  }

  function handleCreateWorkspace(name) {
    const id = crypto.randomUUID()
    const now = Date.now()
    setWorkspaces((prev) => [
      { id, name, attachedPaperIds: [], messages: [], activePaperId: null, createdAt: now, updatedAt: now },
      ...prev,
    ])
    setActiveWorkspace(id)
  }

  function handleRenameWorkspace(workspaceId, name) {
    updateWorkspace(workspaceId, (workspace) => ({ ...workspace, name }))
  }

  function handleSelectWorkspace(workspace) {
    setActiveWorkspace(workspace.id)
  }

  function handleRemovePaperFromWorkspace(paperId) {
    if (!activeWorkspaceId) return
    updateWorkspace(activeWorkspaceId, (workspace) => ({
      ...workspace,
      attachedPaperIds: workspace.attachedPaperIds.filter((id) => id !== paperId),
      activePaperId: workspace.activePaperId === paperId ? null : workspace.activePaperId,
    }))
    if (activePaperId === paperId) setActivePaperId(null)
  }

  function handleUploadClick() {
    if (!activeWorkspace) return
    fileInputRef.current?.click()
  }

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    if (files.length === 0 || !activeWorkspace) return

    const workspaceId = activeWorkspaceId
    setIsUploading(true)
    setUploadFeedback(null)
    try {
      const result = await uploadPapers(files)
      const { uploaded, duplicates, summary } = result

      // Both freshly-embedded and duplicate-matched papers get attached —
      // duplicates reuse the existing embeddings via the matched paper_id
      // rather than re-indexing, so this is how "uploading again" behaves.
      const attachedIds = [...uploaded.map((u) => u.paper_id), ...duplicates.map((d) => d.paper_id)]
      if (attachedIds.length > 0) {
        updateWorkspace(workspaceId, (workspace) => ({
          ...workspace,
          attachedPaperIds: [...new Set([...workspace.attachedPaperIds, ...attachedIds])],
        }))
      }

      const parts = []
      if (summary.uploaded) parts.push(`${summary.uploaded} uploaded`)
      if (summary.duplicates) parts.push(`${summary.duplicates} already indexed, attached`)
      if (summary.failed) parts.push(`${summary.failed} failed`)

      setUploadFeedback({
        type: summary.uploaded > 0 || summary.duplicates > 0 || summary.failed === 0 ? "success" : "error",
        message: parts.length > 0 ? parts.join(", ") : "No files were processed.",
      })

      if (summary.uploaded > 0) await loadPapers()
    } catch (err) {
      setUploadFeedback({ type: "error", message: err.message || "Upload failed." })
    } finally {
      setIsUploading(false)
    }
  }

  const sortedWorkspaces = [...workspaces]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((workspace) => ({
      ...workspace,
      paperCount: papers.filter((paper) => workspace.attachedPaperIds.includes(paper.id)).length,
      time: formatRelativeTime(workspace.updatedAt),
    }))

  const sidebarProps = {
    papers: attachedPapers,
    filteredPapers,
    papersStatus,
    papersError,
    onRetryPapers: loadPapers,
    workspaces: sortedWorkspaces,
    activeWorkspaceId,
    onSelectWorkspace: handleSelectWorkspace,
    onCreateWorkspace: handleCreateWorkspace,
    onRenameWorkspace: handleRenameWorkspace,
    activePaperId,
    onSelectPaper: handleSelectPaper,
    onRemovePaper: handleRemovePaperFromWorkspace,
    searchQuery,
    onSearchChange: setSearchQuery,
    onUploadClick: handleUploadClick,
    isUploading,
    uploadFeedback,
  }

  return (
    <WorkspaceLayout>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <div className="flex h-full">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} {...sidebarProps} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenSource={() => setSourceOpen(true)}
            onUploadClick={handleUploadClick}
            isUploading={isUploading}
            uploadDisabled={!activeWorkspace}
          />

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b border-border px-6 py-5 lg:px-10">
                <h1 className="text-base font-semibold text-foreground">
                  {activeWorkspace ? activeWorkspace.name : "No workspace selected"}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeWorkspace ? `${attachedPapers.length} paper(s) in this workspace` : " "}
                </p>
              </div>

              {!activeWorkspace ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm font-medium text-foreground">Create a workspace to get started</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Each workspace keeps its own papers and conversation. Use "+ New Workspace" in the
                    sidebar to create one.
                  </p>
                </div>
              ) : (
                <>
                  <div ref={scrollRef} className="flex-1 space-y-8 overflow-y-auto px-6 py-8 lg:px-10">
                    {messages.length === 0 && !isThinkingHere && (
                      <p className="text-sm text-muted-foreground">
                        Upload a paper, then ask a question to get a grounded answer with sources.
                      </p>
                    )}
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} onCitationClick={handleCitationClick} />
                    ))}
                    {isThinkingHere && <TypingIndicator />}
                  </div>

                  <div className="border-t border-border bg-white px-6 py-5 lg:px-10">
                    <div className="mb-3 flex flex-wrap gap-2.5">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setDraft(prompt)}
                          className={cn(
                            "rounded-xl border border-border bg-white px-3.5 py-2.5 text-left text-xs font-medium text-muted-foreground shadow-xs outline-none",
                            "transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700 hover:shadow-md",
                            "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1"
                          )}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                    <ChatInput value={draft} onChange={setDraft} onSubmit={handleSend} disabled={isThinking} />
                  </div>
                </>
              )}
            </div>

            <aside className="hidden xl:flex xl:w-[420px] xl:shrink-0 xl:flex-col xl:border-l xl:border-border">
              <PDFViewer
                paper={activePaper}
                page={activePage}
                zoom={zoom}
                highlightedPage={highlightedPage}
                numPages={numPages}
                onDocumentLoad={setNumPages}
                onPrevPage={() => setActivePage((p) => Math.max(1, p - 1))}
                onNextPage={() => setActivePage((p) => Math.min(numPages ?? p, p + 1))}
                onZoomIn={() => setZoom((z) => Math.min(200, z + 10))}
                onZoomOut={() => setZoom((z) => Math.max(50, z - 10))}
              />
            </aside>

            <AnimatePresence>
              {sourceOpen && (
                <>
                  <motion.div
                    key="source-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSourceOpen(false)}
                    className="fixed inset-0 z-40 bg-black/30 xl:hidden"
                  />
                  <motion.div
                    key="source-drawer"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-[420px] border-l border-border bg-white xl:hidden"
                  >
                    <PDFViewer
                      paper={activePaper}
                      page={activePage}
                      zoom={zoom}
                      highlightedPage={highlightedPage}
                      numPages={numPages}
                      onDocumentLoad={setNumPages}
                      onPrevPage={() => setActivePage((p) => Math.max(1, p - 1))}
                      onNextPage={() => setActivePage((p) => Math.min(numPages ?? p, p + 1))}
                      onZoomIn={() => setZoom((z) => Math.min(200, z + 10))}
                      onZoomOut={() => setZoom((z) => Math.max(50, z - 10))}
                      onClose={() => setSourceOpen(false)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  )
}
