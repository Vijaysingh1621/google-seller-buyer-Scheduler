"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Calendar,
  Settings,
  LogOut,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Appointment {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  buyerId: {
    name: string;
    email: string;
  };
  status: string;
}

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAppointments();
    }
  }, [status]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/seller");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        if (data.length === 0) {
          toast('No appointments yet. Share your availability to start receiving bookings!', {
            icon: '📅',
            duration: 5000,
          });
        }
      } else {
        toast.error('Failed to load appointments.');
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error('Error loading appointments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    window.location.href = "/auth/signin";
    return null;
  }

  if (session?.user.role !== "seller") {
    if (session?.user.role === "buyer") {
      window.location.href = "/buyer/dashboard";
    } else {
      window.location.href = "/auth/role-selection";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Seller Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Appointments
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {appointments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {
                    appointments.filter((apt) => apt.status === "scheduled")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Calendar Status
                </p>
                <p className="text-sm font-semibold text-green-600">
                  {session.user.calendarConnected
                    ? "Connected"
                    : "Disconnected"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/seller/availability"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Set Availability
            </Link>
            <Link
              href="/appointments"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View All Appointments
            </Link>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Appointments
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments yet</p>
                <p className="text-sm text-gray-400">
                  Appointments will appear here once buyers book with you
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.buyerId.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.startTime).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {appointments.length > 5 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/appointments"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {appointments.length} appointments →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
