"use client";
import { exportRoster } from "../lib/roster";

export default function DownloadRosterButton() {
  const handleClick = async () => {
    const blob = new Blob([await exportRoster()], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      className="py-2 px-4 text-white bg-black transition-colors hover:bg-gray-800"
      onClick={handleClick}
    >
      Download Grades
    </button>
  );
}
