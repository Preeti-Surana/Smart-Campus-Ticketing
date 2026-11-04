import React, { useState } from 'react';
import { CampusEvent, EventCategory } from '../types.ts';
import { EventCard } from './EventCard.tsx';
import {
  Search,
  SlidersHorizontal,
  Zap,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  X,
  Compass,
} from 'lucide-react';
import { DynamicPriceBadge } from './DynamicPriceBadge.tsx';

interface Props {
  events: CampusEvent[];
  onBookEvent: (event: CampusEvent) => void;
  onOpenTestLab?: () => void;
}

export const EventDiscovery: React.FC<Props> = ({
  events,
  onBookEvent,
  onOpenTestLab,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('urgency');
  const [onlySurging, setOnlySurging] = useState<boolean>(false);
  const [inspectEvent, setInspectEvent] = useState<CampusEvent | null>(null);

  const indianCities: string[] = [
    'All Cities',
    'Bengaluru',
    'Mumbai',
    'Delhi NCR',
    'Pune',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
  ];

  const categories: string[] = [
    'All',
    'Technical',
    'Cultural',
    'Sports',
    'Workshops',
    'Music',
    'Fest',
  ];

  // Filtering
  const filteredEvents = events.filter((evt) => {
    const matchesCity =
      selectedCity === 'All Cities' ||
      (evt.city && evt.city.toLowerCase() === selectedCity.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      evt.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      evt.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.city && evt.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.organizer_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSurge = !onlySurging || evt.pricing_status === 'surged_25';

    return matchesCity && matchesCategory && matchesSearch && matchesSurge;
  });

  // Sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'urgency') {
      return a.remaining_tickets - b.remaining_tickets;
    }
    if (sortBy === 'price_asc') {
      return a.current_price - b.current_price;
    }
    if (sortBy === 'price_desc') {
      return b.current_price - a.current_price;
    }
    if (sortBy === 'date') {
      return a.date.localeCompare(b.date);
    }
    return 0;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-8 md:p-12 shadow-2xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/25 text-xs font-semibold text-indigo-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            India's Smart Campus Ticketing System
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Discover Campus Events. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Fair & Dynamic Ticket Pricing.
            </span>
          </h1>

          <p className="text-sm md:text-base text-indigo-100/80 leading-relaxed max-w-2xl">
            Book passes for technical hackathons, cultural fests, sports tournaments, and workshops across top Indian colleges. Powered by dynamic pricing that adjusts by +25% when remaining tickets reach 20% or less.
          </p>

          {/* Quick Stats Bar in Hero */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-indigo-200/90 font-medium">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              Dynamic Surge at ≤ 20% Inventory
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Atomic Mutex Concurrency Protection
            </span>
            <span className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-300" />
              Instant Digital QR Passes
            </span>
          </div>
        </div>
      </div>

      {/* City & Category Filter Bar */}
      <div className="space-y-4">
        {/* Indian City Selector Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Select City (India)</span>
            </div>
            {selectedCity !== 'All Cities' && (
              <button
                onClick={() => setSelectedCity('All Cities')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                Reset to All Cities
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {indianCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCity === city
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar, Surge Filter & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus events by name, city, venue, or college club..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Surge Only Filter Button */}
            <button
              onClick={() => setOnlySurging(!onlySurging)}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap ${
                onlySurging
                  ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  onlySurging ? 'text-amber-600 fill-amber-500' : 'text-slate-400'
                }`}
              />
              <span>Surging (Last 20%)</span>
            </button>

            {/* Sort Selector */}
            <div className="relative min-w-[170px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs appearance-none pr-8 cursor-pointer"
              >
                <option value="urgency">Sort: Fewest Tickets Left</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="date">Date: Upcoming Soonest</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.event_id}
              event={event}
              onBook={onBookEvent}
              onViewDetails={(e) => setInspectEvent(e)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">
            No events found in {selectedCity !== 'All Cities' ? selectedCity : 'this selection'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching cities or clearing category and search filters to explore events across India.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('All Cities');
              setSelectedCategory('All');
              setOnlySurging(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Detailed Event Inspection Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
            <div className="relative h-56 w-full">
              <img
                src={inspectEvent.banner_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setInspectEvent(null)}
                className="absolute top-4 right-4 p-2 text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase bg-indigo-600 text-white">
                    {inspectEvent.category}
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-300" />
                    {inspectEvent.city || 'India'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {inspectEvent.event_name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <DynamicPriceBadge
                  pricingStatus={inspectEvent.pricing_status}
                  basePrice={inspectEvent.base_price}
                  currentPrice={inspectEvent.current_price}
                  remainingTickets={inspectEvent.remaining_tickets}
                  capacity={inspectEvent.maximum_capacity}
                />
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Ticket Price</span>
                  <span className="text-2xl font-black text-indigo-700">
                    ₹{inspectEvent.current_price}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{inspectEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>{inspectEvent.time}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-900">{inspectEvent.city}:</span>
                  <span className="truncate">{inspectEvent.venue}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  About Event
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {inspectEvent.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">
                  Organized by: {inspectEvent.organizer_name}
                </div>
                <div>
                  Cancellation Policy:{' '}
                  {inspectEvent.allow_cancellation
                    ? 'Permitted. Refunds automatically return tickets to pool.'
                    : 'Non-refundable once reserved.'}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setInspectEvent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setInspectEvent(null);
                    onBookEvent(inspectEvent);
                  }}
                  disabled={inspectEvent.remaining_tickets <= 0}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 disabled:bg-slate-300"
                >
                  {inspectEvent.remaining_tickets <= 0 ? 'Sold Out' : 'Book Tickets Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
