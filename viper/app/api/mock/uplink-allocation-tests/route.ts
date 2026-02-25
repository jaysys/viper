import { NextResponse } from "next/server";
import { getUplinkAllocationTests } from "@/lib/mock";

export function GET() {
  return NextResponse.json({ items: getUplinkAllocationTests() });
}
