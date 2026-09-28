import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      <main className="mx-auto max-w-lg px-4 pt-6">{children}</main>
      <BottomNav />
    </div>
  );
}
