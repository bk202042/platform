import { NextResponse } from "next/server";
import { getCities } from "@/lib/data/community";

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json(cities);
  } catch (error) {
    console.error("API: Failed to fetch cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}