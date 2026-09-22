import { signIn } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/80 p-8 shadow-lg backdrop-blur">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream">
            A
          </div>
          <span className="font-display text-lg font-bold text-ink">ACIDA</span>
        </div>
        <h1 className="mb-1 text-xl font-semibold text-ink">Sign in</h1>
        <p className="mb-6 text-sm text-ink/60">Manage your sessions and availability.</p>
        <form action={signIn} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink/70">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-terracotta"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/70">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-terracotta"
            />
          </div>
          {searchParams.error && <p className="text-sm text-red-600">Invalid email or password.</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-ink px-4 py-2.5 font-medium text-cream transition hover:bg-terracotta"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
