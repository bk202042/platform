import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth/server";

export async function GET() {
  try {
    const authResult = await getServerAuth();

    if (authResult.error) {
      return NextResponse.json(
        {
          authenticated: false,
          error: authResult.error.message,
          recoverable: authResult.error.recoverable,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: !!authResult.user,
      user: authResult.user
        ? {
            id: authResult.user.id,
            email: authResult.user.email,
            name:
              authResult.user.user_metadata?.full_name ||
              authResult.user.user_metadata?.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "Authentication check failed",
        recoverable: true,
      },
      { status: 500 },
    );
  }
}
