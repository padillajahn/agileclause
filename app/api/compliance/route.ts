import { NextResponse } from "next/server";

export async function GET() {
  // Return compliance metrics (in production, fetch from database)
  return NextResponse.json({
    metrics: {
      riskyClausesFlagged: 23,
      contractsReviewed: 156,
      policyCompliance: 94,
    },
  });
}
