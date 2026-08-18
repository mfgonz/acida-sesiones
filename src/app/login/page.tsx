import { signIn } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-base-700 bg-base-900 p-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
            A
          </div>
          <span className="text-lg font-semibold text-white">ACIDA</span>
        </div>
        <h1 className="mb-1 text-xl font-semibold text-white">Sign in</h1>
        <p className="mb-6 text-sm text-neutral-400">Manage your sessions and availability.</p>
        <form action={signIn} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-base-600 bg-base-850 px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          {searchParams.error && <p className="text-sm text-red-400">Invalid email or password.</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent/90"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
