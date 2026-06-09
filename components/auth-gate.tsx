"use client"

import { useUser, SignInButton } from "@clerk/clerk-react"
import { useConvexAuth } from "convex/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/spinner"

type AuthGateProps = {
  signInLabel?: string
  signInSize?: "default" | "sm" | "lg" | "icon"
  signInVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function AuthGate ({
  signInLabel = "Get Notation Free",
  signInSize = "default",
  signInVariant = "default",
}: AuthGateProps) {
  const { user, isLoaded: clerkLoaded } = useUser()
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth()

  if (!clerkLoaded || convexLoading) {
    return <Spinner size="lg" />
  }

  if (isAuthenticated) {
    return (
      <Button asChild>
        <Link href="/documents">
          Enter Notation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    )
  }

  if (user) {
    return (
      <div className="w-full max-w-xl space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-left">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
          Signed in to Clerk, but Convex auth is not connected yet.
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>In Clerk → JWT templates, create/save a template named <strong>convex</strong>.</li>
          <li>Confirm <code className="text-xs">convex/auth.config.js</code> uses your Clerk issuer URL.</li>
          <li>Keep <code className="text-xs">pnpx convex dev</code> running, then refresh.</li>
        </ol>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry connection
        </Button>
      </div>
    )
  }

  return (
    <SignInButton
      mode="modal"
      asChild
      forceRedirectUrl="/documents"
      signUpForceRedirectUrl="/documents"
    >
      <Button size={signInSize} variant={signInVariant}>
        {signInLabel}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </SignInButton>
  )
}
