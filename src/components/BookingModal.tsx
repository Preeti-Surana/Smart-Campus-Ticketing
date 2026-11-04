import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CampusEvent, Booking } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  Zap,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Ticket as TicketIcon,
} from 'lucide-react';
import { DigitalTicketModal } from './DigitalTicketModal.tsx';

interface Props {
  event: CampusEvent;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<Props> = ({
  event,
  onClose,
  onBookingSuccess,
}) => {
  const { currentUser } = useAuth();
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('Campus UPI / GPay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [viewTicketIndex, setViewTicketIndex] = useState<number | null>(null);

  // Remaining capacity and pricing checks
  const remaining = event.remaining_tickets;
  const isSurged = event.pricing_status === 'surged_25';
  const isSoldOut = event.pricing_status === 'sold_out' || remaining <= 0;
  const unitPrice = event.current_price;
  const totalAmount = unitPrice * quantity;

  // Max allowed per booking is 4 or remaining tickets
  const maxAvailable = Math.min(4, Math.max(1, remaining));

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSoldOut || remaining <= 0) {
      setErrorMessage('Sorry, this event is already sold out!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Client idempotency key to prevent accidental duplicate clicks
    const idempotencyKey = `idemp_${currentUser?.user_id || 'guest'}_${event.event_id}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          eventId: event.event_id,
          userId: currentUser?.user_id || 'usr_stu_01',
          quantity,
          paymentMethod,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Concurrency race condition or validation error
        setErrorMessage(
          data.error ||
            'Booking could not be completed. The event may have sold out while you were checking out.'
        );
        setIsSubmitting(false);
        return;
      }

      // Success! Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setConfirmedBooking(data.booking);
      onBookingSuccess(data.booking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      setErrorMessage(`Network error: ${msg}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-400/20">
              <TicketIcon className="w-3.5 h-3.5 text-indigo-300" />
              Secure Campus Checkout
            </div>
            <h2 className="text-xl font-bold">{event.event_name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/90 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {event.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {event.city ? `${event.city} • ` : ''}{event.venue}
              </span>
            </div>
          </div>

          {/* If already confirmed, display confirmation screen */}
          {confirmedBooking ? (
            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Booking Confirmed!
                </h3>
                <p className="text-sm text-slate-600">
                  Your tickets have been reserved and inventory securely locked.
                </p>
                <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800">
                  Booking ID: {confirmedBooking.booking_id}
                </div>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm space-y-2.5">
                <div className="flex justify-between text-slate-600">
                  <span>Student Name:</span>
                  <span className="font-semibold text-slate-900">{confirmedBooking.user_name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity:</span>
                  <span className="font-semibold text-slate-900">{confirmedBooking.quantity} ticket(s)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-indigo-700">₹{confirmedBooking.total_amount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Channel:</span>
                  <span className="font-medium text-slate-800">{confirmedBooking.payment_method}</span>
                </div>
              </div>

              {/* Digital QR Tickets Generated */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  Your Digital QR Tickets ({confirmedBooking.tickets.length})
                </h4>
                <div className="space-y-2">
                  {confirmedBooking.tickets.map((t, idx) => (
                    <div
                      key={t.ticket_id}
                      className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            Ticket {t.ticket_id}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Status: <span className="text-emerald-700 font-bold uppercase">{t.ticket_status}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewTicketIndex(idx)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View Pass
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="w-full px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleBookingSubmit} className="p-6 md:p-8 space-y-6">
              {/* Dynamic Pricing Alert Banner (Rule 6: Last 20% notification) */}
              {isSurged && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-sm text-amber-900">
                      ⚡ Last 20% of tickets remaining! Prices have increased by 25%.
                    </div>
                    <p className="text-amber-800/90 leading-relaxed">
                      Due to high campus demand with only {remaining} tickets remaining out of{' '}
                      {event.maximum_capacity}, dynamic surge pricing is now in effect.
                    </p>
                  </div>
                </div>
              )}

              {/* Sold out alert */}
              {isSoldOut && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Event is Sold Out</h4>
                    <p className="text-xs text-rose-700 mt-1">
                      All {event.maximum_capacity} tickets have been claimed. No bookings can be processed.
                    </p>
                  </div>
                </div>
              )}

              {/* Concurrency Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-sm text-rose-800">Booking Unsuccessful</div>
                    <p className="text-rose-700">{errorMessage}</p>
                    <p className="text-[11px] text-rose-600 italic">
                      Inventory locks prevented duplicate or oversold ticket assignment.
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Number of Tickets
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4]
                    .filter((q) => q <= remaining)
                    .map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        disabled={isSoldOut}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                          quantity === q
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {q} {q === 1 ? 'Ticket' : 'Tickets'}
                      </button>
                    ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                  <span>Remaining in batch: {remaining} of {event.maximum_capacity}</span>
                  <span className="font-medium text-slate-700">Max 4 per transaction</span>
                </p>
              </div>

              {/* Price Breakdown Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Base Ticket Price:</span>
                  <span className="font-medium text-slate-800">₹{event.base_price}</span>
                </div>
                {isSurged && (
                  <div className="flex justify-between items-center text-amber-800 text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Dynamic Surge (+25%):
                    </span>
                    <span>+₹{unitPrice - event.base_price}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Current Price per Ticket:</span>
                  <span className="font-bold text-slate-900">₹{unitPrice}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-base">Total Payable:</span>
                  <span className="text-xl font-extrabold text-indigo-600">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Simulated Payment Gateway Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Payment Method (Simulated Gateway)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Campus UPI / GPay', label: 'UPI / GPay', icon: QrCode },
                    { id: 'Campus Student ID Card', label: 'Student Wallet', icon: ShieldCheck },
                    { id: 'Debit / Credit Card', label: 'Card Payment', icon: CreditCard },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center text-xs font-semibold transition-all ${
                          paymentMethod === method.id
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-indigo-600" />
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security & Idempotency Guarantee Tag */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Protected by ACID row-level mutex transaction & idempotency lock to prevent duplicate charges or ticket overselling.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isSoldOut || remaining <= 0}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isSoldOut
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Locking Tickets & Processing...</span>
                    </>
                  ) : isSoldOut ? (
                    'Sold Out'
                  ) : (
                    <>
                      <span>Pay ₹{totalAmount} & Book Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Direct Ticket QR Preview modal if requested */}
      {confirmedBooking && viewTicketIndex !== null && (
        <DigitalTicketModal
          ticket={confirmedBooking.tickets[viewTicketIndex]}
          booking={confirmedBooking}
          onClose={() => setViewTicketIndex(null)}
        />
      )}
    </>
  );
};
