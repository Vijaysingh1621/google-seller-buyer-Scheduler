"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Calendar, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAvailability();
    }
  }, [status]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch("/api/availability");
      if (response.ok) {
        const data = await response.json();

        // Initialize with default availability if none exists
        const defaultAvailability = DAYS.map((day) => ({
          dayOfWeek: day.value,
          startTime: "09:00",
          endTime: "17:00",
          isActive: day.value >= 1 && day.value <= 5, // Monday to Friday by default
        }));

        // Merge with existing data
        const mergedAvailability = defaultAvailability.map((defaultSlot) => {
          const existingSlot = data.find(
            (slot: AvailabilitySlot) => slot.dayOfWeek === defaultSlot.dayOfWeek
          );
          return existingSlot || defaultSlot;
        });

        setAvailability(mergedAvailability);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = (
    dayOfWeek: number,
    field: keyof AvailabilitySlot,
    value: any
  ) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability }),
      });

      if (response.ok) {
        toast.success(
          "Availability saved successfully! Buyers can now book appointments with you.",
          {
            duration: 5000,
          }
        );
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Error saving availability. Please try again."
        );
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
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
          <div className="flex items-center py-4">
            <Link
              href="/seller/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </Link>
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Set Availability
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Weekly Availability
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Set your available hours for each day of the week
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {DAYS.map((day) => {
                const slot = availability.find(
                  (a) => a.dayOfWeek === day.value
                );
                return (
                  <div key={day.value} className="flex items-center space-x-4">
                    <div className="w-24">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={slot?.isActive || false}
                          onChange={(e) =>
                            updateAvailability(
                              day.value,
                              "isActive",
                              e.target.checked
                            )
                          }
                          className="mr-2"
                        />
                        <span className="font-medium text-gray-700">
                          {day.label}
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={slot?.startTime || "09:00"}
                        onChange={(e) =>
                          updateAvailability(
                            day.value,
                            "startTime",
                            e.target.value
                          )
                        }
                        disabled={!slot?.isActive}
                        className="border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot?.endTime || "17:00"}
                        onChange={(e) =>
                          updateAvailability(
                            day.value,
                            "endTime",
                            e.target.value
                          )
                        }
                        disabled={!slot?.isActive}
                        className="border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={saveAvailability}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How it works
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Set your general availability for each day of the week</li>
            <li>
              • Buyers will see available time slots based on your settings and
              calendar
            </li>
            <li>
              • Your Google Calendar events will automatically block
              availability
            </li>
            <li>
              • Appointments will be created on both your and the buyer's
              calendars
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
