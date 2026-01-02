import Link from "next/link";

export default function PortalSidebar({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const baseClass = mobile ? "flex gap-4" : "flex flex-col gap-2";

  return (
    <nav className={baseClass}>
      <Link href="/portal" className="hover:underline">
        Portal
      </Link>

      <Link href="/portal/submit" className="hover:underline">
        Submit Assignment
      </Link>
    </nav>
  );
}
