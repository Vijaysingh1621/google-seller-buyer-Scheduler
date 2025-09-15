"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  LogOut,
  Search,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Seller {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface Appointment {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  seller: {
    name: string;
    email: string;
  };
  status: string;
}

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchSellers();
      fetchRecentAppointments();
    }
  }, [status]);

  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/sellers");
      if (response.ok) {
        const data = await response.json();
        setSellers(data);
        if (data.length === 0) {
          toast("No sellers available yet. Check back later!", {
            icon: "👥",
          });
        }
      } else {
        toast.error("Failed to load available sellers.");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Error loading sellers. Please refresh the page.");
    }
  };

  const fetchRecentAppointments = async () => {
    try {
      const response = await fetch("/api/appointments/buyer");
      if (response.ok) {
        const data = await response.json();
        setRecentAppointments(data.slice(0, 3)); // Show only 3 recent appointments
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Please sign in to access the buyer dashboard.
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
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Buyer Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Link
                href="/buyer/appointments"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                My Appointments
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentAppointments.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Sellers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {sellers.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    recentAppointments.filter(
                      (apt) => apt.status === "scheduled"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Appointments
                </h2>
                <Link
                  href="/buyer/appointments"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          with {appointment.seller.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(appointment.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments yet.</p>
                  <p className="text-sm text-gray-500">
                    Book your first appointment with a seller below.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Available Sellers */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Book an Appointment
              </h2>
              <div className="mt-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : filteredSellers.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredSellers.map((seller) => (
                    <div
                      key={seller._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        {seller.image ? (
                          <img
                            src={seller.image}
                            alt={seller.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {seller.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {seller.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/buyer/book/${seller._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                      >
                        Book
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sellers found.</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-500">
                      Try adjusting your search terms.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
