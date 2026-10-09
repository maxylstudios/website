import { redirect } from "next/navigation";
import { AdminBar } from "@/components/admin/admin-bar";
import { hasAdminSession } from "@/lib/admin-session";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.16),transparent_34%),#000] text-white">
      <AdminBar />
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
