import { Grain } from "@/components/shared/Decor"

export function MainLayout({ children }) {
  return (
    <div className="relative isolate min-h-svh overflow-x-hidden bg-background">
      <Grain className="fixed z-50 opacity-[0.1]" />
      {children}
    </div>
  )
}
