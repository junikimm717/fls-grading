import { isAdminQuery } from "@/app/lib/is-admin";
import { notFound } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isAdminQuery();

  if (!isAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-56 border-r p-4">
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile nav */}
        <div className="md:hidden border-b p-2">
          <AdminSidebar mobile />
        </div>

        <main className="max-w-2xl mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
