import { NextResponse } from "next/server";
import { getSatellites } from "@/lib/mock";

export function GET() {
  return NextResponse.json({ items: getSatellites() });
}
