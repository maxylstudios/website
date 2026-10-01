import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send an enquiry to Maxyl Studios.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <p className="text-[11px] tracking-[0.24em] text-muted uppercase">Contact</p>
      <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.95] tracking-tight md:text-6xl">
        Write to the studio.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
        Tell us the project, the timing, and how to reply. The form is checked
        in this app. It does not send email until a mail provider is connected.
      </p>
      <EnquiryForm />
    </div>
  );
}
