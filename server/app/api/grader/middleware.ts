import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyApiKey } from "@/app/lib/apikey";

export async function middleware(req: NextRequest) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rawKey = header.slice("Bearer ".length);
  const result = await verifyApiKey(rawKey);
  if (!result) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!result.isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // No headers, no mutation, just allow the request through
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/grader/:path*"],
};
