"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function UserPagination({
  page,
  hasNext,
}: {
  page: number;
  hasNext: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <div className="flex justify-between items-center mt-6">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="py-1 px-3 border disabled:opacity-50"
      >
        Previous
      </button>

      <span className="text-sm">Page {page}</span>

      <button
        disabled={!hasNext}
        onClick={() => setPage(page + 1)}
        className="py-1 px-3 border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
