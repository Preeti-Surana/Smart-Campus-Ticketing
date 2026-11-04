import React from 'react';
import { CampusEvent } from '../types.ts';
import { Calendar, MapPin, Clock, Zap, Ticket, ArrowUpRight } from 'lucide-react';
import { DynamicPriceBadge } from './DynamicPriceBadge.tsx';

interface Props {
  event: CampusEvent;
  onBook: (event: CampusEvent) => void;
  onViewDetails?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<Props> = ({ event, onBook, onViewDetails }) => {
  const remaining = event.remaining_tickets;
  const capacity = event.maximum_capacity;
  const percentage = Math.round((remaining / capacity) * 100);
  const isSurged = event.pricing_status === 'surged_25';
  const isSoldOut = event.pricing_status === 'sold_out' || remaining <= 0;

  // Progress bar color based on remaining percentage
  const getProgressColor = () => {
    if (isSoldOut) return 'bg-slate-300';
    if (percentage <= 20) return 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse';
    if (percentage <= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Banner Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.banner_url}
          alt={event.event_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Category & City Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
            {event.category}
          </span>
          {event.city && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 border border-white/20 shadow-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-600" />
              {event.city}
            </span>
          )}
        </div>

        {/* Live Dynamic Surge Flag */}
        {isSurged && (
          <div className="absolute top-3 right-3 animate-pulse">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-amber-950 border border-amber-300 shadow-md flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-950" />
              ⚡ +25% Surge
            </span>
          </div>
        )}

        {isSoldOut && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
              Sold Out
            </span>
          </div>
        )}

        {/* Date on banner bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1.5 font-medium drop-shadow-md">
            <Calendar className="w-3.5 h-3.5 text-indigo-300" /> {event.date}
          </span>
          <span className="flex items-center gap-1.5 font-medium drop-shadow-md">
            <Clock className="w-3.5 h-3.5 text-indigo-300" /> {event.time}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-2">
              {event.event_name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-700">{event.city}</strong> • {event.venue}
            </span>
          </div>
        </div>

        {/* Inventory Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Ticket Availability:</span>
            <span className={`font-bold ${isSurged ? 'text-amber-700' : isSoldOut ? 'text-rose-600' : 'text-slate-800'}`}>
              {remaining} / {capacity} left ({percentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          {isSurged && (
            <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              Surge price active: only {remaining} tickets remaining!
            </p>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Current Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                ₹{event.current_price}
              </span>
              {isSurged && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{event.base_price}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(event)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                title="View Details"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onBook(event)}
              disabled={isSoldOut}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                isSoldOut
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              {isSoldOut ? 'Sold Out' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
