import { Link } from "react-router-dom"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/layouts/MainLayout"

export function NotFoundPage() {
  return (
    <MainLayout>
      <title>Page not found — ResearchIQ</title>
      <meta name="robots" content="noindex" />
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-5 py-12 text-center">
        <Link to="/" aria-label="ResearchIQ home" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="font-serif text-4xl tracking-[-0.02em] text-balance sm:text-5xl">This page isn't in the library.</h1>
        <p className="max-w-md text-muted-foreground">The link may be broken or the page may have moved.</p>
        <Button size="lg" render={<Link to="/" />} nativeButton={false}>
          Back to home
        </Button>
      </main>
    </MainLayout>
  )
}
