import { NextRequest, NextResponse } from "next/server";
import { getTemplates } from "@/lib/mock";

export function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "ALL";
  return NextResponse.json({ items: getTemplates(scope) });
}
