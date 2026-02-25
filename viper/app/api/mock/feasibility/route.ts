import { NextResponse } from "next/server";
import { getAllFeasibility } from "@/lib/mock";

export function GET() {
  return NextResponse.json({ items: getAllFeasibility() });
}
