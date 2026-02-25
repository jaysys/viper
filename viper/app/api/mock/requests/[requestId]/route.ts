import { NextRequest, NextResponse } from "next/server";
import { getRequestById } from "@/lib/mock";

export async function GET(_: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const item = getRequestById(requestId);
  if (!item) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(item);
}
