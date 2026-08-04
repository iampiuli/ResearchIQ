import { MainLayout } from "@/layouts/MainLayout"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { Features } from "@/components/sections/Features"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { WorkspacePreview } from "@/components/sections/WorkspacePreview"

export function LandingPage() {
  return (
    <MainLayout>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <WorkspacePreview />
      </main>
      <Footer />
    </MainLayout>
  )
}
