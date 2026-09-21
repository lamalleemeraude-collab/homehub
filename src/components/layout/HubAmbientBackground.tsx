"use client";

/** Fond mesh clair et aéré — le verre reste lisible dessus. */
export function HubAmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#eef2f8]" />

      <div
        className="absolute -left-[15%] -top-[25%] h-[70%] w-[70%] rounded-full opacity-90 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(186 210 255 / 0.85) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(221 198 255 / 0.7) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute left-[35%] top-[35%] h-[45%] w-[45%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(186 240 230 / 0.55) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute right-[25%] top-[8%] h-[30%] w-[35%] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(255 220 200 / 0.45) 0%, transparent 70%)",
        }}
      />

      {/* Voile très léger pour unifier — pas d’assombrissement fort */}
      <div className="absolute inset-0 bg-white/25" />
    </div>
  );
}
