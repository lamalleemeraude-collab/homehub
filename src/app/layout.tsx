import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { HubAmbientBackground } from "@/components/layout/HubAmbientBackground";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  applicationName: "Hub Familial",
  title: "Hub Familial",
  description: "Tableau de bord familial pour tablette",
  appleWebApp: {
    capable: true,
    title: "Hub Familial",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#eef2f8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="kiosk-shell overflow-hidden text-slate-900 antialiased">
        <HubAmbientBackground />
        {children}
      </body>
    </html>
  );
}
