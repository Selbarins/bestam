import { Suspense } from "react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, hsl(152 30% 90% / 0.55), transparent), radial-gradient(900px 500px at 100% 0%, hsl(40 40% 94% / 0.9), transparent), hsl(40 33% 98%)",
      }}
    >
      <main className="mx-auto max-w-lg px-4 pt-6 pb-2">{children}</main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
