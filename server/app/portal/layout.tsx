import { redirect } from "next/navigation";
import PortalSidebar from "./PortalSidebar";
import { auth } from "../lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-56 border-r p-4">
        <PortalSidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile nav */}
        <div className="md:hidden border-b p-2">
          <PortalSidebar mobile />
        </div>

        <main className="max-w-2xl mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
