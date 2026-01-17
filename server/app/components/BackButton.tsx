"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  "use client";
  const router = useRouter();

  return (
    <button className="text-blue-700 underline" onClick={() => router.back()}>
      Back
    </button>
  );
}
