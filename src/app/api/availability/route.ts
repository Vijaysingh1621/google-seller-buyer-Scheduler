import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Availability from "@/models/Availability";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const availability = await Availability.find({
      sellerId: session.user.id,
    }).sort({ dayOfWeek: 1 });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'seller') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { availability } = await request.json();

    if (!Array.isArray(availability)) {
      return NextResponse.json({ error: "Invalid availability data" }, { status: 400 });
    }

    await connectToDatabase();

    // Delete existing availability for this seller
    await Availability.deleteMany({ sellerId: session.user.id });

    // Create new availability records
    const newAvailability = availability
      .filter(slot => slot.isActive)
      .map(slot => ({
        sellerId: session.user.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
      }));

    if (newAvailability.length > 0) {
      await Availability.insertMany(newAvailability);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}