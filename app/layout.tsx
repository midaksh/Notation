import './globals.css'
import { Toaster } from "sonner"
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Script from "next/script"
import { randomUUID } from "crypto"
import { cookies } from "next/headers"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { ConvexClientProvider } from "@/components/providers/convex-provider"
import { ModalProvider } from "@/components/providers/modal-provider"
import { OptionalEdgeStoreProvider } from "@/components/providers/optional-edgestore-provider"
import { isEdgeStoreConfigured, isSupabaseConfigured } from "@/lib/env"
import { UTMTracker } from "./utm-stats/UTMTracker"
import { TurnstileGate } from "@/components/turnstile-gate"
import { TURNSTILE_COOKIE_NAME, TURNSTILE_COOKIE_VALUE } from "@/lib/turnstile"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notation',
  description: 'The connected workspace where better, faster work happens.',
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo.svg",
        href: "/logo.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo-dark.svg",
        href: "/logo-dark.svg",
      }
    ]
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialTurnstileVerified =
    cookies().get(TURNSTILE_COOKIE_NAME)?.value === TURNSTILE_COOKIE_VALUE

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
          />
        ) : null}
        <ConvexClientProvider>
          <OptionalEdgeStoreProvider enabled={isEdgeStoreConfigured()}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="notation-theme">
              <Toaster position="bottom-center" />
              <ModalProvider />
              <TurnstileGate initialVerified={initialTurnstileVerified} />
              {isSupabaseConfigured() ? <UTMTracker userId={`28-${randomUUID()}`} /> : null}
              {children}
            </ThemeProvider>
          </OptionalEdgeStoreProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
