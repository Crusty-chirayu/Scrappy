import type { Metadata } from "next";
import { ScrappyLogo } from "@scrappy/ui";
import { CommandPalette } from "../components/CommandPalette";
import { NotificationCenter } from "../components/NotificationCenter";
import { AuthProvider } from "../components/auth-context";
import { WorkspaceSwitcher } from "../components/WorkspaceSwitcher";
import { OfflineBanner } from "../components/OfflineBanner";
import { ThemeToggle } from "../components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRAPPY — The Web Product & Price Graph",
  description:
    "A precision data instrument for shoppers (Compare), businesses (Intelligence), and developers (Extract).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-[#0A0C0F] text-[#D6DBE3] overflow-x-hidden selection:bg-[#C6F135]/20 selection:text-[#C6F135]">
        <AuthProvider>
          <header className="border-b border-[#262E3C] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 bg-[#0A0C0F]/95 backdrop-blur-sm">
            <a
              href="/"
              className="hover:opacity-90 transition-opacity flex items-center min-h-[44px] min-w-[44px]"
              aria-label="SCRAPPY Home"
            >
              <ScrappyLogo state="idle" size={24} />
            </a>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <nav
                className="hidden sm:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#98A2B3] overflow-x-auto no-scrollbar"
                aria-label="Desktop primary navigation"
              >
                <a
                  href="/compare"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Compare
                </a>
                <a
                  href="/intelligence"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Intelligence
                </a>
                <a
                  href="/extract"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Extract
                </a>
                <a
                  href="/docs"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Docs
                </a>
                <a
                  href="/status"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Status
                </a>
                <a
                  href="/settings"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 text-[#C6F135] hover:underline transition-colors"
                >
                  Settings
                </a>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[#262E3C]">
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
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0F1217] border-t border-[#262E3C] flex items-center justify-around h-14 px-2"
            aria-label="Mobile bottom navigation"
          >
            <a
              href="/compare"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[#98A2B3] hover:text-white"
            >
              <span>Compare</span>
            </a>
            <a
              href="/intelligence"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[#98A2B3] hover:text-white"
            >
              <span>Intel</span>
            </a>
            <a
              href="/extract"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[#98A2B3] hover:text-white"
            >
              <span>Extract</span>
            </a>
            <a
              href="/docs"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[#98A2B3] hover:text-white"
            >
              <span>Docs</span>
            </a>
            <a
              href="/settings"
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[10px] font-mono text-[#C6F135]"
            >
              <span>Config</span>
            </a>
          </nav>

          <footer className="border-t border-[#262E3C] px-4 sm:px-6 py-8 text-xs text-[#98A2B3] bg-[#0A0C0F]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ScrappyLogo state="idle" size={18} showLabel={false} />
                <span className="font-mono text-white font-semibold">SCRAPPY</span>
                <span>— The Web Product &amp; Price Graph</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 font-mono text-xs">
                <a
                  href="/legal/responsible-scraping"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Responsible Scraping
                </a>
                <a
                  href="/legal/terms"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Terms
                </a>
                <a
                  href="/legal/privacy"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/status"
                  className="inline-flex items-center min-h-[44px] px-2 sm:px-3 hover:text-white transition-colors"
                >
                  Status
                </a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
