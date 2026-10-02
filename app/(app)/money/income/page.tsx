import Link from "next/link";
import { IncomeForm } from "@/features/income/components/IncomeForm";

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add income</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Salary or other money received
          </p>
        </div>
        <Link
          href="/money"
          className="glass rounded-full px-3 py-1.5 text-xs font-medium"
        >
          Back
        </Link>
      </div>

      <div className="glass rounded-2xl p-4">
        <IncomeForm />
      </div>
    </div>
  );
}
