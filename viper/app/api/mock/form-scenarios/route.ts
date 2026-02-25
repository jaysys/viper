import { NextResponse } from "next/server";
import { getFormScenarios } from "@/lib/mock";

export function GET() {
  return NextResponse.json({ items: getFormScenarios() });
}
