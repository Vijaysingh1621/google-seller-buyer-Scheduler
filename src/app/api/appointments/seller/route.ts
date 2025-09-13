import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'seller') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const appointments = await Appointment.find({
      sellerId: session.user.id,
    })
    .populate('buyerId', 'name email')
    .sort({ startTime: -1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching seller appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}