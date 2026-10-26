import { useEffect } from "react"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom"
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react"
import { MotionConfig } from "framer-motion"
import { LandingPage } from "@/pages/LandingPage"
import { WorkspacePage } from "@/pages/WorkspacePage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { SignInPage, SignUpPage } from "@/pages/AuthPage"
import { setTokenGetter } from "@/lib/api"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

/** Hands Clerk's token getter to the API layer so every request is authenticated. */
function AuthBridge() {
  const { getToken } = useAuth()
  useEffect(() => {
    setTokenGetter(() => getToken())
  }, [getToken])
  return null
}

/** Keyed by user id so switching accounts remounts the workspace with that user's own data. */
function ProtectedWorkspace() {
  const { user } = useUser()
  return (
    <>
      <SignedIn>{user && <WorkspacePage key={user.id} userId={user.id} />}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function ClerkRoutes() {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <AuthBridge />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/workspace" element={<ProtectedWorkspace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ClerkProvider>
  )
}

function MissingConfig() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <h1 className="font-serif text-2xl">Sign-in is not configured</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in <code>frontend/.env.local</code> and restart the dev server.
        See docs/CONFIGURATION.md.
      </p>
    </main>
  )
}

function App() {
  if (!PUBLISHABLE_KEY) return <MissingConfig />
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ClerkRoutes />
      </BrowserRouter>
    </MotionConfig>
  )
}

export default App
