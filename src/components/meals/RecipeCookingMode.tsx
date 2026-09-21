"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { RecipeProposal } from "@/lib/meals/chef-types";
import { useFullscreen } from "@/hooks/useFullscreen";
import { TouchButton } from "@/components/ui/TouchButton";

type RecipeCookingModeProps = {
  recipe: RecipeProposal;
  onClose: () => void;
  onComplete?: () => void;
};

type Phase = "intro" | "steps" | "done";

const STEP_EMOJIS = ["🔪", "🍳", "🥄", "🔥", "✨", "🧂", "🥗", "🍽️"];

function stepEmoji(index: number): string {
  return STEP_EMOJIS[index % STEP_EMOJIS.length];
}

export function RecipeCookingMode({
  recipe,
  onClose,
  onComplete,
}: RecipeCookingModeProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const { enter, exit } = useFullscreen();

  const totalSteps = recipe.steps.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const handleClose = useCallback(async () => {
    await exit();
    onClose();
  }, [exit, onClose]);

  const handleNext = useCallback(() => {
    if (phase === "intro") {
      setPhase("steps");
      return;
    }
    if (phase === "steps") {
      if (isLastStep) {
        setPhase("done");
        onComplete?.();
      } else {
        setStepIndex((i) => i + 1);
      }
    }
  }, [phase, isLastStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (phase === "steps" && stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else if (phase === "steps" && stepIndex === 0) {
      setPhase("intro");
    }
  }, [phase, stepIndex]);

  useEffect(() => {
    void enter();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      void exit();
    };
  }, [enter, exit]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        void handleClose();
        return;
      }
      if (phase === "done") return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, handleClose, handleNext, handlePrev]);

  const progress =
    phase === "intro"
      ? 0
      : phase === "done"
        ? 1
        : (stepIndex + 1) / totalSteps;

  return (
    <div
      className="recipe-cook-mode fixed inset-0 z-[200] flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Mode cuisine : ${recipe.title}`}
    >
      <div className="recipe-cook-mode__bg pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-10 flex shrink-0 items-center gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700/80">
            Mode chef
          </p>
          <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">
            <span className="mr-1.5" aria-hidden>
              {recipe.emoji}
            </span>
            {recipe.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void handleClose()}
          className="touch-target flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate-500 shadow-md active:scale-95"
          aria-label="Quitter le mode cuisine"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </header>

      <div className="relative z-10 px-4 sm:px-6">
        <div className="h-2 overflow-hidden rounded-full bg-white/50 shadow-inner">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"
            initial={false}
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          />
        </div>
        {phase === "steps" && (
          <p className="mt-2 text-center text-xs font-bold text-slate-500">
            Étape {stepIndex + 1} sur {totalSteps}
          </p>
        )}
      </div>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="flex w-full max-w-lg flex-col items-center text-center"
            >
              <motion.span
                className="text-7xl sm:text-8xl"
                aria-hidden
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
              >
                {recipe.emoji}
              </motion.span>
              <h3 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
                On cuisine !
              </h3>
              <p className="mt-2 text-base font-medium text-slate-600 sm:text-lg">
                {totalSteps} étapes · {recipe.prepMinutes} min
              </p>
              <div className="mt-6 w-full rounded-2xl border border-emerald-200/60 bg-white/75 px-4 py-3 text-left shadow-sm">
                <p className="text-sm font-bold text-emerald-800">💡 Astuce du chef</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {recipe.chefTip}
                </p>
              </div>
            </motion.div>
          )}

          {phase === "steps" && (
            <motion.div
              key={`step-${stepIndex}`}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="flex w-full max-w-2xl flex-col items-center text-center"
            >
              <span
                className="recipe-cook-mode__step-badge mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-lg sm:h-20 sm:w-20 sm:text-4xl"
                aria-hidden
              >
                {stepEmoji(stepIndex)}
              </span>
              <p className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-700">
                Étape {stepIndex + 1}
              </p>
              <p className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl sm:leading-tight">
                {recipe.steps[stepIndex]}
              </p>
              <div className="mt-8 flex justify-center gap-2">
                {recipe.steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStepIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === stepIndex
                        ? "w-8 bg-emerald-500"
                        : i < stepIndex
                          ? "w-2.5 bg-emerald-300"
                          : "w-2.5 bg-white/60"
                    }`}
                    aria-label={`Aller à l'étape ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex flex-col items-center text-center"
            >
              <motion.span
                className="text-8xl"
                aria-hidden
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.2 }}
              >
                🎉
              </motion.span>
              <h3 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
                Bon appétit !
              </h3>
              <p className="mt-2 max-w-sm text-lg font-medium text-slate-600">
                {recipe.title} est prêt{recipe.title.endsWith("s") ? "" : "e"} — régale-toi
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 shrink-0 space-y-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
        {phase !== "done" ? (
          <div className="mx-auto flex w-full max-w-lg gap-3">
            {(phase === "steps" || phase === "intro") && (
              <TouchButton
                ariaLabel="Étape précédente"
                onClick={handlePrev}
                disabled={phase === "intro"}
                className="flex min-h-[56px] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-600 shadow-sm disabled:opacity-35"
              >
                <ChevronLeft className="h-7 w-7" strokeWidth={2.5} />
              </TouchButton>
            )}
            <TouchButton
              ariaLabel={
                phase === "intro"
                  ? "Commencer la recette"
                  : isLastStep
                    ? "Terminer la recette"
                    : "Étape suivante"
              }
              onClick={handleNext}
              className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-300/40"
            >
              {phase === "intro" ? (
                <>C&apos;est parti 👨‍🍳</>
              ) : isLastStep ? (
                <>C&apos;est prêt ! 🎉</>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
                </>
              )}
            </TouchButton>
          </div>
        ) : (
          <TouchButton
            ariaLabel="Fermer"
            onClick={() => void handleClose()}
            className="mx-auto flex min-h-[56px] w-full max-w-lg items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg"
          >
            Terminer
          </TouchButton>
        )}

        <button
          type="button"
          onClick={() => void handleClose()}
          className="mx-auto block w-full py-2 text-center text-sm font-bold text-slate-500 active:text-slate-700"
        >
          Quitter la cuisine
        </button>
      </footer>
    </div>
  );
}
