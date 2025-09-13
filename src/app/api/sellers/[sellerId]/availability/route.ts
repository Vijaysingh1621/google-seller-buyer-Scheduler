import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Availability from "@/models/Availability";
import { getFreeBusy, generateTimeSlots } from "@/lib/calendar";

export async function GET(
  request: NextRequest,
  { params }: { params: { sellerId: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Get seller info
    const seller = await User.findById(params.sellerId);
    if (!seller || seller.role !== 'seller') {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Get seller's availability for the requested day
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();
    
    const availability = await Availability.findOne({
      sellerId: params.sellerId,
      dayOfWeek: dayOfWeek,
      isActive: true,
    });

    if (!availability) {
      return NextResponse.json({ slots: [] });
    }

    // Get seller's busy times from Google Calendar
    const startOfDay = new Date(requestDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestDate);
    endOfDay.setHours(23, 59, 59, 999);

    let busyTimes: { start: Date; end: Date }[] = [];
    try {
      if (seller.calendarConnected) {
        const freeBusyResult = await getFreeBusy(seller._id.toString(), startOfDay, endOfDay);
        busyTimes = freeBusyResult
          .filter(period => period.start && period.end)
          .map(period => ({
            start: new Date(period.start!),
            end: new Date(period.end!)
          }));
      }
    } catch (error) {
      console.error("Error fetching busy times:", error);
      // Continue without busy times if calendar fetch fails
    }

    // Generate available time slots
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      requestDate,
      busyTimes,
      60 // 60-minute slots
    );

    // Filter out past time slots for today
    const now = new Date();
    const filteredSlots = slots.filter(slot => slot.start > now);

    return NextResponse.json({ 
      slots: filteredSlots.map(slot => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      }))
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}