"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { GLASS } from "@/lib/ui/pastel-theme";
import { MobileScreen } from "@/components/mobile/MobileScreen";

type Scope = "notes" | "edt" | "vie";

type Props = {
  scope: Scope;
  title: string;
  subtitle: string;
  children: (data: Record<string, unknown>) => React.ReactNode;
};

type State =
  | { status: "loading" }
  | { status: "ok"; data: Record<string, unknown> }
  | { status: "error"; message: string }
  | { status: "qcm" };

export function EcoleExtrasPanel({
  scope,
  title,
  subtitle,
  children,
}: Props) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const boot = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/ecoledirecte/extras?scope=${scope}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.qcm || data.code === 250) {
        setState({ status: "qcm" });
        return;
      }
      if (!data.ok) {
        setState({
          status: "error",
          message: data.error || "Impossible de charger",
        });
        return;
      }
      setState({ status: "ok", data });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Erreur réseau",
      });
    } finally {
      setRefreshing(false);
    }
  }, [scope]);

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;
    void load();
  }, [load]);

  return (
    <MobileScreen>
      <header className={`px-3.5 py-3.5 ${GLASS.panel}`}>
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <Link
              href="/ecole"
              className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sky-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              École
            </Link>
            <h1 className="app-title mt-0.5 text-slate-900">{title}</h1>
            <p className="app-sub mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              void load();
            }}
            disabled={refreshing}
            className="app-icon-btn rounded-2xl border border-white/70 bg-white/75 text-sky-700 shadow-sm active:scale-95 disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </header>

      {state.status === "loading" && (
        <p className="mt-3 rounded-3xl border border-white/60 bg-white/55 px-3.5 py-4 text-sm font-medium text-slate-600">
          Chargement…
        </p>
      )}

      {state.status === "qcm" && (
        <div className="mt-3 rounded-3xl border border-amber-200 bg-amber-50/95 px-3.5 py-3.5 text-sm text-amber-950">
          <p className="font-bold">Connexion sécurité requise</p>
          <p className="mt-1 text-[0.8125rem] text-amber-900/80">
            Ouvre Devoirs une fois pour le QCM, puis reviens.
          </p>
          <Link
            href="/devoirs"
            className="app-btn mt-3 inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-bold text-white"
          >
            Aller aux devoirs
          </Link>
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-3 rounded-3xl border border-rose-200 bg-rose-50/95 px-3.5 py-3.5 text-sm text-rose-950">
          <p className="font-bold">Pas de données</p>
          <p className="mt-1 break-words text-[0.8125rem]">{state.message}</p>
        </div>
      )}

      {state.status === "ok" && (
        <div className="mt-3 space-y-1.5">{children(state.data)}</div>
      )}
    </MobileScreen>
  );
}
