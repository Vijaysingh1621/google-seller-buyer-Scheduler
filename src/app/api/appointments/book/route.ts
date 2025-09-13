import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import { createCalendarEvent } from "@/lib/calendar";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sellerId, startTime, endTime, title, description } = await request.json();

    if (!sellerId || !startTime || !endTime || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Get seller info
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Get buyer info
    const buyer = await User.findById(session.user.id);
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Create appointment in database
    const appointment = await Appointment.create({
      buyerId: session.user.id,
      sellerId: sellerId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'scheduled',
    });

    // Create calendar events for both participants
    const eventData = {
      summary: title,
      description: description || `Meeting between ${buyer.name} and ${seller.name}`,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: buyer.email },
        { email: seller.email },
      ],
    };

    try {
      // Create event on seller's calendar
      const sellerEvent = await createCalendarEvent(sellerId, eventData);
      
      // Create event on buyer's calendar
      const buyerEvent = await createCalendarEvent(session.user.id, eventData);
      
      // Update appointment with Google event ID and meeting link
      appointment.googleEventId = sellerEvent.id;
      appointment.meetingLink = sellerEvent.hangoutLink;
      await appointment.save();

    } catch (calendarError) {
      console.error("Error creating calendar events:", calendarError);
      // Don't fail the whole booking if calendar creation fails
    }

    // Populate the appointment with user details for response
    await appointment.populate([
      { path: 'buyerId', select: 'name email' },
      { path: 'sellerId', select: 'name email' },
    ]);

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}