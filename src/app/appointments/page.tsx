"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Calendar, Clock, User, LogOut, Video, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";
import { format, isPast, isFuture, isToday } from "date-fns";

interface AppointmentUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  meetingLink?: string;
  buyerId: AppointmentUser;
  sellerId: AppointmentUser;
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (status === "authenticated") {
      fetchAppointments();
    }
  }, [status]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
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

  const getFilteredAppointments = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => isFuture(new Date(apt.startTime)) || isToday(new Date(apt.startTime)));
      case 'past':
        return appointments.filter(apt => isPast(new Date(apt.endTime)));
      default:
        return appointments;
    }
  };

  const getOtherParticipant = (appointment: Appointment) => {
    return session?.user.role === 'seller' ? appointment.buyerId : appointment.sellerId;
  };

  const getAppointmentStatus = (appointment: Appointment) => {
    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);

    if (appointment.status === 'cancelled') return 'cancelled';
    if (isPast(endTime)) return 'completed';
    if (isToday(startTime)) return 'today';
    if (isFuture(startTime)) return 'upcoming';
    return 'scheduled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'today':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user.role === 'buyer' ? (
                <Link
                  href="/buyer/appointments"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Book New Appointment
                </Link>
              ) : (
                <Link
                  href="/seller/dashboard"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Dashboard
                </Link>
              )}
              <span className="text-sm text-gray-600">Welcome, {session?.user.name}</span>
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
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="ml-auto text-sm text-gray-500">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-6">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming appointments"
                  : filter === 'past'
                  ? "You don't have any past appointments"
                  : "You haven't scheduled any appointments yet"
                }
              </p>
              {session?.user.role === 'buyer' && (
                <Link
                  href="/buyer/appointments"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const otherParticipant = getOtherParticipant(appointment);
                const status = getAppointmentStatus(appointment);
                const startTime = new Date(appointment.startTime);
                const endTime = new Date(appointment.endTime);

                return (
                  <div key={appointment._id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {otherParticipant.image ? (
                          <img
                            src={otherParticipant.image}
                            alt={otherParticipant.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status === 'today' ? 'Today' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-2">
                            {session?.user.role === 'seller' ? 'with' : 'with'} {otherParticipant.name}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(startTime, 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                            </div>
                          </div>
                          
                          {appointment.description && (
                            <p className="text-gray-600 mt-2 text-sm">
                              {appointment.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {appointment.meetingLink && (
                          <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Join
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}