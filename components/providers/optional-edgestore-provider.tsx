"use client"

import { createContext, ReactNode, useContext } from "react"

import { EdgeStoreProvider } from "@/lib/edgestore"

const EdgeStoreEnabledContext = createContext(false)

export function useEdgeStoreEnabled() {
  return useContext(EdgeStoreEnabledContext)
}

export function OptionalEdgeStoreProvider({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  if (!enabled) {
    return (
      <EdgeStoreEnabledContext.Provider value={false}>
        {children}
      </EdgeStoreEnabledContext.Provider>
    )
  }

  return (
    <EdgeStoreEnabledContext.Provider value={true}>
      <EdgeStoreProvider>{children}</EdgeStoreProvider>
    </EdgeStoreEnabledContext.Provider>
  )
}
