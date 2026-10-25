import { MainLayout } from "@/layouts/MainLayout"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { Features } from "@/components/sections/Features"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { WorkspacePreview } from "@/components/sections/WorkspacePreview"
import { QuestionStrip } from "@/components/sections/QuestionStrip"
import { Stats } from "@/components/sections/Stats"
import { Faq } from "@/components/sections/Faq"

export function LandingPage() {
  return (
    <MainLayout>
      <Navbar />
      <main>
        <Hero />
        <QuestionStrip />
        <Features />
        <Stats />
        <HowItWorks />
        <WorkspacePreview />
        <Faq />
      </main>
      <Footer />
    </MainLayout>
  )
}
