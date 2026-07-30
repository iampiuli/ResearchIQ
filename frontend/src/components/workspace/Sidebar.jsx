import { AnimatePresence, motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Folder, MessageSquareText, Plus, Search, Settings, Upload } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { PaperCard } from "@/components/workspace/PaperCard"
import { cn } from "@/lib/utils"

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1"

function SidebarContent({
  papers,
  filteredPapers,
  collections,
  activeCollection,
  onSelectCollection,
  recentChats,
  activePaperId,
  onSelectPaper,
  searchQuery,
  onSearchChange,
  onNewChat,
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b border-border p-4">
        <Link to="/" aria-label="ResearchIQ home" className={cn("rounded-lg outline-none", FOCUS_RING)}>
          <Logo />
        </Link>
      </div>

      <div className="flex flex-col gap-2 border-b border-border p-4">
        <Button
          className="w-full justify-center gap-2"
          onClick={() => {
            onNewChat?.()
            onNavigate?.()
          }}
        >
          <Plus className="size-4" />
          New Chat
        </Button>
        <Button variant="outline" className="w-full justify-center gap-2">
          <Upload className="size-4" />
          Upload Papers
        </Button>
      </div>

      <div className="border-b border-border p-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 transition-shadow duration-150",
            "focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/15"
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground/70" strokeWidth={2} />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search papers…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto p-4">
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Paper Library
            </p>
            <span className="text-[11px] text-muted-foreground">{filteredPapers.length}</span>
          </div>
          <div className="space-y-2">
            {filteredPapers.length === 0 && (
              <p className="px-1 py-2 text-xs text-muted-foreground">No papers match your search.</p>
            )}
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                active={paper.id === activePaperId}
                onClick={() => {
                  onSelectPaper(paper)
                  onNavigate?.()
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Collections
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSelectCollection(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors duration-150",
                FOCUS_RING,
                !activeCollection ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span>All Papers</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  !activeCollection ? "bg-indigo-100 text-indigo-700" : "bg-muted text-muted-foreground"
                )}
              >
                {papers.length}
              </span>
            </button>
            {collections.map((collection) => {
              const isActive = activeCollection === collection.name
              return (
                <button
                  key={collection.name}
                  type="button"
                  onClick={() => onSelectCollection(collection.name)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors duration-150",
                    FOCUS_RING,
                    isActive ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Folder className="size-3.5 shrink-0" strokeWidth={2} />
                  <span className="flex-1 truncate text-left">{collection.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      isActive ? "bg-indigo-100 text-indigo-700" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {collection.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Recent Chats
          </p>
          <div className="space-y-0.5">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none transition-colors duration-150",
                  FOCUS_RING,
                  chat.active ? "bg-indigo-50/70 text-indigo-700" : "text-muted-foreground/90 hover:bg-muted"
                )}
              >
                <MessageSquareText className="size-3.5 shrink-0 opacity-60" strokeWidth={1.75} />
                <span className="flex-1 truncate text-xs font-normal">{chat.title}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground/70">{chat.time}</span>
              </button>
            ))}
          </div>
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
    </div>
  )
}

export function Sidebar({ open, onClose, ...contentProps }) {
  return (
    <>
      <aside className="hidden lg:flex lg:w-[280px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-white">
        <SidebarContent {...contentProps} />
      </aside>

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
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-white lg:hidden"
            >
              <SidebarContent {...contentProps} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
