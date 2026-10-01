import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin/admin-bar";
import { hasAdminSession } from "@/lib/admin-session";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-full bg-black text-white">
      <AdminBar />
      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
