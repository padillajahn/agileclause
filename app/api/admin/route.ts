import { NextResponse } from "next/server";

export async function GET() {
  // Return admin stats (in production, fetch from database)
  return NextResponse.json({
    stats: {
      monthlyActiveUsers: 12,
      documentsAnalyzed: 156,
      documentsUploaded: 203,
      avgResponseSec: 1.2,
    },
  });
}
