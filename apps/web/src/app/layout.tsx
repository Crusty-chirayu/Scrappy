import type { Metadata } from "next";
import { ScrappyLogo } from "@scrappy/ui";
import { CommandPalette } from "../components/CommandPalette";
import { NotificationCenter } from "../components/NotificationCenter";
import { AuthProvider } from "../components/auth-context";
import { WorkspaceSwitcher } from "../components/WorkspaceSwitcher";
import { OfflineBanner } from "../components/OfflineBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRAPPY — The Web Product & Price Graph",
  description:
    "A precision data instrument for shoppers (Compare), businesses (Intelligence), and developers (Extract).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0C0F] text-[#D6DBE3] overflow-x-hidden">
        <AuthProvider>
          <header className="border-b border-[#262E3C] px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
            <a href="/" className="hover:opacity-90 transition-opacity">
              <ScrappyLogo state="idle" size={24} />
            </a>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#98A2B3] overflow-x-auto no-scrollbar">
                <a href="/compare" className="inline-flex items-center h-7 sm:h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Compare
                </a>
                <a href="/intelligence" className="inline-flex items-center h-7 sm:h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Intelligence
                </a>
                <a href="/extract" className="inline-flex items-center h-7 sm:h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Extract
                </a>
                <a href="/docs" className="inline-flex items-center h-7 sm:h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Docs
                </a>
                <a href="/status" className="inline-flex items-center h-7 sm:h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Status
                </a>
                <a href="/settings" className="inline-flex items-center h-7 sm:h-8 px-2 sm:px-3 text-[#C6F135] hover:underline transition-colors">
                  Settings
                </a>
              </nav>

              <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-[#262E3C]">
                <CommandPalette />
                <NotificationCenter />
                <WorkspaceSwitcher />
              </div>
            </div>
          </header>
          <OfflineBanner />
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          <footer className="border-t border-[#262E3C] px-4 sm:px-6 py-8 text-xs text-[#98A2B3] bg-[#0A0C0F]">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ScrappyLogo state="idle" size={18} showLabel={false} />
                <span className="font-mono text-white font-semibold">SCRAPPY</span>
                <span>— The Web Product & Price Graph</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 font-mono text-xs">
                <a href="/legal/responsible-scraping" className="inline-flex items-center h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Responsible Scraping
                </a>
                <a href="/legal/terms" className="inline-flex items-center h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Terms
                </a>
                <a href="/legal/privacy" className="inline-flex items-center h-8 px-2 sm:px-3 hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="/status" className="inline-flex items-center h-8 px-2 sm:px-3 hover:text-white transition-colors">
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
