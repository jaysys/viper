import { NextResponse } from "next/server";
import { getAdminConfig } from "@/lib/mock";

export function GET() {
  return NextResponse.json(getAdminConfig());
}
