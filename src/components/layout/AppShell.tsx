import { SidebarNav } from "./Nav";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="kiosk-shell relative z-0 flex flex-row bg-transparent">
      <SidebarNav />
      <main className="kiosk-main kiosk-scroll flex min-h-0 flex-1 flex-col overflow-hidden pb-[var(--kiosk-pad)]">
        {children}
      </main>
    </div>
  );
}
