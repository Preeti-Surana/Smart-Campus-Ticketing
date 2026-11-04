import React, { useState } from 'react';
import {
  X,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Search,
  ShieldCheck,
  User,
  Calendar,
  Ticket as TicketIcon,
} from 'lucide-react';
import { Ticket, Booking, CampusEvent } from '../types.ts';

interface Props {
  onClose: () => void;
  recentTickets?: Ticket[];
}

export const TicketScannerModal: React.FC<Props> = ({
  onClose,
  recentTickets = [],
}) => {
  const [inputCode, setInputCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    ticket?: Ticket;
    booking?: Booking;
    event?: CampusEvent;
  } | null>(null);

  const handleVerify = async (codeToVerify: string) => {
    const code = codeToVerify.trim();
    if (!code) return;

    setIsVerifying(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setScanResult({
          success: true,
          message: data.message,
          ticket: data.ticket,
          booking: data.booking,
          event: data.event,
        });
      } else {
        setScanResult({
          success: false,
          error: data.error || 'Verification failed. Invalid pass.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setScanResult({ success: false, error: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Gate Entry Verification Portal
          </div>
          <h2 className="text-xl font-bold">QR Pass Scanner & Check-in</h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Real-time validation against authoritative ticket database
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Manual Input / Scan Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Scan or Enter QR Code Payload / Ticket ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. CAMPUS-PASS|evt_... or TK-881021"
                  className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify(inputCode);
                  }}
                />
              </div>
              <button
                onClick={() => handleVerify(inputCode)}
                disabled={isVerifying || !inputCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Result Notification */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {scanResult.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Valid Ticket Pass • Entry Granted!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Access Denied!</span>
                  </>
                )}
              </div>

              {scanResult.success && scanResult.ticket && (
                <div className="space-y-1.5 pt-1 text-slate-700 bg-white/80 p-3 rounded-xl border border-emerald-100">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Attendee:</span>
                    <span className="font-bold text-slate-900">{scanResult.ticket.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Ticket ID:</span>
                    <span className="font-mono font-bold text-indigo-700">{scanResult.ticket.ticket_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Event:</span>
                    <span className="font-semibold text-slate-800">{scanResult.event?.event_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Checked In At:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}

              {!scanResult.success && (
                <p className="text-rose-700 font-medium">{scanResult.error}</p>
              )}
            </div>
          )}

          {/* Quick Test Samples for convenience */}
          {recentTickets.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Click to Test Scan Sample Tickets:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {recentTickets.slice(0, 4).map((t) => (
                  <button
                    key={t.ticket_id}
                    type="button"
                    onClick={() => {
                      setInputCode(t.unique_qr_code);
                      handleVerify(t.unique_qr_code);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <TicketIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-medium text-slate-800">{t.user_name}</span>
                      <span className="text-slate-400 font-mono">({t.ticket_id})</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                        t.ticket_status === 'used'
                          ? 'bg-slate-200 text-slate-700'
                          : t.ticket_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.ticket_status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
