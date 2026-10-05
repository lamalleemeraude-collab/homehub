"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { deleteDeck, loadDecks, saveDeck } from "@/lib/flashcards/local-store";
import type { FlashCard, FlashDeck } from "@/lib/flashcards/types";
import { formatHomeworkDay } from "@/lib/ecoledirecte/subjects";
import { GLASS } from "@/lib/ui/pastel-theme";

type HwItem = {
  id: number;
  date: string;
  matiere: string;
  interrogation: boolean;
  preview: string;
};

type View =
  | { name: "home" }
  | { name: "pick-devoirs" }
  | { name: "cours" }
  | { name: "ready"; deck: FlashDeck; message?: string }
  | { name: "study"; deck: FlashDeck };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FlashcardsApp() {
  const [view, setView] = useState<View>({ name: "home" });
  const [decks, setDecks] = useState<FlashDeck[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hwItems, setHwItems] = useState<HwItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [coursText, setCoursText] = useState("");
  const [coursMatiere, setCoursMatiere] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const boot = useRef(false);

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;
    setDecks(loadDecks());
  }, []);

  const loadHomework = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards/homework", { cache: "no-store" });
      const data = await res.json();
      if (data.code === 250) {
        setError("Ouvre d’abord Devoirs pour le QCM de connexion, puis reviens.");
        return;
      }
      if (!data.ok) {
        setError(data.error || "Impossible de charger les devoirs");
        return;
      }
      setHwItems(data.items || []);
      const evals = (data.items as HwItem[])
        .filter((i) => i.interrogation)
        .map((i) => i.id);
      setSelected(evals.length ? evals : (data.items as HwItem[]).slice(0, 3).map((i) => i.id));
      setView({ name: "pick-devoirs" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }, []);

  async function generateDevoirs() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "devoirs",
          homeworkIds: selected.length ? selected : undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Échec génération");
        return;
      }
      const deck = data.deck as FlashDeck;
      setDecks(saveDeck(deck));
      setView({ name: "ready", deck, message: data.message });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function generateCours() {
    if (!coursText.trim() && photos.length === 0) {
      setError("Ajoute une photo de ton cours, ou écris le texte.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "cours",
          text: coursText,
          images: photos,
          matiere: coursMatiere || undefined,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Échec génération");
        return;
      }
      const deck = data.deck as FlashDeck;
      setDecks(saveDeck(deck));
      setView({ name: "ready", deck, message: data.message });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function onPhotos(files: FileList | null) {
    if (!files?.length) return;
    const next: string[] = [...photos];
    for (const file of Array.from(files).slice(0, 4 - photos.length)) {
      if (!file.type.startsWith("image/")) continue;
      next.push(await fileToDataUrl(file));
    }
    setPhotos(next.slice(0, 4));
  }

  return (
    <MobileScreen>
      {view.name === "home" && (
        <HomeView
          decks={decks}
          busy={busy}
          error={error}
          onDevoirs={() => void loadHomework()}
          onCours={() => {
            setError(null);
            setView({ name: "cours" });
          }}
          onOpen={(deck) => setView({ name: "ready", deck })}
          onDelete={(id) => setDecks(deleteDeck(id))}
        />
      )}

      {view.name === "pick-devoirs" && (
        <PickDevoirsView
          items={hwItems}
          selected={selected}
          busy={busy}
          error={error}
          onToggle={(id) =>
            setSelected((s) =>
              s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
            )
          }
          onBack={() => setView({ name: "home" })}
          onGenerate={() => void generateDevoirs()}
        />
      )}

      {view.name === "cours" && (
        <CoursView
          text={coursText}
          matiere={coursMatiere}
          photos={photos}
          busy={busy}
          error={error}
          onText={setCoursText}
          onMatiere={setCoursMatiere}
          onPhotos={(f) => void onPhotos(f)}
          onRemovePhoto={(i) => setPhotos((p) => p.filter((_, j) => j !== i))}
          onBack={() => setView({ name: "home" })}
          onGenerate={() => void generateCours()}
        />
      )}

      {view.name === "ready" && (
        <ReadyView
          deck={view.deck}
          message={view.message}
          onBack={() => setView({ name: "home" })}
          onStudy={() => setView({ name: "study", deck: view.deck })}
        />
      )}

      {view.name === "study" && (
        <StudyView
          deck={view.deck}
          onExit={() => setView({ name: "ready", deck: view.deck })}
        />
      )}
    </MobileScreen>
  );
}

function HomeView({
  decks,
  busy,
  error,
  onDevoirs,
  onCours,
  onOpen,
  onDelete,
}: {
  decks: FlashDeck[];
  busy: boolean;
  error: string | null;
  onDevoirs: () => void;
  onCours: () => void;
  onOpen: (d: FlashDeck) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <header className={`px-3.5 py-3.5 ${GLASS.panel}`}>
        <Link
          href="/ecole"
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          École
        </Link>
        <h1 className="app-title mt-0.5 text-slate-900">Flashcards</h1>
        <p className="app-sub mt-1 leading-snug">
          Des cartes pour réviser vite. Choisis comment les créer — on t’explique
          à chaque étape.
        </p>
      </header>

      <div className={`mt-3 px-3.5 py-3 ${GLASS.panel}`}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600">
          Que dois-tu faire ?
        </p>
        <ol className="mt-2 space-y-1.5 text-[0.875rem] font-semibold leading-snug text-slate-700">
          <li>1. Choisis un mode ci-dessous.</li>
          <li>2. On crée tes cartes automatiquement.</li>
          <li>3. Tu révises : question → réponse → suivante.</li>
        </ol>
      </div>

      {error && (
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      )}

      <div className="mt-3 grid gap-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={onDevoirs}
          className="app-card-tap app-btn flex w-full flex-col items-start rounded-[1.35rem] border border-sky-200/80 bg-gradient-to-br from-sky-50 to-white px-3.5 py-3.5 text-left shadow-lg shadow-sky-900/5 disabled:opacity-60"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <BookOpen className="h-5 w-5" strokeWidth={2.4} />
            )}
          </span>
          <span className="mt-2.5 text-[1.05rem] font-black text-slate-900">
            Depuis mes devoirs
          </span>
          <span className="mt-1 text-[0.8125rem] font-medium leading-snug text-slate-500">
            On lit ÉcoleDirecte (devoirs + contrôles) et on fabrique des cartes
            sur ce qu’il faut savoir.
          </span>
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onCours}
          className="app-card-tap app-btn flex w-full flex-col items-start rounded-[1.35rem] border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white px-3.5 py-3.5 text-left shadow-lg shadow-violet-900/5"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 text-white shadow-md">
            <Camera className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="mt-2.5 text-[1.05rem] font-black text-slate-900">
            Photo ou texte de cours
          </span>
          <span className="mt-1 text-[0.8125rem] font-medium leading-snug text-slate-500">
            Si le prof n’a rien mis sur ÉcoleDirecte : photo du cahier / tableau,
            ou colle le texte.
          </span>
        </button>
      </div>

      {decks.length > 0 && (
        <section className="mt-5">
          <h2 className="app-section-label mb-1.5 px-0.5">Tes paquets</h2>
          <div className="space-y-1.5">
            {decks.map((d) => (
              <div
                key={d.id}
                className={`flex items-center gap-2 px-3 py-2.5 ${GLASS.panel}`}
              >
                <button
                  type="button"
                  onClick={() => onOpen(d)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {d.title}
                  </span>
                  <span className="block text-[0.75rem] font-medium text-slate-500">
                    {d.cards.length} cartes ·{" "}
                    {d.source === "devoirs" ? "Devoirs" : "Cours"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(d.id)}
                  className="app-icon-btn rounded-xl text-slate-400"
                  aria-label="Supprimer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function PickDevoirsView({
  items,
  selected,
  busy,
  error,
  onToggle,
  onBack,
  onGenerate,
}: {
  items: HwItem[];
  selected: number[];
  busy: boolean;
  error: string | null;
  onToggle: (id: number) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  return (
    <>
      <header className={`px-3.5 py-3.5 ${GLASS.panel}`}>
        <button
          type="button"
          onClick={onBack}
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </button>
        <h1 className="app-title mt-0.5 text-slate-900">Choisis quoi réviser</h1>
        <p className="app-sub mt-1 leading-snug">
          Coche les contrôles et devoirs importants. On créera des cartes
          complètes dessus.
        </p>
      </header>

      {error && (
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className={`mt-3 px-3.5 py-4 ${GLASS.panel}`}>
          <p className="text-sm font-bold text-slate-800">Rien à faire listé</p>
          <p className="mt-1 text-[0.8125rem] font-medium text-slate-500">
            Utilise plutôt « Photo ou texte de cours ».
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-1.5">
          {items.map((item) => {
            const on = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className={`app-card-tap flex w-full items-start gap-3 px-3 py-3 text-left ${GLASS.panel} ${
                  on ? "ring-2 ring-sky-300" : ""
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                    on
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">
                      {item.matiere}
                    </span>
                    {item.interrogation && (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase text-white">
                        Éval
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] font-medium text-slate-500">
                    {formatHomeworkDay(item.date)}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] font-medium leading-snug text-slate-600">
                    {item.preview}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={busy || selected.length === 0}
        onClick={onGenerate}
        className="app-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 text-base font-black text-white shadow-lg shadow-sky-300/40 disabled:opacity-40"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Création…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" /> Créer mes cartes
          </>
        )}
      </button>
    </>
  );
}

function CoursView({
  text,
  matiere,
  photos,
  busy,
  error,
  onText,
  onMatiere,
  onPhotos,
  onRemovePhoto,
  onBack,
  onGenerate,
}: {
  text: string;
  matiere: string;
  photos: string[];
  busy: boolean;
  error: string | null;
  onText: (v: string) => void;
  onMatiere: (v: string) => void;
  onPhotos: (f: FileList | null) => void;
  onRemovePhoto: (i: number) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  return (
    <>
      <header className={`px-3.5 py-3.5 ${GLASS.panel}`}>
        <button
          type="button"
          onClick={onBack}
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </button>
        <h1 className="app-title mt-0.5 text-slate-900">Ton cours</h1>
        <p className="app-sub mt-1 leading-snug">
          Le prof n’a rien mis ? Prends 1 à 4 photos nettes du cahier ou du
          tableau, ou colle le texte. Puis on fabrique les cartes.
        </p>
      </header>

      {error && (
        <p className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-900">
          {error}
        </p>
      )}

      <div className={`mt-3 space-y-3 px-3.5 py-3.5 ${GLASS.panel}`}>
        <label className="block space-y-1">
          <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-500">
            Matière (ex. Histoire, Maths…)
          </span>
          <input
            value={matiere}
            onChange={(e) => onMatiere(e.target.value)}
            className="app-input w-full border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-violet-300 focus:ring-2"
            placeholder="Optionnel"
          />
        </label>

        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-500">
            Photos du cours
          </p>
          <label className="app-btn mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-3 text-sm font-bold text-violet-800">
            <Camera className="h-5 w-5" />
            Prendre / choisir une photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => onPhotos(e.target.files)}
            />
          </label>
          {photos.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {photos.map((src, i) => (
                <div key={i} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(i)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="block space-y-1">
          <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-slate-500">
            Ou tape / colle le texte
          </span>
          <textarea
            value={text}
            onChange={(e) => onText(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 outline-none ring-violet-300 focus:ring-2"
            placeholder="Ex. définitions, dates, règles…"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={onGenerate}
        className="app-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 text-base font-black text-white shadow-lg shadow-violet-300/40 disabled:opacity-40"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Lecture du cours…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" /> Créer mes cartes
          </>
        )}
      </button>
    </>
  );
}

function ReadyView({
  deck,
  message,
  onBack,
  onStudy,
}: {
  deck: FlashDeck;
  message?: string;
  onBack: () => void;
  onStudy: () => void;
}) {
  return (
    <>
      <header className={`px-3.5 py-3.5 ${GLASS.panel}`}>
        <button
          type="button"
          onClick={onBack}
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Flashcards
        </button>
        <h1 className="app-title mt-0.5 text-slate-900">{deck.title}</h1>
        <p className="mt-1 text-[0.9375rem] font-bold leading-snug text-slate-800">
          {deck.mission}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {deck.cards.length} cartes · {deck.matiere}
        </p>
      </header>

      {message && (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[0.8125rem] font-medium text-amber-950">
          {message}
        </p>
      )}

      <div className={`mt-3 px-3.5 py-3.5 ${GLASS.panel}`}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600">
          Aperçu des questions
        </p>
        <ol className="mt-2 space-y-1.5 text-[0.875rem] font-semibold text-slate-700">
          {deck.cards.slice(0, 4).map((c, i) => (
            <li key={c.id} className="leading-snug">
              {i + 1}. {c.front}
            </li>
          ))}
          {deck.cards.length > 4 && (
            <li className="text-slate-500">
              … et {deck.cards.length - 4} autres
            </li>
          )}
        </ol>
      </div>

      <div className={`mt-3 px-3.5 py-3.5 ${GLASS.panel}`}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600">
          Comment faire
        </p>
        <ol className="mt-2 space-y-1.5 text-[0.875rem] font-semibold text-slate-700">
          {deck.howTo.map((step, i) => (
            <li key={i}>
              {i + 1}. {step}
            </li>
          ))}
        </ol>
      </div>

      <button
        type="button"
        onClick={onStudy}
        className="app-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 text-base font-black text-white shadow-lg"
      >
        <Layers className="h-5 w-5" />
        Commencer la révision
      </button>
    </>
  );
}

function StudyView({
  deck,
  onExit,
}: {
  deck: FlashDeck;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [queue, setQueue] = useState<FlashCard[]>(deck.cards);
  const card = queue[index];
  const done = index >= queue.length;

  function mark(ok: boolean) {
    if (!card) return;
    if (ok) setKnown((n) => n + 1);
    else {
      setUnknown((n) => n + 1);
      setQueue((q) => [...q, card]);
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (done) {
    return (
      <div className={`mt-2 px-3.5 py-5 text-center ${GLASS.panel}`}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-600">
          Bravo
        </p>
        <h2 className="app-title mt-1 text-slate-900">Session terminée</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          {known} bien su · {unknown} à revoir
        </p>
        <p className="mt-2 text-[0.875rem] font-medium text-slate-500">
          Conseil : refais les cartes ratées demain en 5 minutes.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setQueue(deck.cards);
              setIndex(0);
              setKnown(0);
              setUnknown(0);
              setFlipped(false);
            }}
            className="app-btn flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 text-sm font-bold text-white"
          >
            <RotateCcw className="h-4 w-4" /> Recommencer
          </button>
          <button
            type="button"
            onClick={onExit}
            className="app-btn rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-0.5">
        <button
          type="button"
          onClick={onExit}
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Pause
        </button>
        <p className="text-xs font-bold tabular-nums text-slate-500">
          {index + 1} / {queue.length}
        </p>
      </div>

      <p className="mt-2 px-0.5 text-[0.8125rem] font-semibold text-slate-600">
        {flipped
          ? "Lis la réponse. Tu savais ?"
          : "Lis la question. Réponds à voix haute, puis retourne."}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="relative mt-3 min-h-[14rem] w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${card.id}-${flipped}`}
            initial={{ opacity: 0, rotateY: -12 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 12 }}
            transition={{ duration: 0.2 }}
            className={`flex min-h-[14rem] flex-col justify-between px-4 py-5 text-left ${GLASS.panel} ${
              flipped
                ? "bg-gradient-to-br from-emerald-50/90 to-white/70"
                : "bg-gradient-to-br from-violet-50/90 to-white/70"
            }`}
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-400">
              {flipped ? "Réponse" : "Question"}
            </p>
            <p className="mt-3 text-[1.15rem] font-bold leading-snug text-slate-900">
              {flipped ? card.back : card.front}
            </p>
            {flipped && card.tip && (
              <p className="mt-4 text-[0.8125rem] font-medium text-slate-500">
                Astuce : {card.tip}
              </p>
            )}
            <p className="mt-4 text-center text-[0.75rem] font-semibold text-slate-400">
              Tap pour {flipped ? "revoir la question" : "voir la réponse"}
            </p>
          </motion.div>
        </AnimatePresence>
      </button>

      {flipped && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => mark(false)}
            className="app-btn flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3 text-sm font-bold text-rose-800"
          >
            <RefreshCw className="h-4 w-4" /> À revoir
          </button>
          <button
            type="button"
            onClick={() => mark(true)}
            className="app-btn flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 px-3 text-sm font-bold text-white"
          >
            <Check className="h-4 w-4" /> Je savais
          </button>
        </div>
      )}
    </>
  );
}
