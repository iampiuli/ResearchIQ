import { Link } from "react-router-dom"
import { SignIn, SignUp } from "@clerk/clerk-react"
import { Logo } from "@/components/shared/Logo"
import { MainLayout } from "@/layouts/MainLayout"
import { clerkAppearance } from "@/lib/clerk-appearance"

/** Shared shell for /sign-in and /sign-up: logo above Clerk's form, centered on the paper background. */
function AuthShell({ title, children }) {
  return (
    <MainLayout>
      <title>{title}</title>
      <meta name="robots" content="noindex" />
      <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-5 py-12">
        <Link to="/" aria-label="ResearchIQ home" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        {children}
      </main>
    </MainLayout>
  )
}

export function SignInPage() {
  return (
    <AuthShell title="Sign in — ResearchIQ">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/workspace"
        appearance={clerkAppearance}
      />
    </AuthShell>
  )
}

export function SignUpPage() {
  return (
    <AuthShell title="Create your account — ResearchIQ">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/workspace"
        appearance={clerkAppearance}
      />
    </AuthShell>
  )
}
