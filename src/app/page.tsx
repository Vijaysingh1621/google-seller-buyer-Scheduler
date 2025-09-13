"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, Clock, Users } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    // Redirect based on user role
    if (session.user.role === "seller") {
      window.location.href = "/seller/dashboard";
    } else if (session.user.role === "buyer") {
      window.location.href = "/buyer/dashboard";
    } else {
      // User doesn't have a role set, redirect to role selection
      window.location.href = "/auth/role-selection";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Schedule with <span className="text-blue-600">Ease</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect buyers and sellers through seamless appointment scheduling
            integrated with Google Calendar
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/signin?role=seller"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              I'm a Seller
            </Link>
            <Link
              href="/auth/signin?role=buyer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              I'm a Buyer
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Google Calendar Integration
            </h3>
            <p className="text-gray-600">
              Seamlessly sync appointments with your Google Calendar. No double
              booking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Real-time Availability
            </h3>
            <p className="text-gray-600">
              See available time slots in real-time based on calendar
              availability.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Two-way Booking</h3>
            <p className="text-gray-600">
              Appointments are created on both participant's calendars
              automatically.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-blue-600">
              For Sellers
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Connect your Google Calendar
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Set your availability preferences
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Receive booking requests automatically
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Manage appointments from your dashboard
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-green-600">
              For Buyers
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Browse available sellers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                View real-time availability
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Book appointments instantly
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                Get calendar invites automatically
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
