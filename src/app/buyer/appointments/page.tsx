"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, LogOut, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "cancelled" | "completed";
  seller: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  meetingLink?: string;
}

export default function BuyerAppointments() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    if (status === "authenticated") {
      fetchAppointments();
    }
  }, [status]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/buyer");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Please sign in to view your appointments.
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (session?.user.role !== "buyer") {
    if (session?.user.role === "seller") {
      window.location.href = "/seller/dashboard";
    } else {
      window.location.href = "/auth/role-selection";
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <p className="text-gray-600 mb-4">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/buyer/dashboard" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                My Appointments
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/buyer/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book New
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "All Appointments" },
                { key: "scheduled", label: "Upcoming" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-900">
                    {tab.key === "all"
                      ? appointments.length
                      : appointments.filter((apt) => apt.status === tab.key)
                          .length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.startTime);
                const endTime = formatDateTime(appointment.endTime).time;

                return (
                  <div key={appointment._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {appointment.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-2">
                          <User className="h-4 w-4 mr-2" />
                          <span>with {appointment.seller.name}</span>
                          <span className="mx-2">•</span>
                          <span>{appointment.seller.email}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{date}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {time} - {endTime}
                          </span>
                        </div>

                        {appointment.description && (
                          <p className="text-gray-600 mt-2">
                            {appointment.description}
                          </p>
                        )}

                        {appointment.meetingLink &&
                          appointment.status === "scheduled" && (
                            <div className="mt-3">
                              <a
                                href={appointment.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}
                      </div>

                      <div className="ml-6 flex items-center">
                        {appointment.seller.image ? (
                          <img
                            src={appointment.seller.image}
                            alt={appointment.seller.name}
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all"
                  ? "No appointments yet"
                  : `No ${filter} appointments`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === "all"
                  ? "Start by booking your first appointment with a seller."
                  : `You don't have any ${filter} appointments.`}
              </p>
              <Link
                href="/buyer/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
