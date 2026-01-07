import { db } from "@/app/db";
import { apiKeyTable } from "@/app/db/schema";
import { and, gte, isNotNull, isNull } from "drizzle-orm";
import LoadingSpinner from "./LoadingSpinner";

export const dynamic = "force-dynamic";

export async function AvailableWorkers() {
  const dateNow = Date.now();
  const availableKeys = await db
    .select({
      id: apiKeyTable.id,
      name: apiKeyTable.name,
      isGrading: apiKeyTable.isGrading,
    })
    .from(apiKeyTable)
    .where(
      and(
        isNotNull(apiKeyTable.pingedAt),
        gte(apiKeyTable.pingedAt, dateNow - 1000 * 60),
        isNull(apiKeyTable.revokedAt),
      ),
    );

  return (
    <div className="p-4 bg-white border">
      <div className="text-sm text-gray-600">
        {availableKeys.length ? "" : "No"} Available Grading Workers
      </div>
      {availableKeys.length ? (
        <div className="flex flex-col gap-2">
          {availableKeys.map((key) => (
            <span
              className="inline-flex gap-2 items-center font-semibold"
              key={key.id}
            >
              {key.name || "Unnamed"}
              {key.isGrading ? (
                <span className="flex gap-1 items-center text-yellow-500">
                  <LoadingSpinner className="w-3 h-3" />
                  Grading
                </span>
              ) : (
                <span className="flex gap-1 items-center text-green-600">
                  <LoadingSpinner className="w-3 h-3" />
                  Available
                </span>
              )}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
