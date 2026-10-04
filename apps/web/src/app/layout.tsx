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
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
