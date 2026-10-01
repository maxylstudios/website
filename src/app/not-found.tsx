import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8">
      <p className="text-[11px] tracking-[0.24em] text-muted uppercase">404</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight">
        That plate is not in the catalogue.
      </h1>
      <Link href="/work" className="mt-8 inline-block border-b border-ember pb-0.5">
        Back to the catalogue
      </Link>
    </div>
  );
}
