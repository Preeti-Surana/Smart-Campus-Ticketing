export type UserRole = 'admin' | 'organizer' | 'student';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  college_id?: string;
  department?: string;
}

export type EventCategory =
  | 'Technical'
  | 'Cultural'
  | 'Sports'
  | 'Workshops'
  | 'Music'
  | 'Fest';

export type PricingStatus = 'standard' | 'surged_25' | 'sold_out';

export interface CampusEvent {
  event_id: string;
  organizer_id: string;
  organizer_name: string;
  event_name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: EventCategory;
  banner_url: string;
  base_price: number;
  current_price: number;
  maximum_capacity: number;
  tickets_sold: number;
  remaining_tickets: number;
  pricing_status: PricingStatus;
  allow_cancellation: boolean;
  created_at: string;
  tags?: string[];
}

export interface Booking {
  booking_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_venue: string;
  city?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  booking_status: 'confirmed' | 'cancelled';
  payment_status: 'completed' | 'refunded';
  payment_method: string;
  idempotency_key?: string;
  booking_timestamp: string;
  tickets: Ticket[];
}

export interface Ticket {
  ticket_id: string;
  booking_id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  ticket_number: number;
  unique_qr_code: string;
  ticket_status: 'active' | 'used' | 'cancelled';
  scanned_at?: string;
  price_paid: number;
}

export interface DashboardAnalytics {
  total_events: number;
  total_tickets_sold: number;
  total_remaining_tickets: number;
  total_revenue: number;
  events_approaching_capacity: CampusEvent[];
  recent_bookings: Booking[];
  category_breakdown: { category: string; count: number; revenue: number }[];
  sales_timeline: { date: string; tickets: number; revenue: number }[];
}

export interface ConcurrencySimulationResult {
  scenario: string;
  event_id: string;
  event_name: string;
  initial_remaining: number;
  attempted_concurrent_requests: number;
  successful_bookings: number;
  failed_bookings: number;
  final_remaining: number;
  final_tickets_sold: number;
  capacity: number;
  oversold: boolean;
  logs: {
    request_number: number;
    user_name: string;
    timestamp_offset_ms: number;
    status: 'success' | 'failed';
    booking_id?: string;
    ticket_id?: string;
    message: string;
  }[];
  duration_ms: number;
}
