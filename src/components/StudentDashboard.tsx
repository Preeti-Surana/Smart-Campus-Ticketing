import React, { useState, useEffect } from 'react';
import { Booking, Ticket } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  QrCode,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { DigitalTicketModal } from './DigitalTicketModal.tsx';

interface Props {
  onDiscoverEvents: () => void;
  onRefreshData: () => void;
}

export const StudentDashboard: React.FC<Props> = ({
  onDiscoverEvents,
  onRefreshData,
}) => {
  const { currentUser, setIsLoginModalOpen } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<{
    ticket: Ticket;
    booking: Booking;
  } | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchStudentBookings = async () => {
    if (!currentUser) {
      setBookings([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${currentUser.user_id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to load student bookings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentBookings();
  }, [currentUser?.user_id]);

  if (!currentUser) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <TicketIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to View Passes</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sign in with your campus student account to see your confirmed bookings, digital QR entry passes, and receipts.
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (
      !confirm(
        'Are you sure you want to cancel this booking? Your tickets will be returned to the campus inventory.'
      )
    ) {
      return;
    }

    setCancellingBookingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage('Booking successfully cancelled and inventory restored!');
        fetchStudentBookings();
        onRefreshData();
      } else {
        alert(data.error || 'Failed to cancel booking.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancel error';
      alert(msg);
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Separate active confirmed passes from cancelled/past bookings
  const confirmedBookings = bookings.filter((b) => b.booking_status === 'confirmed');
  const pastOrCancelled = bookings.filter((b) => b.booking_status === 'cancelled');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Student Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Student Identity: {currentUser.college_id || 'STU-PORTAL'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome, {currentUser.name}!
          </h1>
          <p className="text-xs text-indigo-200/80 max-w-xl">
            Access your secure QR event passes, check live entry status, and review booking receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDiscoverEvents}
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <span>Browse More Events</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Active Passes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Active Digital Passes</h2>
            <p className="text-xs text-slate-500">
              Present these verified QR codes at the campus entrance
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            {confirmedBookings.reduce((acc, b) => acc + b.tickets.length, 0)} Active Passes
          </span>
        </div>

        {confirmedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedBookings.map((b) => (
              <div
                key={b.booking_id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900">{b.event_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{b.event_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="truncate">{b.event_venue}</span>
                    </div>
                  </div>

                  {/* Individual QR Tickets for this booking */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Passes in this Booking ({b.tickets.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {b.tickets.map((t) => (
                        <button
                          key={t.ticket_id}
                          onClick={() => setSelectedTicket({ ticket: t, booking: b })}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-indigo-600" />
                            <div>
                              <span className="font-mono text-xs font-bold text-slate-900 block">
                                #{t.ticket_number}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {t.ticket_id}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              t.ticket_status === 'used'
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {t.ticket_status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer with total & cancellation */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
                    <span className="text-base font-extrabold text-slate-900">₹{b.total_amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancelBooking(b.booking_id)}
                      disabled={cancellingBookingId === b.booking_id}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {cancellingBookingId === b.booking_id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <TicketIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No active event passes found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reserved tickets for upcoming campus events yet. Explore events to grab early-bird passes before dynamic surge pricing begins!
            </p>
            <button
              onClick={onDiscoverEvents}
              className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Discover Events
            </button>
          </div>
        )}
      </div>

      {/* Booking History Table */}
      {pastOrCancelled.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-lg font-bold text-slate-900">Cancelled / Refunded Bookings</h2>
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                  <th className="p-4">Event</th>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastOrCancelled.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{b.event_name}</td>
                    <td className="p-4 font-mono text-slate-500">{b.booking_id}</td>
                    <td className="p-4 text-slate-600">{b.quantity} ticket(s)</td>
                    <td className="p-4 font-bold text-slate-700">₹{b.total_amount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-rose-100 text-rose-700">
                        {b.booking_status} (Refunded)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Ticket Modal */}
      {selectedTicket && (
        <DigitalTicketModal
          ticket={selectedTicket.ticket}
          booking={selectedTicket.booking}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};
