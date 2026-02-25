import { NextRequest, NextResponse } from "next/server";
import { getApprovalHistory } from "@/lib/mock";

export async function GET(_: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return NextResponse.json({ items: getApprovalHistory(requestId) });
}
