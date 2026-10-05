import type { Metadata } from "next";
import { ScrappyLogo } from "@scrappy/ui";
import { CommandPalette } from "../components/CommandPalette";
import { NotificationCenter } from "../components/NotificationCenter";
import { AuthProvider } from "../components/auth-context";
import { WorkspaceSwitcher } from "../components/WorkspaceSwitcher";
import { OfflineBanner } from "../components/OfflineBanner";
import { ThemeToggle } from "../components/ThemeToggle";
import { fontUi, fontDisplay, fontMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRAPPY — The Web Product & Price Graph",
  description:
    "A precision data instrument for shoppers (Compare), businesses (Intelligence), and developers (Extract).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontUi.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem('scrappy-theme');var pref=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';var theme=stored||pref;document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] overflow-x-hidden selection:bg-[var(--color-accent)]/20 selection:text-[var(--color-accent)] font-sans antialiased transition-colors duration-150">
        <AuthProvider>
          <header className="border-b border-[var(--border)] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 bg-[var(--surface-0)]/95 backdrop-blur-sm transition-colors duration-150">
            <a
              href="/"
              className="hover:opacity-90 transition-opacity flex items-center min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-sm)]"
              aria-label="SCRAPPY Home"
            >
              <ScrappyLogo state="idle" size={24} />
            </a>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <nav
                className="hidden sm:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--text-2)] overflow-x-auto no-scrollbar"
                aria-label="Desktop primary navigation"
              >
                <a
                  href="/compare"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Compare
                </a>
                <a
                  href="/intelligence"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Intelligence
                </a>
                <a
                  href="/extract"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Extract
                </a>
                <a
                  href="/docs"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Docs
                </a>
                <a
                  href="/dev/kit"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  UI Kit
                </a>
                <a
                  href="/status"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Status
                </a>
                <a
                  href="/settings"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 text-[var(--color-accent)] hover:underline transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Settings
                </a>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[var(--border)]">
                <ThemeToggle />
                <CommandPalette />
                <NotificationCenter />
                <WorkspaceSwitcher />
              </div>
            </div>
          </header>

          <OfflineBanner />

          {/* Main content with padding bottom on mobile to accommodate fixed bottom bar */}
          <main className="min-h-[calc(100vh-140px)] pb-16 sm:pb-0">{children}</main>

          {/* Mobile Bottom Navigation Bar (360px Touch Targets >= 44px) */}
          <nav
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-1)] border-t border-[var(--border)] flex items-center justify-around h-14 px-2"
            aria-label="Mobile bottom navigation"
          >
            <a
              href="/compare"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[var(--text-2)] hover:text-[var(--text-1)]"
            >
              <span>Compare</span>
            </a>
            <a
              href="/intelligence"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[var(--text-2)] hover:text-[var(--text-1)]"
            >
              <span>Intel</span>
            </a>
            <a
              href="/extract"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[var(--text-2)] hover:text-[var(--text-1)]"
            >
              <span>Extract</span>
            </a>
            <a
              href="/dev/kit"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[var(--text-2)] hover:text-[var(--text-1)]"
            >
              <span>Kit</span>
            </a>
            <a
              href="/settings"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[var(--color-accent)]"
            >
              <span>Config</span>
            </a>
          </nav>

          <footer className="border-t border-[var(--border)] px-4 sm:px-6 py-8 text-xs text-[var(--text-2)] bg-[var(--surface-0)] transition-colors duration-150">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ScrappyLogo state="idle" size={18} showLabel={false} />
                <span className="font-mono text-[var(--text-1)] font-semibold">SCRAPPY</span>
                <span>— The Web Product &amp; Price Graph</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 font-mono text-xs">
                <a
                  href="/legal/responsible-scraping"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Responsible Scraping
                </a>
                <a
                  href="/legal/terms"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Terms
                </a>
                <a
                  href="/legal/privacy"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Privacy
                </a>
                <a
                  href="/dev/kit"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-[var(--text-1)] transition-colors rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                >
                  Design Kit
                </a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
