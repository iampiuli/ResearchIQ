import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ChevronRight,
  Folder,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Settings,
  Upload,
} from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { PaperCard } from "@/components/workspace/PaperCard"
import { PaperDetailsDialog } from "@/components/workspace/PaperDetailsDialog"
import { cn } from "@/lib/utils"

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1"

const SIDEBAR_COLLAPSED_KEY = "researchiq.sidebar.collapsed"
const SIDEBAR_SECTIONS_KEY = "researchiq.sidebar.sections"
const DEFAULT_SECTIONS = { workspaces: true, papers: true }

function loadSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  } catch {
    return false
  }
}

function loadSidebarSections() {
  try {
    const raw = localStorage.getItem(SIDEBAR_SECTIONS_KEY)
    if (raw) return { ...DEFAULT_SECTIONS, ...JSON.parse(raw) }
  } catch {
    // Corrupt/unavailable storage — fall back to both sections expanded.
  }
  return DEFAULT_SECTIONS
}

function InlineNameInput({ initialValue = "", placeholder, onConfirm, onCancel }) {
  const [value, setValue] = useState(initialValue)

  function confirm() {
    const trimmed = value.trim()
    if (trimmed) onConfirm(trimmed)
    else onCancel()
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={confirm}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          confirm()
        } else if (e.key === "Escape") {
          e.preventDefault()
          onCancel()
        }
      }}
      placeholder={placeholder}
      className="w-full rounded-lg border border-indigo-300 bg-card px-2.5 py-2 text-xs font-medium text-foreground outline-none ring-2 ring-indigo-500/15"
    />
  )
}

function SectionHeader({ title, expanded, onToggle, action }) {
  return (
    <div className="flex items-center justify-between px-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex items-center gap-1 rounded-md py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase outline-none transition-colors hover:text-foreground",
          FOCUS_RING
        )}
      >
        <ChevronRight className={cn("size-3 transition-transform duration-200", expanded && "rotate-90")} />
        {title}
      </button>
      {action}
    </div>
  )
}

function CollapsibleSection({ expanded, children }) {
  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SidebarRail({
  onExpand,
  onUploadClick,
  isUploading,
  hasActiveWorkspace,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onRequestSearchFocus,
}) {
  return (
    <div className="flex h-full w-16 flex-col items-center">
      <div className="flex flex-col items-center gap-3 border-b border-border p-3">
        <Link to="/" aria-label="ResearchIQ home" className={cn("rounded-lg outline-none", FOCUS_RING)}>
          <Logo iconOnly />
        </Link>
        <button
          type="button"
          onClick={onExpand}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className={cn(
            "flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground",
            FOCUS_RING
          )}
        >
          <PanelLeftOpen className="size-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 border-b border-border p-3">
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading || !hasActiveWorkspace}
          aria-label="Upload papers"
          title="Upload papers"
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
            FOCUS_RING
          )}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            onExpand()
            onRequestSearchFocus?.()
          }}
          aria-label="Search papers"
          title="Search papers"
          className={cn(
            "flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground",
            FOCUS_RING
          )}
        >
          <Search className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto p-3">
        {workspaces.map((workspace) => (
          <button
            key={workspace.id}
            type="button"
            onClick={() => onSelectWorkspace(workspace)}
            aria-label={workspace.name}
            title={workspace.name}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg outline-none transition-colors duration-150",
              workspace.id === activeWorkspaceId
                ? "bg-indigo-50/70 text-indigo-700"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              FOCUS_RING
            )}
          >
            <Folder className="size-4" strokeWidth={2} />
          </button>
        ))}
      </div>

      <div className="border-t border-border p-3">
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className={cn(
            "flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground",
            FOCUS_RING
          )}
        >
          <Settings className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

function SidebarContent({
  papers,
  filteredPapers,
  papersStatus,
  papersError,
  onRetryPapers,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  activePaperId,
  onSelectPaper,
  onRemovePaper,
  searchQuery,
  onSearchChange,
  onUploadClick,
  isUploading,
  searchFocusToken,
  sections,
  onToggleSection,
  onCollapse,
  onNavigate,
}) {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
  const [renamingWorkspaceId, setRenamingWorkspaceId] = useState(null)
  const [detailsPaper, setDetailsPaper] = useState(null)
  const searchInputRef = useRef(null)

  const hasActiveWorkspace = Boolean(activeWorkspaceId)

  // Fires once per focus request (⌘K / sidebar rail search icon). A no-op on
  // whichever Sidebar instance (desktop aside vs. mobile drawer) isn't
  // actually visible — focus() on a display:none input is a silent no-op.
  useEffect(() => {
    if (searchFocusToken) searchInputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFocusToken])

  function startCreatingWorkspace() {
    setIsCreatingWorkspace(true)
    if (!sections.workspaces) onToggleSection("workspaces")
  }

  return (
    <div className="flex h-full w-[280px] flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <Link to="/" aria-label="ResearchIQ home" className={cn("rounded-lg outline-none", FOCUS_RING)}>
          <Logo />
        </Link>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className={cn(
              "flex size-7 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground",
              FOCUS_RING
            )}
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 border-b border-border p-4">
        <Button
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={onUploadClick}
          disabled={isUploading || !hasActiveWorkspace}
          title={hasActiveWorkspace ? undefined : "Select or create a workspace first"}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {isUploading ? "Uploading…" : "Upload Papers"}
        </Button>
      </div>

      <div className="border-b border-border p-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 transition-shadow duration-150",
            "focus-within:border-indigo-300 focus-within:bg-card focus-within:shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/15"
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={2} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search papers…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-5">
          <SectionHeader
            title="Workspaces"
            expanded={sections.workspaces}
            onToggle={() => onToggleSection("workspaces")}
            action={
              <button
                type="button"
                onClick={startCreatingWorkspace}
                className={cn(
                  "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 outline-none transition-colors hover:bg-indigo-50",
                  FOCUS_RING
                )}
              >
                <Plus className="size-3" />
                New
              </button>
            }
          />
          <CollapsibleSection expanded={sections.workspaces}>
            <div className="space-y-1 pt-3">
              {isCreatingWorkspace && (
                <div className="px-1 pb-1">
                  <InlineNameInput
                    placeholder="Workspace name…"
                    onConfirm={(name) => {
                      onCreateWorkspace(name)
                      setIsCreatingWorkspace(false)
                    }}
                    onCancel={() => setIsCreatingWorkspace(false)}
                  />
                </div>
              )}
              {workspaces.length === 0 && !isCreatingWorkspace && (
                <p className="px-1 py-2 text-xs text-muted-foreground">No workspaces yet — create one to get started.</p>
              )}
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={cn(
                    "group flex items-center gap-1 rounded-lg px-1 outline-none transition-colors duration-150",
                    workspace.id === activeWorkspaceId ? "bg-indigo-50/70" : "hover:bg-muted"
                  )}
                >
                  {renamingWorkspaceId === workspace.id ? (
                    <div className="flex-1 py-1">
                      <InlineNameInput
                        initialValue={workspace.name}
                        onConfirm={(name) => {
                          onRenameWorkspace(workspace.id, name)
                          setRenamingWorkspaceId(null)
                        }}
                        onCancel={() => setRenamingWorkspaceId(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectWorkspace(workspace)
                          onNavigate?.()
                        }}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-2 pl-1.5 text-left text-xs font-medium outline-none",
                          workspace.id === activeWorkspaceId ? "text-indigo-700" : "text-muted-foreground"
                        )}
                      >
                        <Folder className="size-3.5 shrink-0" strokeWidth={2} />
                        <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground/70">
                          {workspace.paperCount} paper{workspace.paperCount === 1 ? "" : "s"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingWorkspaceId(workspace.id)}
                        aria-label={`Rename ${workspace.name}`}
                        className={cn(
                          "shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-card hover:text-foreground",
                          FOCUS_RING
                        )}
                      >
                        <Pencil className="size-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        <div>
          <SectionHeader
            title="Paper Library"
            expanded={sections.papers}
            onToggle={() => onToggleSection("papers")}
            action={<span className="text-[11px] text-muted-foreground">{filteredPapers.length}</span>}
          />
          <CollapsibleSection expanded={sections.papers}>
            <div className="space-y-2 pt-3">
              {!hasActiveWorkspace && (
                <p className="px-1 py-2 text-xs text-muted-foreground">Select a workspace to see its papers.</p>
              )}
              {hasActiveWorkspace && papersStatus === "loading" && (
                <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Loading papers…
                </div>
              )}
              {hasActiveWorkspace && papersStatus === "error" && (
                <div className="space-y-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs text-red-700">
                  <p className="flex items-start gap-1.5">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    {papersError ?? "Failed to load papers."}
                  </p>
                  <button
                    type="button"
                    onClick={onRetryPapers}
                    className="font-medium underline underline-offset-2 hover:text-red-800"
                  >
                    Retry
                  </button>
                </div>
              )}
              {hasActiveWorkspace && papersStatus === "success" && filteredPapers.length === 0 && (
                <p className="px-1 py-2 text-xs text-muted-foreground">
                  {papers.length === 0 ? "No papers in this workspace yet." : "No papers match your search."}
                </p>
              )}
              {hasActiveWorkspace &&
                papersStatus === "success" &&
                filteredPapers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    active={paper.id === activePaperId}
                    onClick={() => {
                      onSelectPaper(paper)
                      onNavigate?.()
                    }}
                    onRemove={() => onRemovePaper(paper.id)}
                    onShowDetails={() => setDetailsPaper(paper)}
                  />
                ))}
            </div>
          </CollapsibleSection>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground",
            FOCUS_RING
          )}
        >
          <Settings className="size-4" strokeWidth={1.75} />
          Settings
        </button>
      </div>

      <PaperDetailsDialog paper={detailsPaper} onOpenChange={setDetailsPaper} />
    </div>
  )
}

export function Sidebar({ open, onClose, ...contentProps }) {
  const [collapsed, setCollapsed] = useState(loadSidebarCollapsed)
  const [sections, setSections] = useState(loadSidebarSections)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0")
    } catch {
      // Storage can fail (quota, private mode) — collapse state just won't persist.
    }
  }, [collapsed])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(sections))
    } catch {
      // Non-fatal — section state just won't survive a reload.
    }
  }, [sections])

  function toggleSection(key) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 64 : 280 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex lg:shrink-0 lg:flex-col lg:overflow-hidden lg:border-r lg:border-border lg:bg-card"
      >
        {collapsed ? (
          <SidebarRail
            onExpand={() => setCollapsed(false)}
            onUploadClick={contentProps.onUploadClick}
            isUploading={contentProps.isUploading}
            hasActiveWorkspace={Boolean(contentProps.activeWorkspaceId)}
            workspaces={contentProps.workspaces}
            activeWorkspaceId={contentProps.activeWorkspaceId}
            onSelectWorkspace={contentProps.onSelectWorkspace}
            onRequestSearchFocus={contentProps.onRequestSearchFocus}
          />
        ) : (
          <SidebarContent
            {...contentProps}
            sections={sections}
            onToggleSection={toggleSection}
            onCollapse={() => setCollapsed(true)}
          />
        )}
      </motion.aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card lg:hidden"
            >
              <SidebarContent
                {...contentProps}
                sections={sections}
                onToggleSection={toggleSection}
                onNavigate={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
