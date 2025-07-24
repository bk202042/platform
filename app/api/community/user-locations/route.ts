import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserPreferredLocations,
  addUserLocationPreference,
  setUserPrimaryLocation,
  removeUserLocationPreference,
} from "@/lib/data/vietnamese-locations";

// GET /api/community/user-locations - Get user's preferred locations
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const locations = await getUserPreferredLocations(user.id);
    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching user locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch user locations" },
      { status: 500 }
    );
  }
}

// POST /api/community/user-locations - Add user location preference
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cityId, apartmentId, makePrimary = false } = body;

    if (!cityId) {
      return NextResponse.json(
        { error: "City ID is required" },
        { status: 400 }
      );
    }

    const locationId = await addUserLocationPreference(
      user.id,
      cityId,
      apartmentId,
      makePrimary
    );

    return NextResponse.json({
      success: true,
      locationId,
      message: "Location preference added successfully",
    });
  } catch (error) {
    console.error("Error adding user location preference:", error);
    return NextResponse.json(
      { error: "Failed to add location preference" },
      { status: 500 }
    );
  }
}

// PUT /api/community/user-locations - Set primary location
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cityId, apartmentId } = body;

    if (!cityId) {
      return NextResponse.json(
        { error: "City ID is required" },
        { status: 400 }
      );
    }

    const locationId = await setUserPrimaryLocation(
      user.id,
      cityId,
      apartmentId
    );

    return NextResponse.json({
      success: true,
      locationId,
      message: "Primary location updated successfully",
    });
  } catch (error) {
    console.error("Error setting primary location:", error);
    return NextResponse.json(
      { error: "Failed to set primary location" },
      { status: 500 }
    );
  }
}

// DELETE /api/community/user-locations - Remove location preference
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    await removeUserLocationPreference(user.id, locationId);

    return NextResponse.json({
      success: true,
      message: "Location preference removed successfully",
    });
  } catch (error) {
    console.error("Error removing user location preference:", error);
    return NextResponse.json(
      { error: "Failed to remove location preference" },
      { status: 500 }
    );
  }
}
