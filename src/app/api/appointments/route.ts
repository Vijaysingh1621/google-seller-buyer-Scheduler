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

    await connectToDatabase();
    
    // Get appointments where user is either buyer or seller
    const query = session.user.role === 'seller' 
      ? { sellerId: session.user.id }
      : { buyerId: session.user.id };
    
    const appointments = await Appointment.find(query)
      .populate('buyerId', 'name email image')
      .populate('sellerId', 'name email image')
      .sort({ startTime: -1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}