"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowLeft, User, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format, addDays, startOfWeek } from "date-fns";
import toast from "react-hot-toast";

interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export default function BookAppointmentPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { data: session, status } = useSession();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerId, setSellerId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    // Resolve params
    params.then(({ sellerId: paramsSellerId }) => {
      setSellerId(paramsSellerId);
    });
  }, [params]);

  useEffect(() => {
    if (status === "authenticated" && sellerId) {
      fetchSeller();
    }
  }, [status, sellerId]);

  useEffect(() => {
    if (seller) {
      fetchAvailableSlots();
    }
  }, [seller, selectedDate]);

  const fetchSeller = async () => {
    try {
      const response = await fetch("/api/sellers");
      if (response.ok) {
        const sellers = await response.json();
        const foundSeller = sellers.find((s: Seller) => s._id === sellerId);
        setSeller(foundSeller || null);
      }
    } catch (error) {
      console.error("Error fetching seller:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!seller) return;

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await fetch(
        `/api/sellers/${seller._id}/availability?date=${dateStr}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
        if (!data.slots || data.slots.length === 0) {
          toast(
            "No available slots for this date. Try selecting another date.",
            {
              icon: "📅",
            }
          );
        }
      } else {
        toast.error("Failed to load available time slots.");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
      toast.error("Error loading availability. Please try again.");
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !title.trim()) return;

    setBooking(true);
    try {
      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: seller?._id,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (response.ok) {
        const appointment = await response.json();
        setBookingSuccess(true);
        toast.success(
          `Appointment booked successfully! ${
            appointment.meetingLink
              ? "Google Meet link has been sent to your calendar."
              : "Check your calendar for details."
          }`,
          { duration: 6000 }
        );
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Error booking appointment. Please try again."
        );
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setBooking(false);
    }
  };

  const generateWeekDates = () => {
    const start = startOfWeek(new Date());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  if (status === "loading" || loading) {
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

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Seller not found
          </h1>
          <Link
            href="/buyer/appointments"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to sellers list
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">
            Your appointment with {seller.name} has been scheduled successfully.
            You'll receive calendar invites shortly.
          </p>
          <div className="space-y-3">
            <Link
              href="/appointments"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View My Appointments
            </Link>
            <Link
              href="/buyer/appointments"
              className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Book Another Appointment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/buyer/appointments"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Sellers
            </Link>
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Book with {seller.name}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center">
            {seller.image ? (
              <img
                src={seller.image}
                alt={seller.name}
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-gray-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {seller.name}
              </h2>
              <p className="text-gray-600">{seller.email}</p>
              <div className="flex items-center mt-1 text-sm text-green-600">
                <Clock className="h-4 w-4 mr-1" />
                Calendar Connected
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Date
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {generateWeekDates().map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`p-2 rounded-lg text-center ${
                    format(date, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd")
                      ? "bg-blue-600 text-white"
                      : date < new Date()
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  disabled={date < new Date()}
                >
                  <div className="text-xs">{format(date, "EEE")}</div>
                  <div className="text-sm font-semibold">
                    {format(date, "d")}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Times
            </h3>
            {availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No available slots for this date
                </p>
                <p className="text-sm text-gray-400">
                  Try selecting a different date
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded-lg text-sm ${
                      selectedSlot === slot
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {format(new Date(slot.start), "h:mm a")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        {selectedSlot && (
          <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Appointment Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Project Discussion, Consultation"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details about the meeting..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Booking Summary
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>With:</strong> {seller.name}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {format(new Date(selectedSlot.start), "h:mm a")} -{" "}
                    {format(new Date(selectedSlot.end), "h:mm a")}
                  </p>
                  <p>
                    <strong>Duration:</strong> 1 hour
                  </p>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!title.trim() || booking}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
