"use client";

import { useActionState } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/contact/actions";

const initialState: EnquiryState = { status: "idle", message: "" };

const fields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
] as const;

export function EnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initialState);

  return (
    <form action={action} className="mt-10 max-w-xl" noValidate>
      {fields.map((field) => (
        <label key={field.name} className="mb-6 block">
          <span className="text-[11px] tracking-[0.18em] text-muted uppercase">
            {field.label}
          </span>
          <input
            key={`${field.name}-${state.message}`}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required
            defaultValue={state.values?.[field.name] ?? ""}
            className="mt-2 w-full border-b border-white/20 bg-transparent py-2 text-white outline-none"
          />
          {state.fieldErrors?.[field.name] ? (
            <span className="mt-2 block text-sm text-ember">
              {state.fieldErrors[field.name]}
            </span>
          ) : null}
        </label>
      ))}
      <label className="mb-8 block">
        <span className="text-[11px] tracking-[0.18em] text-muted uppercase">
          Message
        </span>
        <textarea
          key={`message-${state.message}`}
          name="message"
          required
          rows={6}
          defaultValue={state.values?.message ?? ""}
          className="mt-2 w-full resize-y border-b border-white/20 bg-transparent py-2 text-white outline-none"
        />
        {state.fieldErrors?.message ? (
          <span className="mt-2 block text-sm text-ember">
            {state.fieldErrors.message}
          </span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ember px-5 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Sending" : "Send enquiry"}
      </button>
      {state.message ? (
        <p
          className={`mt-5 text-sm ${state.status === "error" ? "text-ember" : "text-white"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
