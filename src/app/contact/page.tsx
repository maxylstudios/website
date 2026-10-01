import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send an enquiry to Maxyl Studios.",
};

export default function ContactPage() {
  return (
    <div className="bg-transparent px-4 pb-16 pt-24 md:px-12">
      <p className="text-xs font-semibold tracking-[0.28em] text-muted uppercase">Contact us</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
        Tell us what you want made.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-muted">
        Tell us the project, the timing, and how to reply. The form is checked
        in this app. It does not send email until a mail provider is connected.
      </p>
      <EnquiryForm />
    </div>
  );
}
