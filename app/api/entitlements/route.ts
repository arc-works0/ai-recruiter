import { NextResponse } from "next/server";
import { getIsPremiumForCurrentUser } from "../../../lib/entitlements";

export const runtime = "nodejs";

export async function GET() {
  try {
    const isPremium = await getIsPremiumForCurrentUser();
    return NextResponse.json({ is_premium: isPremium });
  } catch (error) {
    console.error("Failed to fetch entitlements:", error);
    return NextResponse.json({ is_premium: false }, { status: 200 });
  }
}
