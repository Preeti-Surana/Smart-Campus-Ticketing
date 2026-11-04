import React, { useState, useEffect } from 'react';
import {
  CampusEvent,
  DashboardAnalytics,
  Booking,
  Ticket,
} from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Calendar,
  DollarSign,
  Ticket as TicketIcon,
  Users,
  Zap,
  TrendingUp,
  Download,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  QrCode,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { DynamicPriceBadge } from './DynamicPriceBadge.tsx';
import { getAvatarForName } from '../utils/avatar.ts';

interface Props {
  events: CampusEvent[];
  onOpenCreateModal: () => void;
  onEditEvent: (event: CampusEvent) => void;
  onRefreshData: () => void;
  onOpenScanner: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  events,
  onOpenCreateModal,
  onEditEvent,
  onRefreshData,
  onOpenScanner,
}) => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState<{
    event: CampusEvent;
    tickets: Ticket[];
  } | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [events]);

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action is permanent.')) {
      return;
    }

    setIsDeleting(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error('Failed to delete event', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewAttendees = async (event: CampusEvent) => {
    try {
      const res = await fetch(`/api/events/${event.event_id}/attendees`);
      if (res.ok) {
        const tickets = await res.json();
        setSelectedEventAttendees({ event, tickets });
      }
    } catch (err) {
      console.error('Failed to load attendees', err);
    }
  };

  const handleDownloadCsv = (eventId: string) => {
    window.location.href = `/api/events/${eventId}/attendees/csv`;
  };

  // Filter attendees
  const filteredAttendees = selectedEventAttendees
    ? selectedEventAttendees.tickets.filter(
        (t) =>
          t.user_name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
          t.ticket_id.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
          t.booking_id.toLowerCase().includes(attendeeSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Fast Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Organizer & Admin Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Event Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{currentUser?.name || 'Administrator'}</strong> (
            {currentUser?.department || currentUser?.role || 'Campus Admin'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Gate Scanner</span>
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Events
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {analytics?.total_events ?? events.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Live Campus Catalog
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Tickets Sold */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tickets Sold
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {analytics?.total_tickets_sold ?? 0}
            </div>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
              Across all faculties
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TicketIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining Inventory */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Remaining Tickets
            </span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {analytics?.total_remaining_tickets ?? 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              In active inventory
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="text-3xl font-black text-indigo-600 mt-1">
              ₹{(analytics?.total_revenue ?? 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Includes dynamic surge
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Surging Events Alert Banner (Events approaching capacity) */}
      {analytics && analytics.events_approaching_capacity.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-300 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>
              ⚡ {analytics.events_approaching_capacity.length} Event(s) Approaching Capacity (Dynamic Surge Active!)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analytics.events_approaching_capacity.map((e) => (
              <div
                key={e.event_id}
                className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{e.event_name}</h4>
                  <p className="text-slate-500 text-[11px]">
                    Remaining: <strong className="text-amber-700">{e.remaining_tickets}</strong> / {e.maximum_capacity} ({Math.round((e.remaining_tickets/e.maximum_capacity)*100)}%)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-700 block">₹{e.current_price}</span>
                  <span className="text-[10px] text-amber-800 font-bold uppercase bg-amber-100 px-2 py-0.5 rounded-md">
                    +25% Surged
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Category Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Revenue & Ticket Distribution by Category</h3>
              <p className="text-xs text-slate-500">Live breakdown across campus event genres</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {analytics?.category_breakdown && analytics.category_breakdown.length > 0 ? (
              analytics.category_breakdown.map((item) => {
                const totalRev = analytics.total_revenue || 1;
                const pct = Math.round((item.revenue / totalRev) * 100);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{item.count} tickets sold</span>
                        <span className="font-bold text-indigo-700">₹{item.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.max(8, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No category sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Live Bookings Feed */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Recent Live Bookings</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {analytics?.recent_bookings && analytics.recent_bookings.length > 0 ? (
              analytics.recent_bookings.slice(0, 5).map((b) => (
                <div
                  key={b.booking_id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img
                        src={getAvatarForName(b.user_name)}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{b.user_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{b.quantity} ticket(s)</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-700">₹{b.total_amount}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{b.event_name}</div>
                  <div className="flex justify-end text-[10px] text-slate-400 font-mono">
                    <span>{new Date(b.booking_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Events Table (Admin management, pricing, capacity & attendees) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Manage Campus Events</h3>
            <p className="text-xs text-slate-500">
              Live capacity monitoring, dynamic pricing status, and attendee rosters
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-4">Event</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date & Venue</th>
                <th className="p-4">Base / Current Price</th>
                <th className="p-4">Capacity Status</th>
                <th className="p-4">Pricing Engine</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt) => {
                const percentage = Math.round(
                  (evt.remaining_tickets / evt.maximum_capacity) * 100
                );
                return (
                  <tr key={evt.event_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={evt.banner_url}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <span className="block truncate max-w-xs">{evt.event_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {evt.event_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {evt.category}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="font-medium text-slate-800">{evt.date}</div>
                      <div className="text-[11px] text-indigo-700 font-semibold truncate max-w-[140px]">
                        {evt.city || 'India'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {evt.venue}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        ₹{evt.current_price}
                        {evt.current_price > evt.base_price && (
                          <span className="text-[10px] text-slate-400 line-through ml-1">
                            ₹{evt.base_price}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Base: ₹{evt.base_price}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-bold text-slate-800">
                            {evt.tickets_sold} / {evt.maximum_capacity}
                          </span>
                          <span className="text-slate-500">{evt.remaining_tickets} left</span>
                        </div>
                        <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${
                              percentage <= 20
                                ? 'bg-amber-500'
                                : evt.remaining_tickets === 0
                                ? 'bg-rose-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((evt.tickets_sold / evt.maximum_capacity) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <DynamicPriceBadge
                        pricingStatus={evt.pricing_status}
                        basePrice={evt.base_price}
                        currentPrice={evt.current_price}
                        remainingTickets={evt.remaining_tickets}
                        capacity={evt.maximum_capacity}
                        size="sm"
                      />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewAttendees(evt)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors flex items-center gap-1"
                          title="View Registered Students"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attendees</span>
                        </button>
                        <button
                          onClick={() => handleDownloadCsv(evt.event_id)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Download CSV Attendee List"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditEvent(evt)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.event_id)}
                          disabled={isDeleting === evt.event_id}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendee Roster Modal */}
      {selectedEventAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedEventAttendees(null)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                Attendee Roster & Verification
              </div>
              <h3 className="text-xl font-bold">{selectedEventAttendees.event.event_name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Total confirmed tickets: {selectedEventAttendees.tickets.length} / {selectedEventAttendees.event.maximum_capacity}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search attendee by student name or ticket ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  onClick={() => handleDownloadCsv(selectedEventAttendees.event.event_id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                {filteredAttendees.length > 0 ? (
                  filteredAttendees.map((t) => (
                    <div
                      key={t.ticket_id}
                      className="p-3 text-xs flex items-center justify-between hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarForName(t.user_name)}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{t.user_name}</span>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Ticket: {t.ticket_id} • Booking: {t.booking_id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-indigo-700">₹{t.price_paid}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            t.ticket_status === 'used'
                              ? 'bg-slate-200 text-slate-700'
                              : t.ticket_status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.ticket_status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No attendees match search query.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEventAttendees(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
