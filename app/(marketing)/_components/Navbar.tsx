'use client'

import { useUser } from "@clerk/clerk-react"
import { useConvexAuth } from "convex/react"
import { useScrollTop } from "@/hooks/use-scroll-top"
import { cn } from "@/lib/utils"
import { Logo } from "./Logo"
import { ModeToggle } from "@/components/mode-toggle"
import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/spinner"
import Link from "next/link"

const signInProps = {
  mode: "modal" as const,
  asChild: true,
  forceRedirectUrl: "/documents",
  signUpForceRedirectUrl: "/documents",
}

export function Navbar () {

  const { user, isLoaded: clerkLoaded } = useUser()
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth()
  const scrolled = useScrollTop()
  const isLoading = !clerkLoaded || convexLoading

return (
    <div className={cn(`z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6`,scrolled && 'border-b shadow-sm')}>
      <Logo/>
      <div className="md:ml-auto md:justify-end flex gap-x-2 justify-between items-center w-full">
        {isLoading && (
          <Spinner/>
        )}
        {!isLoading && !isAuthenticated && !user && (
          <>
            <SignInButton {...signInProps}>
              <Button variant='ghost' size='sm'>
                Login
              </Button>
            </SignInButton>
            <SignInButton {...signInProps}>
              <Button size='sm'>
                Get Notation free
              </Button>
            </SignInButton>
          </>
        )}
        {!isLoading && isAuthenticated && (
          <>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/documents'>
                Enter Notation
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/"/>
          </>
        )}
        <ModeToggle/>
      </div>
    </div>
)
}
