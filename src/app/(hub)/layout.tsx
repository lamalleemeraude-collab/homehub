import { AppShell } from "@/components/layout/AppShell";
import { CalendarEventsProvider } from "@/contexts/CalendarEventsContext";
import { HubRefreshProvider } from "@/contexts/HubRefreshContext";
import { WeatherBulletinProvider } from "@/contexts/WeatherBulletinContext";
import { WebhookCalendarProvider } from "@/contexts/WebhookCalendarContext";

export default function HubLayout({ children }: LayoutProps<"/">) {
  return (
    <CalendarEventsProvider>
      <WebhookCalendarProvider>
        <WeatherBulletinProvider>
          <HubRefreshProvider>
            <AppShell>
              <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>
            </AppShell>
          </HubRefreshProvider>
        </WeatherBulletinProvider>
      </WebhookCalendarProvider>
    </CalendarEventsProvider>
  );
}
