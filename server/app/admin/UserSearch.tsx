"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type AdminFilter = "all" | "admin" | "student";

export default function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const admin = (form.elements.namedItem("admin") as HTMLSelectElement)
      .value as AdminFilter;

    const params = new URLSearchParams(searchParams.toString());

    if (email) params.set("email", email);
    else params.delete("email");

    if (admin !== "all") params.set("admin", admin);
    else params.delete("admin");

    // 🔑 reset pagination on new search
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap gap-3 items-end mb-6"
    >
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          name="email"
          defaultValue={searchParams.get("email") ?? ""}
          placeholder="user@mit.edu"
          className="border rounded px-2 py-1 w-64"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Role</label>
        <select
          name="admin"
          defaultValue={searchParams.get("admin") ?? "all"}
          className="border rounded px-2 py-1"
        >
          <option value="all">All users</option>
          <option value="admin">Admins only</option>
          <option value="student">Students only</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-1.5 rounded bg-blue-600 text-white"
      >
        Search
      </button>
    </form>
  );
}
