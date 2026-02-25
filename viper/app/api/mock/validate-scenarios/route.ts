import { NextResponse } from "next/server";
import { validateMockScenarios } from "@/lib/scenario-validator";

export function GET() {
  const result = validateMockScenarios();
  return NextResponse.json(result, { status: result.pass ? 200 : 400 });
}
