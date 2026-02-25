import { NextRequest, NextResponse } from "next/server";
import dashboard from "@/data/mock/dashboard.json";

export function GET(req: NextRequest) {
  const role = (req.nextUrl.searchParams.get("role") ?? "requester") as keyof typeof dashboard;
  const item = dashboard[role] ?? dashboard.requester;
  return NextResponse.json({ role, ...item });
}
