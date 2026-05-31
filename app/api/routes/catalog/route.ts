import { NextResponse } from "next/server";
import { getCatalogRouteCandidates } from "@/features/routes/services/route-candidate-service";

export async function GET() {
  const routes = await getCatalogRouteCandidates();
  return NextResponse.json({ routes });
}
