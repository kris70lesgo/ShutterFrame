import { NextResponse } from "next/server";
import { checkTrueForgeHealth } from "@/lib/trueforge/health";

export async function GET() {
  const trueforge = await checkTrueForgeHealth();
  return NextResponse.json({ application: "ok", trueforge });
}
