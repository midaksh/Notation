import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import supabaseServer from "@/libs/supabaseServer"
import { isSupabaseConfigured } from "@/lib/env"

export const metadata: Metadata = {
  title: "Notation — UTM stats",
  description: "Dashboard for UTM visit analytics",
}

export default async function UTMLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    redirect("/")
  }

  const { data: role_response, error: anonymous_user } = await supabaseServer().from("users").select("roles").single()

  if (!role_response?.roles.includes("ADMIN") || anonymous_user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Back to Notation
        </Link>
      </header>
      {children}
    </div>
  )
}
