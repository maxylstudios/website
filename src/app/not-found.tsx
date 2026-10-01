import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 pb-16 pt-28">
      <h1 className="text-4xl font-bold">That page is not here.</h1>
      <Link href="/" className="mt-6 inline-block text-sm text-muted hover:text-white">
        Back home
      </Link>
    </div>
  );
}
