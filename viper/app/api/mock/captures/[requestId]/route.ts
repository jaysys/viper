import { NextRequest, NextResponse } from "next/server";
import { getCaptures } from "@/lib/mock";

export async function GET(_: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return NextResponse.json({ items: getCaptures(requestId) });
}
