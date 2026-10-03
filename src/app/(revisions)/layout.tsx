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
    <div className="relative z-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden text-slate-900">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
