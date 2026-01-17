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
    console.log("submit called")

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
    <form onSubmit={onSubmit} className="flex flex-wrap gap-3 items-end mb-6">
      <div>
        <label className="block mb-1 text-sm">Email</label>
        <input
          name="email"
          defaultValue={searchParams.get("email") ?? ""}
          placeholder="user@mit.edu"
          className="h-9 py-1 px-2 w-64 border text-base"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Role</label>
        <select
          name="admin"
          defaultValue={searchParams.get("admin") ?? "all"}
          className="h-9 py-1 px-2 border text-base"
        >
          <option value="all">All users</option>
          <option value="admin">Admins only</option>
          <option value="student">Students only</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="py-1.5 px-4 text-white bg-blue-600"
      >
        Search
      </button>
    </form>
  );
}
