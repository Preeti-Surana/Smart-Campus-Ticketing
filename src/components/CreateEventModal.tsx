import React, { useState } from 'react';
import { CampusEvent, EventCategory } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Zap,
  Tag,
  Users,
  Image,
  CheckCircle,
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onEventCreated: (event: CampusEvent) => void;
  initialEvent?: CampusEvent | null;
}

const sampleBanners = [
  {
    name: 'Tech Hackathon',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Music & Concert',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Robotics & Hardware',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sports Championship',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Workshop & Bootcamp',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cultural & Acoustic',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
  },
];

const indianCities = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
];

export const CreateEventModal: React.FC<Props> = ({
  onClose,
  onEventCreated,
  initialEvent,
}) => {
  const { currentUser } = useAuth();
  const [eventName, setEventName] = useState(initialEvent?.event_name || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [date, setDate] = useState(initialEvent?.date || '2026-11-28');
  const [time, setTime] = useState(initialEvent?.time || '10:00 AM - 04:00 PM');
  const [venue, setVenue] = useState(initialEvent?.venue || 'Campus Main Auditorium');
  const [city, setCity] = useState(initialEvent?.city || 'Bengaluru');
  const [category, setCategory] = useState<EventCategory>(
    initialEvent?.category || 'Technical'
  );
  const [basePrice, setBasePrice] = useState<number>(initialEvent?.base_price ?? 200);
  const [maximumCapacity, setMaximumCapacity] = useState<number>(
    initialEvent?.maximum_capacity ?? 100
  );
  const [bannerUrl, setBannerUrl] = useState<string>(
    initialEvent?.banner_url || sampleBanners[0].url
  );
  const [allowCancellation, setAllowCancellation] = useState<boolean>(
    initialEvent?.allow_cancellation ?? true
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !venue.trim() || basePrice < 0 || maximumCapacity <= 0) {
      setErrorMessage('Please fill in all required fields with valid values.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      event_name: eventName,
      description,
      date,
      time,
      venue,
      city,
      category,
      banner_url: bannerUrl,
      base_price: Number(basePrice),
      maximum_capacity: Number(maximumCapacity),
      organizer_id: currentUser?.user_id || 'usr_admin_01',
      organizer_name: currentUser?.department || currentUser?.name || 'Campus Student Affairs',
      allow_cancellation: allowCancellation,
    };

    try {
      const url = initialEvent
        ? `/api/events/${initialEvent.event_id}`
        : '/api/events';
      const method = initialEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to save event.');
        return;
      }

      onEventCreated(data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating event';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
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
            Organizer Command Center • India
          </div>
          <h2 className="text-xl font-bold">
            {initialEvent ? 'Edit Campus Event' : 'Create New Campus Event'}
          </h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            Dynamic pricing triggers automatically when tickets drop to 20% or less
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Event Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. AI & Robotics Symposium 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the agenda, speakers, rules, and student takeaways..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* City, Category & Venue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                City (India) *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                {indianCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshops">Workshops</option>
                <option value="Music">Music</option>
                <option value="Fest">Fest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Campus Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Main Auditorium"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Time Window *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 05:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Pricing & Capacity (Clean Dynamic Pricing Inputs without sub-content box) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Base Ticket Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Maximum Capacity (Tickets) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={maximumCapacity}
                onChange={(e) => setMaximumCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              />
            </div>
          </div>

          {/* Banner Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Banner Image or Custom URL
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
              {sampleBanners.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setBannerUrl(b.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                    bannerUrl === b.url
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-102 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={b.url} alt={b.name} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-[9px] text-white py-0.5 px-1 truncate text-center block">
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="Or paste external image URL"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Cancellation Policy Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Allow Student Cancellations
              </span>
              <span className="text-[11px] text-slate-500">
                Cancelled tickets are automatically returned to inventory and dynamically repriced.
              </span>
            </div>
            <input
              type="checkbox"
              checked={allowCancellation}
              onChange={(e) => setAllowCancellation(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Event...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{initialEvent ? 'Update Event' : 'Publish Campus Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
