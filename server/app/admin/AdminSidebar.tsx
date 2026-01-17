import Link from "next/link";

export default function AdminSidebar({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const baseClass = mobile
    ? "flex gap-4"
    : "flex flex-col gap-2";

  return (
    <nav className={baseClass}>
      <Link
        href="/admin"
        className="hover:underline"
      >
        Users
      </Link>

      <Link
        href="/admin/submissions"
        className="hover:underline"
      >
        Submissions
      </Link>

      <Link
        href="/admin/add"
        className="hover:underline"
      >
        Add users
      </Link>

      <Link
        href="/admin/apikeys"
        className="hover:underline"
      >
        Manage API Keys
      </Link>
    </nav>
  );
}
