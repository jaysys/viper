import { NextRequest, NextResponse } from "next/server";
import { getQuotesByApprovalStatus } from "@/lib/mock";

export function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? "ALL";
  return NextResponse.json({ items: getQuotesByApprovalStatus(status) });
}
