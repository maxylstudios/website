import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { CopySql } from "@/components/admin/copy-sql";

const files = ["01_tables.sql", "02_functions.sql", "03_policies.sql", "04_storage.sql", "06_catalogue.sql", "07_homepage.sql", "08_fix_upload_ticket.sql"];

export default function SetupPage() {
  const scripts = files.map((file) => ({
    file,
    sql: readFileSync(path.join(process.cwd(), "supabase", file), "utf8"),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">One-time setup</p>
      <h1 className="mt-3 text-4xl font-bold">Create the studio tables</h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        In the Supabase SQL editor, run these files in order. File 05 is the desk password, so it is not shown here. If 01 through 07 are already in, run only 08_fix_upload_ticket.sql.
      </p>
      <ol className="mt-6 space-y-10">
        {scripts.map((script, index) => (
          <li key={script.file}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">
                {index + 1}. {script.file}
              </h2>
              <CopySql sql={script.sql} />
            </div>
            <pre className="mt-3 max-h-72 overflow-auto rounded border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/80">
              {script.sql}
            </pre>
          </li>
        ))}
      </ol>
      <Link href="/admin/login" className="mt-8 inline-block rounded bg-white px-4 py-2 text-sm font-bold text-black">
        Create the admin account
      </Link>
    </div>
  );
}
