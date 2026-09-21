export function HubRouteSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-1 animate-pulse flex-col gap-3 sm:gap-4">
      <div className="h-28 rounded-3xl bg-white/60 sm:h-32" />
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-12">
        <div className="col-span-2 flex flex-col gap-3 lg:col-span-7">
          <div className="h-4 w-24 rounded-full bg-white/50" />
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white/55" />
            <div className="rounded-3xl bg-white/55" />
          </div>
        </div>
        <div className="col-span-2 flex flex-col gap-3 lg:col-span-5">
          <div className="h-24 rounded-3xl bg-white/50" />
          <div className="h-20 rounded-3xl bg-white/45" />
        </div>
      </div>
    </div>
  );
}
