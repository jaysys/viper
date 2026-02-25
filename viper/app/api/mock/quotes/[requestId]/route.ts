import { NextRequest, NextResponse } from "next/server";
import { getApprovalHistory, getQuoteByRequestId } from "@/lib/mock";

export async function GET(_: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const quote = getQuoteByRequestId(requestId);
  if (!quote) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ quote, history: getApprovalHistory(requestId) });
}
