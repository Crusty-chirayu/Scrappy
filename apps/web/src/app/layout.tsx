import type { Metadata } from "next";
import { AuthProvider } from "../components/auth-context";
import { AppShell } from "../components/AppShell";
import { fontUi, fontDisplay, fontMono, fontSerif } from "./fonts";
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
      className={`${fontUi.variable} ${fontDisplay.variable} ${fontMono.variable} ${fontSerif.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem('scrappy-theme');var pref=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';var theme=stored||pref;document.documentElement.setAttribute('data-theme',theme);var storedDensity=localStorage.getItem('scrappy-density')||'comfortable';document.documentElement.setAttribute('data-density',storedDensity);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] font-sans antialiased selection:bg-[var(--color-accent)]/20 selection:text-[var(--color-accent)]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
