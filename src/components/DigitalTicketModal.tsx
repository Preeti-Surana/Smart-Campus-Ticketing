import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Ticket, Booking } from '../types.ts';
import {
  X,
  Download,
  Printer,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface Props {
  ticket: Ticket;
  booking?: Booking;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<Props> = ({
  ticket,
  booking,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    QRCode.toDataURL(ticket.unique_qr_code, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1E1B4B', // Deep navy
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [ticket.unique_qr_code]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `ticket-${ticket.ticket_id}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = ticket.ticket_status === 'cancelled';
  const isUsed = ticket.ticket_status === 'used';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Official Campus Digital Pass
          </div>
          <h2 className="text-xl font-bold text-white">
            {booking?.event_name || 'Campus Event Pass'}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Booking Reference: <span className="font-mono text-white">{ticket.booking_id}</span>
          </p>
        </div>

        {/* Printable Ticket Body */}
        <div ref={printRef} className="p-6 space-y-6">
          {/* Status Alert Banner */}
          {isCancelled && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>This ticket is <strong>CANCELLED</strong> and refunded. Entry will be denied.</span>
            </div>
          )}

          {isUsed && (
            <div className="bg-slate-100 border border-slate-300 text-slate-800 p-3 rounded-xl flex items-center gap-2 text-sm">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>This ticket was <strong>ALREADY SCANNED</strong> at gate entry.</span>
            </div>
          )}

          {!isCancelled && !isUsed && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Active Verified Pass • Present this QR code at the campus entry gate</span>
            </div>
          )}

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-48 h-48 rounded-xl shadow-md bg-white p-2"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-200 animate-pulse rounded-xl">
                <span className="text-xs text-slate-500">Generating secure QR...</span>
              </div>
            )}
            <div className="mt-3 text-center">
              <span className="font-mono text-xs font-bold text-slate-700 tracking-wider">
                PASS ID: {ticket.ticket_id}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cryptographically signed for one-time scan validation
              </p>
            </div>
          </div>

          {/* Ticket Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Attendee Name</span>
              <span className="font-semibold text-slate-900">{ticket.user_name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Ticket Slot</span>
              <span className="font-semibold text-slate-900">Pass #{ticket.ticket_number}</span>
            </div>
            {booking && (
              <>
                <div>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date
                  </span>
                  <span className="font-semibold text-slate-900">{booking.event_date}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Venue
                  </span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {booking.city ? `${booking.city} • ` : ''}{booking.event_venue}
                  </span>
                </div>
              </>
            )}
            <div>
              <span className="text-xs text-slate-500 font-medium block">Price Paid</span>
              <span className="font-bold text-indigo-700">₹{ticket.price_paid}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Gate Status</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold uppercase ${
                  isCancelled
                    ? 'bg-rose-100 text-rose-700'
                    : isUsed
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {ticket.ticket_status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Download QR
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};
