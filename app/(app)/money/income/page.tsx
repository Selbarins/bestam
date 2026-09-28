import Link from "next/link";
import { IncomeForm } from "@/features/income/components/IncomeForm";

export default function IncomePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">Add income</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Salary or other money received
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          Cancel
        </Link>
      </div>

      <IncomeForm />
    </div>
  );
}
