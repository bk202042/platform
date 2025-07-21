import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/server";

export async function GET() {
  try {
    const user = await getSessionUser();

    return NextResponse.json({
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication check failed",
      },
      { status: 500 },
    );
  }
}
