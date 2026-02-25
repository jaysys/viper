import { NextResponse } from "next/server";
import { getUplinkJobs } from "@/lib/mock";

export function GET() {
  return NextResponse.json({ items: getUplinkJobs() });
}
