"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { DevoirsView } from "@/components/revisions/DevoirsView";
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
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600/80">
          Révisions
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          Devoirs
        </h1>
      </header>

      {(state.status === "loading" || state.status === "idle") && (
        <p className="rounded-3xl border border-white/60 bg-white/55 px-4 py-5 text-sm font-medium text-slate-600 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
          Chargement des devoirs…
        </p>
      )}

      {showLoginForm && (
        <form
          onSubmit={onSubmit}
          className="mb-4 space-y-3 rounded-3xl border border-sky-200/70 bg-white/70 px-4 py-5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl"
        >
          <p className="text-sm font-bold text-slate-900">
            Connexion ÉcoleDirecte
          </p>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Identifiant
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-sky-300 focus:ring-2"
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-sky-300 focus:ring-2"
              required={!hasStoredPassword}
            />
          </label>
          {saveError && (
            <p className="text-sm font-medium text-rose-600">{saveError}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-sky-300/40 active:opacity-90 disabled:opacity-60"
          >
            {saving ? "Connexion…" : "Connexion"}
          </button>
        </form>
      )}

      {state.status === "qcm" && (
        <div className="space-y-3 rounded-3xl border border-amber-200/80 bg-amber-50/90 px-4 py-5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Sécurité ÉcoleDirecte
          </p>
          <p className="text-base font-bold text-slate-900">
            {state.qcm.question}
          </p>
          <p className="text-xs font-medium text-rose-700">
            Une seule réponse — pas de double-clic.
          </p>
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {state.qcm.propositions.map((prop, index) => (
              <button
                key={`${prop}-${index}`}
                type="button"
                disabled={qcmBusy}
                onClick={() =>
                  void answerQcm(state.qcm.propositionValues[index] ?? prop)
                }
                className="rounded-xl border border-amber-200/80 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm active:bg-amber-50 disabled:opacity-60"
              >
                {prop}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.status === "error" && !showLoginForm && (
        <div className="space-y-3 rounded-3xl border border-rose-200/70 bg-rose-50/80 px-4 py-5 text-sm text-rose-950 shadow-xl backdrop-blur-2xl">
          <p className="font-bold">Échec connexion</p>
          <p>{state.data.error}</p>
          <button
            type="button"
            onClick={() => void loadDevoirs()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
          >
            Réessayer une fois
          </button>
        </div>
      )}
    </div>
  );
}
