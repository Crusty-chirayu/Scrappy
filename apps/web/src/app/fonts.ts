import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600"],
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

export const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400"],
  style: ["italic", "normal"],
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

export const fontUi = GeistSans;
export const fontMono = GeistMono;
