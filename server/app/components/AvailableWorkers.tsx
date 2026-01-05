import { db } from "@/app/db";
import { apiKeyTable } from "@/app/db/schema";
import { and, gte, isNotNull, isNull } from "drizzle-orm";

export async function AvailableWorkers() {
  const availableKeys = await db
    .select({
      id: apiKeyTable.id,
      name: apiKeyTable.name,
    })
    .from(apiKeyTable)
    .where(
      and(
        isNotNull(apiKeyTable.pingedAt),
        gte(apiKeyTable.pingedAt, Date.now() - 1000 * 60),
        isNull(apiKeyTable.revokedAt),
      ),
    );

  return (
    <div className="border rounded p-4 bg-white">
      <div className="text-sm text-gray-600">Available Grading Workers</div>
      {availableKeys.length ? (
        <div className="gap-2">
          {availableKeys.map((key) => (
            <div className="" key={key.id}>{key.name || "Unnamed"}</div>
          ))}
        </div>
      ) : (
        <div>No available workers</div>
      )}
    </div>
  );
}
