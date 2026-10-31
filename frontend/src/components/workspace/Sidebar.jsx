import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ChevronRight,
  Library,
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
import { PaperCard } from "@/components/workspace/PaperCard"
import { DeletePaperDialog } from "@/components/workspace/DeletePaperDialog"
import { PaperDetailsDialog } from "@/components/workspace/PaperDetailsDialog"
import { cn } from "@/lib/utils"

const SIDEBAR_COLLAPSED_KEY = "researchiq.sidebar.collapsed"
const SIDEBAR_SECTIONS_KEY = "researchiq.sidebar.sections"
const DEFAULT_SECTIONS = { workspaces: true, papers: true }

const ICON_BUTTON =
  "focus-ring flex items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground active:translate-y-px"

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
      className="w-full rounded-lg border border-primary/40 bg-paper px-2.5 py-2 text-[13px] text-foreground outline-none ring-4 ring-primary/10 placeholder:text-muted-foreground/70"
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
        className="eyebrow focus-ring flex items-center gap-1 rounded-md py-0.5 transition-colors hover:text-foreground"
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
    <div className="flex h-full w-[68px] flex-col items-center">
      <div className="flex h-14 w-full items-center justify-center border-b border-sidebar-border">
        <Link to="/" aria-label="ResearchIQ home" className="focus-ring rounded-lg">
          <Logo iconOnly />
        </Link>
      </div>

      <div className="flex flex-col items-center gap-1 px-3 py-3">
        <button type="button" onClick={onExpand} aria-label="Expand sidebar" title="Expand sidebar" className={cn(ICON_BUTTON, "size-9")}>
          <PanelLeftOpen className="size-4" />
        </button>
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading || !hasActiveWorkspace}
          aria-label="Upload papers"
          title="Upload papers"
          className={cn(ICON_BUTTON, "size-9 disabled:pointer-events-none disabled:opacity-40")}
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
          className={cn(ICON_BUTTON, "size-9")}
        >
          <Search className="size-4" />
        </button>
      </div>

      <div className="mx-4 h-px w-6 bg-sidebar-border" />

      <div className="scroll-thin flex flex-1 flex-col items-center gap-1.5 overflow-y-auto px-3 py-3">
        {workspaces.map((workspace) => {
          const isActive = workspace.id === activeWorkspaceId
          return (
            <button
              key={workspace.id}
              type="button"
              onClick={() => onSelectWorkspace(workspace)}
              aria-label={workspace.name}
              title={workspace.name}
              className={cn(
                "focus-ring flex size-9 shrink-0 items-center justify-center rounded-lg font-serif text-[15px] font-medium transition-colors duration-150 active:translate-y-px",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
              )}
            >
              {workspace.name.trim().charAt(0).toUpperCase() || "W"}
            </button>
          )
        })}
      </div>

      <div className="px-3 py-3">
        <button type="button" aria-label="Settings" title="Settings" className={cn(ICON_BUTTON, "size-9")}>
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
  onDeletePaper,
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
  const [paperToDelete, setPaperToDelete] = useState(null)
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
    <div className="flex h-full w-[284px] flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <Link to="/" aria-label="ResearchIQ home" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className={cn(ICON_BUTTON, "size-8")}
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 px-4 pt-1 pb-4">
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading || !hasActiveWorkspace}
          title={hasActiveWorkspace ? undefined : "Select or create a workspace first"}
          className={cn(
            "focus-ring flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-paper/60 text-[13px] font-medium text-ink-soft transition-colors duration-150",
            "hover:border-primary/50 hover:bg-paper hover:text-primary",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" strokeWidth={1.75} />}
          {isUploading ? "Uploading…" : "Add papers"}
        </button>

        <div
          className={cn(
            "flex items-center gap-2 rounded-lg bg-foreground/[0.045] px-2.5 py-2 transition-[background-color,box-shadow] duration-150",
            "focus-within:bg-paper focus-within:shadow-[0_0_0_1px_var(--border-strong)]"
          )}
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search papers"
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-border-strong/70 px-1 font-sans text-[10px] text-muted-foreground/80 xl:block">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-4">
        <div className="mb-6">
          <SectionHeader
            title="Workspaces"
            expanded={sections.workspaces}
            onToggle={() => onToggleSection("workspaces")}
            action={
              <button
                type="button"
                onClick={startCreatingWorkspace}
                aria-label="New workspace"
                title="New workspace"
                className="focus-ring flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <Plus className="size-3.5" />
              </button>
            }
          />
          <CollapsibleSection expanded={sections.workspaces}>
            <div className="space-y-0.5 pt-2">
              {isCreatingWorkspace && (
                <div className="px-1 pb-1">
                  <InlineNameInput
                    placeholder="Workspace name"
                    onConfirm={(name) => {
                      onCreateWorkspace(name)
                      setIsCreatingWorkspace(false)
                    }}
                    onCancel={() => setIsCreatingWorkspace(false)}
                  />
                </div>
              )}
              {workspaces.length === 0 && !isCreatingWorkspace && (
                <p className="px-2 py-2 text-xs leading-relaxed text-muted-foreground">
                  No workspaces yet. Create one to start collecting papers.
                </p>
              )}
              {workspaces.map((workspace) => {
                const isActive = workspace.id === activeWorkspaceId
                return (
                  <div
                    key={workspace.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-lg px-1 transition-colors duration-150",
                      isActive ? "bg-paper shadow-[0_0_0_1px_var(--border)]" : "hover:bg-foreground/[0.04]"
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
                          className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-2 pl-2 text-left"
                        >
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full transition-colors",
                              isActive ? "bg-primary" : "bg-border-strong"
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-[13px]",
                              isActive ? "font-medium text-foreground" : "text-ink-soft"
                            )}
                          >
                            {workspace.name}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                            {workspace.paperCount}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingWorkspaceId(workspace.id)}
                          aria-label={`Rename ${workspace.name}`}
                          className="focus-ring shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-[opacity,background-color,color] duration-150 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-foreground/[0.06] hover:text-foreground"
                        >
                          <Pencil className="size-3" />
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CollapsibleSection>
        </div>

        <div>
          <SectionHeader
            title="Library"
            expanded={sections.papers}
            onToggle={() => onToggleSection("papers")}
            action={<span className="pr-1 text-[11px] tabular-nums text-muted-foreground">{filteredPapers.length}</span>}
          />
          <CollapsibleSection expanded={sections.papers}>
            <div className="space-y-0.5 pt-2">
              {!hasActiveWorkspace && (
                <p className="px-2 py-2 text-xs leading-relaxed text-muted-foreground">
                  Select a workspace to see its papers.
                </p>
              )}
              {hasActiveWorkspace && papersStatus === "loading" && (
                <div className="space-y-2 px-2 py-2" role="status" aria-label="Loading papers">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="animate-pulse space-y-1.5 rounded-lg border border-border/60 px-3 py-2.5">
                      <div className="h-3 w-4/5 rounded bg-foreground/[0.07]" />
                      <div className="h-2.5 w-1/2 rounded bg-foreground/[0.05]" />
                    </div>
                  ))}
                </div>
              )}
              {hasActiveWorkspace && papersStatus === "error" && (
                <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                  <p className="flex items-start gap-1.5">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    {papersError ?? "Failed to load papers."}
                  </p>
                  <button type="button" onClick={onRetryPapers} className="font-medium underline underline-offset-2">
                    Retry
                  </button>
                </div>
              )}
              {hasActiveWorkspace && papersStatus === "success" && filteredPapers.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
                  <Library className="size-5 text-border-strong" strokeWidth={1.5} />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {papers.length === 0 ? "No papers in this workspace yet." : "No papers match your search."}
                  </p>
                </div>
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
                    onDelete={() => setPaperToDelete(paper)}
                    onShowDetails={() => setDetailsPaper(paper)}
                  />
                ))}
            </div>
          </CollapsibleSection>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <Settings className="size-4" strokeWidth={1.75} />
          Settings
        </button>
      </div>

      <PaperDetailsDialog paper={detailsPaper} onOpenChange={setDetailsPaper} />
      <DeletePaperDialog paper={paperToDelete} onOpenChange={setPaperToDelete} onConfirm={(paper) => onDeletePaper(paper.id)} />
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
        animate={{ width: collapsed ? 68 : 284 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:shrink-0 lg:flex-col lg:overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div
              key="rail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              <SidebarContent
                {...contentProps}
                sections={sections}
                onToggleSection={toggleSection}
                onCollapse={() => setCollapsed(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
              className="fixed inset-0 z-40 bg-foreground/25 lg:hidden"
            />
            <motion.aside
              key="sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-[284px] flex-col border-r border-sidebar-border bg-sidebar lg:hidden"
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
