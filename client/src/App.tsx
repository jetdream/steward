/**
 * The walking-skeleton app shell (ARC-2): a dev-login form → a dashboard that
 * lists/creates orgs (tRPC + Drizzle round-trip) and shows the live WebSocket
 * ping. It proves the front-to-back slice; it is NOT the One-Home experience
 * spine (that is built on approved screens through the design gate, GR-7).
 */
import { type FormEvent, useState } from "react";
import { useAuth } from "./api/useAuth";
import { useOrgs } from "./api/useOrgs";
import { usePing } from "./api/usePing";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold">Steward — walking skeleton</h1>
        {children}
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, pending }: { onSubmit: (email: string) => void; pending: boolean }) {
  const [email, setEmail] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) onSubmit(email.trim());
  };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@nonprofit.org"
        className="flex-1 rounded-md border border-neutral-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "…" : "Dev sign in"}
      </button>
    </form>
  );
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const { list, create } = useOrgs();
  const ping = usePing();
  const [name, setName] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600">
          Signed in as <strong>{email}</strong>
        </span>
        <button type="button" onClick={onLogout} className="text-sm underline">
          Sign out
        </button>
      </div>

      <div className="rounded-md border border-neutral-200 bg-white p-4">
        <div className="text-xs uppercase tracking-wide text-neutral-500">Live WebSocket ping</div>
        <div className="mt-1 font-mono text-sm">
          {ping ? `#${ping.seq} @ ${ping.at}` : "waiting for first tick…"}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            create.mutate({ name: name.trim() });
            setName("");
          }
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New organization name"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          Add org
        </button>
      </form>

      <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white">
        {list.isLoading && <li className="p-3 text-sm text-neutral-500">Loading…</li>}
        {list.data?.length === 0 && (
          <li className="p-3 text-sm text-neutral-500">No orgs yet — add one.</li>
        )}
        {list.data?.map((org) => (
          <li key={org.id} className="flex justify-between p-3 text-sm">
            <span>{org.name}</span>
            <span className="font-mono text-neutral-400">/{org.newsConfig.slug}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function App() {
  const { me, login, logout } = useAuth();

  if (me.isLoading) return <Shell>Loading…</Shell>;
  if (!me.data) {
    return (
      <Shell>
        <LoginForm onSubmit={(email) => login.mutate({ email })} pending={login.isPending} />
      </Shell>
    );
  }
  return (
    <Shell>
      <Dashboard email={me.data.email} onLogout={() => logout.mutate()} />
    </Shell>
  );
}
