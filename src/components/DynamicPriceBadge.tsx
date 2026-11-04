import React from 'react';
import { PricingStatus } from '../types.ts';
import { Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  pricingStatus: PricingStatus;
  basePrice: number;
  currentPrice: number;
  remainingTickets: number;
  capacity: number;
  size?: 'sm' | 'md' | 'lg';
}

export const DynamicPriceBadge: React.FC<Props> = ({
  pricingStatus,
  basePrice,
  currentPrice,
  remainingTickets,
  capacity,
  size = 'md',
}) => {
  const percentage = Math.round((remainingTickets / capacity) * 100);
  const isSurged = pricingStatus === 'surged_25';
  const isSoldOut = pricingStatus === 'sold_out' || remainingTickets <= 0;

  if (isSoldOut) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span>Sold Out</span>
      </div>
    );
  }

  if (isSurged) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 text-amber-900 border border-amber-300 shadow-xs ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        }`}
        title="Dynamic surge activated: remaining tickets <= 20% of capacity"
      >
        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-bounce" />
        <span className="font-semibold text-amber-800">
          ⚡ 25% Surge (+₹{currentPrice - basePrice})
        </span>
        <span className="text-amber-700 font-normal">
          • {remainingTickets} left ({percentage}%)
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>Standard Price</span>
      <span className="text-emerald-700 font-normal">
        • {remainingTickets} of {capacity} left
      </span>
    </div>
  );
};
