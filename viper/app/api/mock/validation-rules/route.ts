import { NextResponse } from "next/server";
import { getValidationRules } from "@/lib/mock";

export function GET() {
  return NextResponse.json(getValidationRules());
}
