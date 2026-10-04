import type { Metadata } from "next";
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
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-[#C6F135]"></span>
            <span className="font-mono font-bold tracking-wider text-white">SCRAPPY</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[#98A2B3]">
            <a href="/compare" className="hover:text-white transition-colors">
              Compare
            </a>
            <a href="/intelligence" className="hover:text-white transition-colors">
              Intelligence
            </a>
            <a href="/extract" className="hover:text-white transition-colors">
              Extract
            </a>
            <a href="/docs" className="hover:text-white transition-colors">
              Docs
            </a>
            <a href="/status" className="hover:text-white transition-colors">
              Status
            </a>
            <a href="/admin" className="hover:text-[#C6F135] text-xs font-mono px-2 py-1 rounded bg-[#14181F] border border-[#262E3C] transition-colors">
              Admin
            </a>
          </nav>
        </header>
        <main className="min-h-[calc(100vh-140px)]">{children}</main>
        <footer className="border-t border-[#262E3C] px-6 py-8 text-xs text-[#98A2B3] bg-[#0A0C0F]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6F135]"></span>
              <span className="font-mono text-white font-semibold">SCRAPPY</span>
              <span>— The Web Product & Price Graph</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-xs">
              <a href="/legal/responsible-scraping" className="hover:text-white transition-colors">
                Responsible Scraping
              </a>
              <a href="/legal/terms" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/status" className="hover:text-white transition-colors">
                Status
              </a>
              <a href="/admin" className="hover:text-white transition-colors">
                Admin
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
