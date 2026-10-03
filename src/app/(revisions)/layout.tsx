import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  applicationName: "École Maelle",
  title: {
    default: "École Maelle",
    template: "%s · École",
  },
  description: "Espace collège ÉcoleDirecte — devoirs, notes, EDT, focus",
  appleWebApp: {
    capable: true,
    title: "École",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#e8eef8",
};

export default function RevisionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mobile-app">
      <main className="mobile-app__scroll">{children}</main>
      <BottomNav />
    </div>
  );
}
