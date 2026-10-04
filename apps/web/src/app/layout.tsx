import type { Metadata } from "next";
import { ScrappyLogo } from "@scrappy/ui";
import { CommandPalette } from "../components/CommandPalette";
import { NotificationCenter } from "../components/NotificationCenter";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCRAPPY — The Web Product & Price Graph",
  description:
    "A precision data instrument for shoppers (Compare), businesses (Intelligence), and developers (Extract).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0C0F] text-[#D6DBE3]">
        <header className="border-b border-[#262E3C] px-6 py-4 flex items-center justify-between">
          <a href="/" className="hover:opacity-90 transition-opacity">
            <ScrappyLogo state="idle" size={26} />
          </a>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 text-sm text-[#98A2B3]">
              <a href="/compare" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Compare
              </a>
              <a href="/intelligence" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Intelligence
              </a>
              <a href="/extract" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Extract
              </a>
              <a href="/docs" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Docs
              </a>
              <a href="/status" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Status
              </a>
              <a href="/settings" className="inline-flex items-center h-8 px-3 text-[#C6F135] hover:underline transition-colors">
                Settings
              </a>
            </nav>

            <div className="flex items-center gap-3 pl-2 border-l border-[#262E3C]">
              <CommandPalette />
              <NotificationCenter />
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <footer className="border-t border-[#262E3C] px-6 py-8 text-xs text-[#98A2B3] bg-[#0A0C0F]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ScrappyLogo state="idle" size={18} showLabel={false} />
              <span className="font-mono text-white font-semibold">SCRAPPY</span>
              <span>— The Web Product & Price Graph</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <a href="/legal/responsible-scraping" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Responsible Scraping
              </a>
              <a href="/legal/terms" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Terms
              </a>
              <a href="/legal/privacy" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/status" className="inline-flex items-center h-8 px-3 hover:text-white transition-colors">
                Status
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
