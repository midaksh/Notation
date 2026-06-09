'use client'

import { AuthGate } from "@/components/auth-gate"

export default function Heading () {

return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Your Ideas, Documents, & Plans. Unified. Welcome to <span className="underline">Notation</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Notation is the connected workspace where <br/>
      better, faster work happens</h3>
      <AuthGate />
    </div>
)
}
