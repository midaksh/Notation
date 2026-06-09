'use client'

import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Navigation } from "./_components/Navigation";
import { SearchCommand } from "@/components/search-command";

export default function MainLayout ({children}:{children:React.ReactNode}) {

  const router = useRouter()
  const {isAuthenticated,isLoading} = useConvexAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center">
        <Spinner size='lg'/>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex justify-center items-center">
        <Spinner size='lg'/>
      </div>
    )
  }

return (
  <div className="h-full flex dark:bg-[#1F1F1F]">
    <Navigation/>
    <main className="flex-1 h-full overflow-y-auto">
      <SearchCommand/>
      {children}
    </main>
  </div>
)
}
