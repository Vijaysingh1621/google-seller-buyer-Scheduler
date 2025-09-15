import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "buyer") {
      return NextResponse.json({ error: "Access denied - buyers only" }, { status: 403 });
    }

    await connectToDatabase();

    // Get appointments for the current buyer
    const appointments = await Appointment.find({ buyerId: session.user.id })
      .populate('sellerId', 'name email image')
      .sort({ startTime: -1 });

    // Transform the data to match the frontend interface
    const transformedAppointments = appointments.map(apt => ({
      _id: apt._id,
      title: apt.title,
      description: apt.description,
      startTime: apt.startTime,
      endTime: apt.endTime,
      status: apt.status,
      seller: {
        _id: apt.sellerId._id,
        name: apt.sellerId.name,
        email: apt.sellerId.email,
        image: apt.sellerId.image,
      },
      meetingLink: apt.meetingLink,
    }));

    return NextResponse.json(transformedAppointments);
  } catch (error) {
    console.error("Error fetching buyer appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}