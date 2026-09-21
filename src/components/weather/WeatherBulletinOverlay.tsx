"use client";

import { WeatherScene } from "@/components/weather/WeatherScenes";
import { formatBulletinWind } from "@/lib/weather/bulletin";
import type { WeatherBulletin } from "@/lib/weather/bulletin";
import { RefreshCw, X } from "lucide-react";

type WeatherBulletinOverlayProps = {
  bulletin: WeatherBulletin | null;
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
};

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2.5 ring-1 ring-slate-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900 sm:text-lg">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs font-medium text-slate-500">{sub}</p>
      )}
    </div>
  );
}

export function WeatherBulletinOverlay({
  bulletin,
  loading,
  onClose,
  onRefresh,
}: WeatherBulletinOverlayProps) {
  const data = bulletin;
  const updatedLabel = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white shadow-lg shadow-slate-900/10 sm:max-w-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700/70">
              Bulletin expert
            </p>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {data?.location ?? "Saint-Lunaire"}
            </h2>
            <p className="text-xs font-medium text-slate-400">
              MAJ {updatedLabel}
              {data?.source === "fallback" ? " · hors ligne" : " · Open-Meteo"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-500 active:bg-slate-50 disabled:opacity-50"
              aria-label="Actualiser"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                strokeWidth={2}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-500 active:bg-slate-50"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </header>

        <div className="kiosk-scroll min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {loading && !data ? (
            <p className="py-12 text-center text-slate-400">Chargement…</p>
          ) : data ? (
            <>
              <section className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-sky-100">
                    <WeatherScene icon={data.current.icon} className="h-12 w-12" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Maintenant</p>
                    <p className="text-4xl font-bold tabular-nums text-slate-900">
                      {data.current.temp}°
                    </p>
                    <p className="text-sm font-semibold text-slate-600">
                      {data.current.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric
                    label="Ressenti"
                    value={`${data.current.feelsLike ?? "—"}°`}
                  />
                  <Metric
                    label="Humidité"
                    value={
                      data.current.humidity != null
                        ? `${data.current.humidity}%`
                        : "—"
                    }
                  />
                  <Metric
                    label="Vent"
                    value={
                      data.current.windKmh != null
                        ? `${data.current.windKmh} km/h`
                        : "—"
                    }
                    sub={formatBulletinWind(data.current).split("·").pop()?.trim()}
                  />
                  <Metric
                    label="Rafales"
                    value={
                      data.current.windGustKmh != null
                        ? `${data.current.windGustKmh} km/h`
                        : "—"
                    }
                  />
                  <Metric
                    label="UV"
                    value={
                      data.current.uvIndex != null
                        ? String(data.current.uvIndex)
                        : "—"
                    }
                  />
                  <Metric
                    label="Pression"
                    value={
                      data.current.pressureHpa != null
                        ? `${data.current.pressureHpa} hPa`
                        : "—"
                    }
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-amber-100/80 bg-amber-50/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800/70">
                  Côte & demain
                </p>
                <p className="mt-1 text-base font-bold text-slate-800">
                  {data.coastal.headline}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  {data.coastal.windSummary}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {data.coastal.rainOutlook}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-amber-100">
                    Parapluie {data.coastal.umbrellaScore}%
                  </span>
                  {data.coastal.gustAlert && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-900">
                      Alerte rafales
                    </span>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    Demain — {data.tomorrow.description}
                  </h3>
                  <span className="text-sm font-bold tabular-nums text-slate-500">
                    {data.tomorrow.tempMin}° / {data.tomorrow.tempMax}°
                  </span>
                </div>
                {data.tomorrowHourly.length > 0 ? (
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                    {data.tomorrowHourly.map((slot) => (
                      <div
                        key={slot.time}
                        className="flex w-[4.5rem] shrink-0 flex-col items-center rounded-xl bg-white px-2 py-2 ring-1 ring-slate-100"
                      >
                        <span className="text-[11px] font-bold text-slate-400">
                          {slot.hourLabel}
                        </span>
                        <WeatherScene
                          icon={slot.icon}
                          className="my-1 h-8 w-8"
                        />
                        <span className="text-sm font-bold tabular-nums text-slate-800">
                          {slot.temp}°
                        </span>
                        {slot.precipProbability != null &&
                          slot.precipProbability > 0 && (
                            <span className="text-[10px] font-semibold text-sky-600">
                              💧 {slot.precipProbability}%
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    {data.tomorrow.description} · {data.tomorrow.tempMin}°–
                    {data.tomorrow.tempMax}°
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  ☀️ {data.tomorrow.sunrise} · 🌙 {data.tomorrow.sunset} · UV max{" "}
                  {data.tomorrow.uvMax}
                </p>
              </section>

              {data.week.length > 0 && (
                <section>
                  <h3 className="mb-2 text-sm font-bold text-slate-800">
                    7 prochains jours
                  </h3>
                  <div className="space-y-1.5">
                    {data.week.map((day, i) => (
                      <div
                        key={day.date}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                          i === 1
                            ? "bg-sky-50 ring-1 ring-sky-100"
                            : "bg-white ring-1 ring-slate-100"
                        }`}
                      >
                        <span className="w-10 shrink-0 text-sm font-bold capitalize text-slate-500">
                          {i === 0 ? "Auj." : i === 1 ? "Dem." : day.weekday}
                        </span>
                        <WeatherScene icon={day.icon} className="h-8 w-8 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                          {day.description}
                        </span>
                        <span className="shrink-0 text-sm font-bold tabular-nums text-slate-800">
                          {day.tempMin}°–{day.tempMax}°
                        </span>
                        {day.precipProbMax > 30 && (
                          <span className="shrink-0 text-xs font-semibold text-sky-600">
                            {day.precipProbMax}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p className="py-12 text-center text-slate-500">
              Bulletin indisponible
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
