"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DevoirsView } from "@/components/revisions/DevoirsView";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import type {
  HomeworkErrorResponse,
  HomeworkResponse,
} from "@/lib/ecoledirecte/types";

type Qcm = {
  question: string;
  propositions: string[];
  propositionValues: string[];
  token: string;
  twoFaToken?: string;
};

type ErrorPayload = HomeworkErrorResponse & {
  qcm?: Qcm;
  hint?: string;
};

type State =
  | { status: "loading" }
  | { status: "ok"; data: HomeworkResponse }
  | { status: "error"; data: ErrorPayload }
  | { status: "qcm"; qcm: Qcm }
  | { status: "idle" };

export default function DevoirsPage() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [username, setUsername] = useState("Lamalle_Maelle");
  const [password, setPassword] = useState("");
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [qcmBusy, setQcmBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const bootstrapped = useRef(false);
  const inFlight = useRef(false);

  const loadDevoirs = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState((prev) =>
      prev.status === "ok" ? prev : { status: "loading" }
    );
    try {
      const res = await fetch("/api/ecoledirecte", { cache: "no-store" });
      const data = (await res.json()) as HomeworkResponse | ErrorPayload;
      if ("qcm" in data && data.qcm) {
        setState({ status: "qcm", qcm: data.qcm });
        return;
      }
      if (!data.ok) {
        setState({ status: "error", data });
        return;
      }
      setState({ status: "ok", data });
    } catch (error) {
      setState({
        status: "error",
        data: {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Impossible de joindre l’API",
        },
      });
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/ecoledirecte/credentials", {
          cache: "no-store",
        });
        const data = (await res.json()) as {
          configured?: boolean;
          username?: string;
        };
        if (data.username) setUsername(data.username);
        setHasStoredPassword(Boolean(data.configured));
        if (data.configured) {
          await loadDevoirs();
        } else {
          setState({
            status: "error",
            data: {
              ok: false,
              error: "Identifiants ÉcoleDirecte manquants.",
              code: 503,
            },
          });
        }
      } catch {
        setState({
          status: "error",
          data: { ok: false, error: "Impossible de lire la config." },
        });
      }
    })();
  }, [loadDevoirs]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/ecoledirecte/credentials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          password: password || undefined,
          studentName: "Maelle",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setSaveError(data.error || "Enregistrement impossible");
        return;
      }
      setPassword("");
      setHasStoredPassword(true);
      await loadDevoirs();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Enregistrement impossible"
      );
    } finally {
      setSaving(false);
    }
  }

  async function answerQcm(choix: string) {
    if (qcmBusy) return;
    setQcmBusy(true);
    try {
      const res = await fetch("/api/ecoledirecte", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ choix }),
      });
      const data = (await res.json()) as HomeworkResponse | ErrorPayload;
      if ("qcm" in data && data.qcm && !data.ok) {
        setState({ status: "qcm", qcm: data.qcm });
        return;
      }
      if (!data.ok) {
        setState({ status: "error", data });
        return;
      }
      setState({ status: "ok", data });
    } catch (error) {
      setState({
        status: "error",
        data: {
          ok: false,
          error:
            error instanceof Error ? error.message : "Échec réponse QCM",
        },
      });
    } finally {
      setQcmBusy(false);
    }
  }

  const showLoginForm =
    state.status === "error" &&
    (state.data.code === 503 ||
      state.data.code === 505 ||
      state.data.error.toLowerCase().includes("identifiant") ||
      state.data.error.toLowerCase().includes("manquants"));

  if (state.status === "ok") {
    return (
      <DevoirsView
        data={state.data}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          void loadDevoirs();
        }}
      />
    );
  }

  return (
    <MobileScreen>
      <header className="mb-3.5">
        <Link
          href="/ecole"
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sky-600/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          École
        </Link>
        <h1 className="app-title mt-0.5 text-slate-900">Devoirs</h1>
      </header>

      {(state.status === "loading" || state.status === "idle") && (
        <p className="rounded-3xl border border-white/60 bg-white/55 px-3.5 py-4 text-sm font-medium text-slate-600 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
          Chargement des devoirs…
        </p>
      )}

      {showLoginForm && (
        <form
          onSubmit={onSubmit}
          className="mb-3 space-y-3 rounded-3xl border border-sky-200/70 bg-white/75 px-3.5 py-4 shadow-xl shadow-slate-900/10 backdrop-blur-2xl"
        >
          <p className="text-sm font-bold text-slate-900">
            Connexion ÉcoleDirecte
          </p>
          <label className="block space-y-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
              Identifiant
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="app-input w-full border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-sky-300 focus:ring-2"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
              Mot de passe {hasStoredPassword ? "(déjà enregistré)" : ""}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder={
                hasStoredPassword ? "Laisser vide pour garder l’actuel" : ""
              }
              className="app-input w-full border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-sky-300 focus:ring-2"
              required={!hasStoredPassword}
            />
          </label>
          {saveError && (
            <p className="text-sm font-medium text-rose-600">{saveError}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="app-btn w-full rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-md shadow-sky-300/40 active:opacity-90 disabled:opacity-60"
          >
            {saving ? "Connexion…" : "Connexion"}
          </button>
        </form>
      )}

      {state.status === "qcm" && (
        <div className="space-y-2.5 rounded-3xl border border-amber-200/80 bg-amber-50/95 px-3.5 py-4 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-amber-700">
            Sécurité ÉcoleDirecte
          </p>
          <p className="text-[0.9375rem] font-bold leading-snug text-slate-900">
            {state.qcm.question}
          </p>
          <p className="text-[0.75rem] font-medium text-rose-700">
            Une seule réponse — un seul tap.
          </p>
          <div className="flex max-h-[min(50dvh,22rem)] flex-col gap-1.5 overflow-y-auto overscroll-contain">
            {state.qcm.propositions.map((prop, index) => (
              <button
                key={`${prop}-${index}`}
                type="button"
                disabled={qcmBusy}
                onClick={() =>
                  void answerQcm(state.qcm.propositionValues[index] ?? prop)
                }
                className="app-btn rounded-xl border border-amber-200/80 bg-white px-3.5 text-left text-sm font-semibold text-slate-800 shadow-sm active:bg-amber-50 disabled:opacity-60"
              >
                {prop}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.status === "error" && !showLoginForm && (
        <div className="space-y-2.5 rounded-3xl border border-rose-200/70 bg-rose-50/90 px-3.5 py-4 text-sm text-rose-950 shadow-xl backdrop-blur-2xl">
          <p className="font-bold">Échec connexion</p>
          <p className="break-words text-[0.8125rem]">{state.data.error}</p>
          <button
            type="button"
            onClick={() => void loadDevoirs()}
            className="app-btn rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"
          >
            Réessayer une fois
          </button>
        </div>
      )}
    </MobileScreen>
  );
}
