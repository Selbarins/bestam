import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--primary))]">
            Bestam
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Personal budget & financial stability
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
