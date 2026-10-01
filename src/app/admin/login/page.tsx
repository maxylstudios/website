"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAdmin } from "@/app/admin/actions";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await loginAdmin(password);
    if (!result.ok) {
      setMessage(result.message);
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Maxyl Studios</p>
      <h1 className="mt-3 text-4xl font-bold">Studio desk</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        One password opens the desk. No account.
      </p>
      <form onSubmit={(event) => void submit(event)} className="mt-8">
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full border-b border-white/20 bg-transparent py-2 outline-none"
          />
        </label>
        {message ? <p className="mt-4 text-sm text-ember">{message}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 rounded bg-ember px-4 py-2 text-sm font-bold disabled:opacity-60"
        >
          {busy ? "Checking" : "Enter"}
        </button>
      </form>
      <Link href="/" className="mt-8 text-sm text-muted hover:text-white">
        Back to the site
      </Link>
    </div>
  );
}
