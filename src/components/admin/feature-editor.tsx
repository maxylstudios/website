"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePageHeroes } from "@/app/admin/actions";

export type FeatureChoice = {
  id: string;
  title: string;
  published: boolean;
};

export type FeatureSlot = {
  key: string;
  group: string;
  label: string;
  selected: string;
  choices: FeatureChoice[];
};

export function FeatureEditor({ slots, message }: { slots: FeatureSlot[]; message: string }) {
  const router = useRouter();
  const [picks, setPicks] = useState(() => Object.fromEntries(slots.map((slot) => [slot.key, slot.selected])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(message);
  const [saved, setSaved] = useState(false);
  const groups = [...new Set(slots.map((slot) => slot.group))];

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    const result = await savePageHeroes(picks);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-[#c4b5fd] uppercase">Page heroes</p>
          <h1 className="mt-2 text-3xl font-bold">What plays first</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Choose the film at the top of each Ads and Entertainment page. Automatic keeps the first wide video on that page.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded bg-[#8b5cf6] px-5 py-3 text-sm font-bold text-black disabled:opacity-40"
        >
          {busy ? "Saving" : "Save heroes"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {saved ? <p className="mt-4 text-sm text-[#c4b5fd]">Page heroes updated.</p> : null}

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="text-lg font-bold">{group}</h2>
            <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-[1.35rem] border border-white/15">
              {slots
                .filter((slot) => slot.group === group)
                .map((slot) => (
                  <li key={slot.key} className="grid gap-3 bg-white/[0.03] px-4 py-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center">
                    <p className="font-semibold">{slot.label}</p>
                    <select
                      value={picks[slot.key] ?? ""}
                      onChange={(event) => {
                        setSaved(false);
                        setPicks((current) => ({ ...current, [slot.key]: event.target.value }));
                      }}
                      className="w-full rounded-full border border-white/15 bg-black px-4 py-2.5 text-sm outline-none focus:border-[#c4b5fd]"
                    >
                      <option value="">Automatic</option>
                      {slot.choices.map((choice) => (
                        <option key={choice.id} value={choice.id}>
                          {choice.title}
                          {choice.published ? "" : " · hidden"}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
