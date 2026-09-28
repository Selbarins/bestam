export default function AppLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title block */}
      <div>
        <div className="h-8 w-32 rounded-lg bg-[hsl(var(--muted))]" />
        <div className="mt-2 h-4 w-48 rounded bg-[hsl(var(--muted))]" />
      </div>

      {/* Hero / big number placeholder */}
      <div className="h-16 w-40 rounded-xl bg-[hsl(var(--muted))]" />

      {/* Cards */}
      <div className="space-y-3">
        <div className="h-24 rounded-2xl bg-[hsl(var(--muted))]" />
        <div className="h-24 rounded-2xl bg-[hsl(var(--muted))]" />
      </div>
    </div>
  );
}
