import { NextResponse } from "next/server";
import { getReceptionJobs } from "@/lib/mock";

export function GET() {
  return NextResponse.json({ items: getReceptionJobs() });
}
