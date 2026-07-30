import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { WorkspaceLayout } from "@/layouts/WorkspaceLayout"
import { Sidebar } from "@/components/workspace/Sidebar"
import { Topbar } from "@/components/workspace/Topbar"
import { ChatMessage, TypingIndicator } from "@/components/workspace/ChatMessage"
import { ChatInput } from "@/components/workspace/ChatInput"
import { PDFViewer } from "@/components/workspace/PDFViewer"
import { cn } from "@/lib/utils"
import {
  CANNED_REPLIES,
  COLLECTIONS,
  CURRENT_USER,
  INITIAL_CONVERSATION,
  PAPERS,
  RECENT_CHATS,
  SUGGESTED_PROMPTS,
} from "@/lib/dummy-data"

let messageId = INITIAL_CONVERSATION.length + 1

export function WorkspacePage() {
  const [messages, setMessages] = useState(INITIAL_CONVERSATION)
  const [draft, setDraft] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [replyIndex, setReplyIndex] = useState(0)

  const [activePaperId, setActivePaperId] = useState("attention")
  const [activePage, setActivePage] = useState(2)
  const [highlightedPage, setHighlightedPage] = useState(2)
  const [zoom, setZoom] = useState(100)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeCollection, setActiveCollection] = useState(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)

  const scrollRef = useRef(null)

  const activePaper = PAPERS.find((paper) => paper.id === activePaperId) ?? PAPERS[0]

  const filteredPapers = PAPERS.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCollection = !activeCollection || paper.collection === activeCollection
    return matchesSearch && matchesCollection
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isThinking])

  function handleCitationClick(citation) {
    setActivePaperId(citation.paperId)
    setActivePage(citation.page)
    setHighlightedPage(citation.page)
    setZoom(100)
    setSourceOpen(true)
  }

  function handleSelectPaper(paper) {
    setActivePaperId(paper.id)
    setActivePage(1)
    setHighlightedPage(null)
    setZoom(100)
    setSourceOpen(true)
  }

  function handleSend() {
    const content = draft.trim()
    if (!content || isThinking) return

    setMessages((prev) => [...prev, { id: `m${messageId++}`, role: "user", content }])
    setDraft("")
    setIsThinking(true)

    setTimeout(() => {
      const reply = CANNED_REPLIES[replyIndex % CANNED_REPLIES.length]
      setMessages((prev) => [...prev, { id: `m${messageId++}`, role: "assistant", ...reply }])
      setReplyIndex((i) => i + 1)
      setIsThinking(false)
    }, 900)
  }

  function handleNewChat() {
    setMessages(INITIAL_CONVERSATION)
    setDraft("")
  }

  const sidebarProps = {
    papers: PAPERS,
    filteredPapers,
    collections: COLLECTIONS,
    activeCollection,
    onSelectCollection: setActiveCollection,
    recentChats: RECENT_CHATS,
    activePaperId,
    onSelectPaper: handleSelectPaper,
    searchQuery,
    onSearchChange: setSearchQuery,
    onNewChat: handleNewChat,
  }

  return (
    <WorkspaceLayout>
      <div className="flex h-full">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} {...sidebarProps} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            user={CURRENT_USER}
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenSource={() => setSourceOpen(true)}
          />

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b border-border px-6 py-5 lg:px-10">
                <h1 className="text-base font-semibold text-foreground">
                  Comparing attention mechanisms across papers
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">3 sources referenced</p>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-8 overflow-y-auto px-6 py-8 lg:px-10">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} onCitationClick={handleCitationClick} />
                ))}
                {isThinking && <TypingIndicator />}
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
            </div>

            <aside className="hidden xl:flex xl:w-[420px] xl:shrink-0 xl:flex-col xl:border-l xl:border-border">
              <PDFViewer
                paper={activePaper}
                page={activePage}
                zoom={zoom}
                highlightedPage={highlightedPage}
                onPrevPage={() => setActivePage((p) => Math.max(1, p - 1))}
                onNextPage={() => setActivePage((p) => Math.min(activePaper.pages, p + 1))}
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
                      onPrevPage={() => setActivePage((p) => Math.max(1, p - 1))}
                      onNextPage={() => setActivePage((p) => Math.min(activePaper.pages, p + 1))}
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
