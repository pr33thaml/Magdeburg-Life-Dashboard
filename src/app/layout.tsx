import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAGmagdeburg · Healthcare & Population Dashboard",
  description:
    "Population, rescue, and healthcare in Magdeburg. An open-data dashboard built on KISS-MD.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${newsreader.variable} ${ibmPlex.variable} ${caveat.variable}`}>
      <body>
        <LocaleProvider>
          <ClientShell />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
