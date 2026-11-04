import {
  User,
  CampusEvent,
  Booking,
  Ticket,
  DashboardAnalytics,
  ConcurrencySimulationResult,
} from '../types.ts';

// In-memory Mutex lock implementation for concurrency-safe transactional updates per event
class AsyncMutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift()!;
          next();
        } else {
          this.locked = false;
        }
      };

      if (!this.locked) {
        this.locked = true;
        resolve(release);
      } else {
        this.queue.push(() => resolve(release));
      }
    });
  }
}

const eventLocks = new Map<string, AsyncMutex>();
function getEventLock(eventId: string): AsyncMutex {
  if (!eventLocks.has(eventId)) {
    eventLocks.set(eventId, new AsyncMutex());
  }
  return eventLocks.get(eventId)!;
}

// In-memory database with realistic initial seed
interface DatabaseState {
  users: User[];
  events: CampusEvent[];
  bookings: Booking[];
  tickets: Ticket[];
  idempotencyCache: Map<string, { status: number; body: unknown }>;
}

export function calculateEventPricing(
  basePrice: number,
  capacity: number,
  remainingTickets: number
): { currentPrice: number; pricingStatus: 'standard' | 'surged_25' | 'sold_out' } {
  if (remainingTickets <= 0) {
    // If sold out, the price frozen was surged if it hit <= 20%, otherwise base price * 1.25
    return {
      currentPrice: Math.round(basePrice * 1.25),
      pricingStatus: 'sold_out',
    };
  }

  // Dynamic Pricing Rule:
  // When remaining tickets reach 20% or less of total capacity:
  // (remaining / capacity) * 100 <= 20
  const threshold = Math.floor(capacity * 0.2); // 20% of capacity
  if (remainingTickets <= threshold) {
    return {
      currentPrice: Math.round(basePrice * 1.25),
      pricingStatus: 'surged_25',
    };
  }

  return {
    currentPrice: basePrice,
    pricingStatus: 'standard',
  };
}

import { getAvatarForName } from '../utils/avatar.ts';

const initialUsers: User[] = [
  {
    user_id: 'usr_admin_01',
    name: 'Dr. Vivek Sharma',
    email: 'v.sharma@campus.edu',
    role: 'admin',
    avatar: getAvatarForName('Dr. Vivek Sharma'),
    college_id: 'FAC-2041',
    department: 'Dean of Student Welfare & Clubs',
  },
  {
    user_id: 'usr_org_01',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@campus.edu',
    role: 'organizer',
    avatar: getAvatarForName('Ananya Deshmukh'),
    college_id: 'STU-9921',
    department: 'Technical & Coding Society Lead',
  },
  {
    user_id: 'usr_stu_01',
    name: 'Aarav Patel',
    email: 'aarav.patel@campus.edu',
    role: 'student',
    avatar: getAvatarForName('Aarav Patel'),
    college_id: 'CS-2024-042',
    department: 'Computer Science & Engineering',
  },
  {
    user_id: 'usr_stu_02',
    name: 'Priya Sundaram',
    email: 'priya.s@campus.edu',
    role: 'student',
    avatar: getAvatarForName('Priya Sundaram'),
    college_id: 'EC-2023-118',
    department: 'Electronics & Communication',
  },
];

const seedEvents: CampusEvent[] = [
  {
    event_id: 'evt_tech_hack',
    organizer_id: 'usr_org_01',
    organizer_name: 'Technical & Coding Society',
    event_name: 'HackTech 2026: 24-Hour AI & Web3 Hackathon',
    description:
      'The premier annual campus hackathon! Build innovative full-stack, AI, and hardware prototypes in 24 hours. Free meals, mentorship from top tech leaders, swag bags, and ₹1,50,000 in cash prizes.',
    date: '2026-11-20',
    time: '09:00 AM - 10:00 AM (Next Day)',
    venue: 'IISc Innovation Hub, Main Auditorium 4',
    city: 'Bengaluru',
    category: 'Technical',
    banner_url:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    base_price: 200,
    current_price: 200,
    maximum_capacity: 100,
    tickets_sold: 45,
    remaining_tickets: 55,
    pricing_status: 'standard',
    allow_cancellation: true,
    created_at: '2026-11-01T10:00:00.000Z',
    tags: ['Hackathon', 'Bengaluru', 'AI', 'Coding', 'Prizes'],
  },
  {
    event_id: 'evt_robo_expo',
    organizer_id: 'usr_org_01',
    organizer_name: 'Robotics & Automation Club',
    event_name: 'Robotics & Autonomous Drones Expo 2026',
    description:
      'Witness combat bots, autonomous racing rovers, and quadcopter precision aerobatics. Includes hands-on micro-controller lab sessions and industry keynote on humanoid robotics. High demand!',
    date: '2026-11-25',
    time: '01:00 PM - 06:30 PM',
    venue: 'IIT Bombay Powai Campus, Mech Arena',
    city: 'Mumbai',
    category: 'Workshops',
    banner_url:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    base_price: 200,
    current_price: 250, // Surged because 19 remaining <= 20% of 100!
    maximum_capacity: 100,
    tickets_sold: 81,
    remaining_tickets: 19, // 19% remaining -> Surged!
    pricing_status: 'surged_25',
    allow_cancellation: false,
    created_at: '2026-10-28T09:00:00.000Z',
    tags: ['Robotics', 'Mumbai', 'Surge Price', 'Drones'],
  },
  {
    event_id: 'evt_race_condition',
    organizer_id: 'usr_admin_01',
    organizer_name: 'Dean of Student Welfare & Clubs',
    event_name: 'Campus Fest Grand Finale & DJ Electric Night',
    description:
      'The biggest cultural evening of the semester featuring international DJ sets, laser pyrotechnics, street food carnival, and celebrity guest performances. STRICT CAPACITY LIMIT: Only 1 ticket remaining!',
    date: '2026-11-28',
    time: '06:00 PM - 11:30 PM',
    venue: 'IIT Delhi Campus, Central Amphitheatre Arena',
    city: 'Delhi NCR',
    category: 'Music',
    banner_url:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    base_price: 500,
    current_price: 625, // 500 * 1.25 surged!
    maximum_capacity: 50,
    tickets_sold: 49,
    remaining_tickets: 1, // EXACTLY 1 TICKET REMAINING!
    pricing_status: 'surged_25',
    allow_cancellation: false,
    created_at: '2026-10-20T12:00:00.000Z',
    tags: ['Critical Test', 'Delhi NCR', '1 Ticket Left', 'DJ Night'],
  },
  {
    event_id: 'evt_cultural_unplugged',
    organizer_id: 'usr_admin_01',
    organizer_name: 'Music & Dramatics Society',
    event_name: 'Acoustic Unplugged Campus Jam Session',
    description:
      'Intimate acoustic evening with campus indie vocalists, violin ensembles, and open-mic acoustic sets under fairy lights. Free artisan chai and cookies served.',
    date: '2026-11-15',
    time: '05:30 PM - 09:00 PM',
    venue: 'COEP Ground, Rose Garden Gazebo Lawn',
    city: 'Pune',
    category: 'Cultural',
    banner_url:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    base_price: 150,
    current_price: 188,
    maximum_capacity: 60,
    tickets_sold: 60,
    remaining_tickets: 0, // SOLD OUT!
    pricing_status: 'sold_out',
    allow_cancellation: false,
    created_at: '2026-10-15T15:00:00.000Z',
    tags: ['Sold Out', 'Pune', 'Acoustic', 'Music'],
  },
  {
    event_id: 'evt_sports_derby',
    organizer_id: 'usr_admin_01',
    organizer_name: 'Campus Sports Directorate',
    event_name: 'Inter-College Basketball Championship Final',
    description:
      'High-octane finals between Campus Eagles and City Tech Wolves. Live commentary, cheerleading squad performance, half-time 3-point shootout with student prizes.',
    date: '2026-11-30',
    time: '04:00 PM - 07:30 PM',
    venue: 'Gachibowli Stadium & IIIT Hyderabad Arena',
    city: 'Hyderabad',
    category: 'Sports',
    banner_url:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    base_price: 100,
    current_price: 100,
    maximum_capacity: 200,
    tickets_sold: 50,
    remaining_tickets: 150,
    pricing_status: 'standard',
    allow_cancellation: true,
    created_at: '2026-11-02T08:00:00.000Z',
    tags: ['Basketball', 'Hyderabad', 'Tournament'],
  },
  {
    event_id: 'evt_web_bootcamp',
    organizer_id: 'usr_org_01',
    organizer_name: 'Developer Student Club',
    event_name: 'Production React & Cloud Native Architectures',
    description:
      'Deep dive into full-stack modern web engineering: TypeScript, Vite, distributed state, concurrency, and real-time WebSockets with live deployment labs.',
    date: '2026-12-05',
    time: '10:00 AM - 04:00 PM',
    venue: 'IIT Madras Research Park, Hall 3',
    city: 'Chennai',
    category: 'Workshops',
    banner_url:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    base_price: 300,
    current_price: 375, // 6 remaining <= 20% of 40 (threshold 8) -> Surged!
    maximum_capacity: 40,
    tickets_sold: 34,
    remaining_tickets: 6,
    pricing_status: 'surged_25',
    allow_cancellation: true,
    created_at: '2026-11-03T11:00:00.000Z',
    tags: ['FullStack', 'Chennai', 'React', 'Cloud'],
  },
  {
    event_id: 'evt_kolkata_fest',
    organizer_id: 'usr_admin_01',
    organizer_name: 'Arts & Music Council',
    event_name: 'Kolkata Inter-Collegiate Band Battle & Fest',
    description:
      'Electrifying rock, fusion, and indie performances from eastern collegiate bands. Food stalls featuring Kolkata kathi rolls, artisan momos, and campus merch.',
    date: '2026-12-12',
    time: '04:30 PM - 10:00 PM',
    venue: 'Jadavpur University Open Air Theatre',
    city: 'Kolkata',
    category: 'Music',
    banner_url:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
    base_price: 150,
    current_price: 150,
    maximum_capacity: 120,
    tickets_sold: 40,
    remaining_tickets: 80,
    pricing_status: 'standard',
    allow_cancellation: true,
    created_at: '2026-11-02T14:00:00.000Z',
    tags: ['Kolkata', 'BandBattle', 'Rock', 'Music'],
  },
  {
    event_id: 'evt_ahmedabad_pitch',
    organizer_id: 'usr_org_01',
    organizer_name: 'E-Cell & Venture Hub',
    event_name: 'Gujarat Collegiate Startup Pitch & Summit',
    description:
      'Connect with Angel investors, VC partners, and student founders. Live elevator pitch contest with ₹5,00,000 seed grant pool and prototype showcase.',
    date: '2026-12-18',
    time: '09:30 AM - 05:00 PM',
    venue: 'IIMA Campus, Ravi Matthai Auditorium',
    city: 'Ahmedabad',
    category: 'Workshops',
    banner_url:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
    base_price: 250,
    current_price: 250,
    maximum_capacity: 80,
    tickets_sold: 22,
    remaining_tickets: 58,
    pricing_status: 'standard',
    allow_cancellation: true,
    created_at: '2026-11-03T16:00:00.000Z',
    tags: ['Ahmedabad', 'Startup', 'Pitch', 'Venture'],
  },
];

// Seed initial sample bookings for analytics realism
const seedBookings: Booking[] = [
  {
    booking_id: 'BK-77218901',
    user_id: 'usr_stu_01',
    user_name: 'Aarav Patel',
    user_email: 'aarav.patel@campus.edu',
    event_id: 'evt_tech_hack',
    event_name: 'HackTech 2026: 24-Hour AI & Web3 Hackathon',
    event_date: '2026-11-20',
    event_venue: 'IISc Innovation Hub, Main Auditorium 4',
    city: 'Bengaluru',
    quantity: 1,
    unit_price: 200,
    total_amount: 200,
    booking_status: 'confirmed',
    payment_status: 'completed',
    payment_method: 'Campus UPI / GPay',
    idempotency_key: 'idemp_seed_01',
    booking_timestamp: '2026-11-03T14:22:10.000Z',
    tickets: [
      {
        ticket_id: 'TK-881021',
        booking_id: 'BK-77218901',
        event_id: 'evt_tech_hack',
        user_id: 'usr_stu_01',
        user_name: 'Aarav Patel',
        ticket_number: 1,
        unique_qr_code: 'CAMPUS-PASS-evt_tech_hack-BK-77218901-TK-881021-HASH992',
        ticket_status: 'active',
        price_paid: 200,
      },
    ],
  },
  {
    booking_id: 'BK-55419082',
    user_id: 'usr_stu_02',
    user_name: 'Priya Sundaram',
    user_email: 'priya.s@campus.edu',
    event_id: 'evt_robo_expo',
    event_name: 'Robotics & Autonomous Drones Expo 2026',
    event_date: '2026-11-25',
    event_venue: 'IIT Bombay Powai Campus, Mech Arena',
    city: 'Mumbai',
    quantity: 2,
    unit_price: 250,
    total_amount: 500,
    booking_status: 'confirmed',
    payment_status: 'completed',
    payment_method: 'Campus Student ID Card',
    idempotency_key: 'idemp_seed_02',
    booking_timestamp: '2026-11-03T18:45:00.000Z',
    tickets: [
      {
        ticket_id: 'TK-993041',
        booking_id: 'BK-55419082',
        event_id: 'evt_robo_expo',
        user_id: 'usr_stu_02',
        user_name: 'Priya Sundaram',
        ticket_number: 1,
        unique_qr_code: 'CAMPUS-PASS-evt_robo_expo-BK-55419082-TK-993041-HASH104',
        ticket_status: 'active',
        price_paid: 250,
      },
      {
        ticket_id: 'TK-993042',
        booking_id: 'BK-55419082',
        event_id: 'evt_robo_expo',
        user_id: 'usr_stu_02',
        user_name: 'Priya Sundaram',
        ticket_number: 2,
        unique_qr_code: 'CAMPUS-PASS-evt_robo_expo-BK-55419082-TK-993042-HASH105',
        ticket_status: 'active',
        price_paid: 250,
      },
    ],
  },
];

const seedTickets: Ticket[] = seedBookings.flatMap((b) => b.tickets);

class DatabaseManager {
  private state: DatabaseState = {
    users: [...initialUsers],
    events: [...seedEvents],
    bookings: [...seedBookings],
    tickets: [...seedTickets],
    idempotencyCache: new Map(),
  };

  constructor() {
    this.refreshAllEventPricing();
  }

  // Authoritative dynamic pricing sync across all events
  public refreshAllEventPricing(): void {
    for (const evt of this.state.events) {
      const { currentPrice, pricingStatus } = calculateEventPricing(
        evt.base_price,
        evt.maximum_capacity,
        evt.remaining_tickets
      );
      evt.current_price = currentPrice;
      evt.pricing_status = pricingStatus;
    }
  }

  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.user_id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public createUser(userData: Omit<User, 'user_id'>): User {
    const newUser: User = {
      ...userData,
      avatar: userData.avatar || getAvatarForName(userData.name),
      user_id: 'usr_' + Math.random().toString(36).substring(2, 9),
    };
    this.state.users.push(newUser);
    return newUser;
  }

  public getEvents(): CampusEvent[] {
    this.refreshAllEventPricing();
    return [...this.state.events];
  }

  public getEventById(id: string): CampusEvent | undefined {
    this.refreshAllEventPricing();
    return this.state.events.find((e) => e.event_id === id);
  }

  public createEvent(
    data: Omit<
      CampusEvent,
      | 'event_id'
      | 'tickets_sold'
      | 'remaining_tickets'
      | 'current_price'
      | 'pricing_status'
      | 'created_at'
    >
  ): CampusEvent {
    const event_id = 'evt_' + Math.random().toString(36).substring(2, 9);
    const capacity = Number(data.maximum_capacity);
    const base_price = Number(data.base_price);

    const { currentPrice, pricingStatus } = calculateEventPricing(
      base_price,
      capacity,
      capacity
    );

    const newEvent: CampusEvent = {
      ...data,
      event_id,
      base_price,
      maximum_capacity: capacity,
      tickets_sold: 0,
      remaining_tickets: capacity,
      current_price: currentPrice,
      pricing_status: pricingStatus,
      created_at: new Date().toISOString(),
    };

    this.state.events.push(newEvent);
    return newEvent;
  }

  public updateEvent(
    id: string,
    updates: Partial<CampusEvent>
  ): CampusEvent | null {
    const index = this.state.events.findIndex((e) => e.event_id === id);
    if (index === -1) return null;

    const current = this.state.events[index];
    const capacity =
      updates.maximum_capacity !== undefined
        ? Number(updates.maximum_capacity)
        : current.maximum_capacity;
    const basePrice =
      updates.base_price !== undefined
        ? Number(updates.base_price)
        : current.base_price;

    const remaining = Math.max(0, capacity - current.tickets_sold);
    const { currentPrice, pricingStatus } = calculateEventPricing(
      basePrice,
      capacity,
      remaining
    );

    const updated: CampusEvent = {
      ...current,
      ...updates,
      base_price: basePrice,
      maximum_capacity: capacity,
      remaining_tickets: remaining,
      current_price: currentPrice,
      pricing_status: pricingStatus,
    };

    this.state.events[index] = updated;
    return updated;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.state.events.length;
    this.state.events = this.state.events.filter((e) => e.event_id !== id);
    return this.state.events.length < initialLen;
  }

  // ATOMIC CONCURRENCY-SAFE BOOKING LOGIC WITH EVENT-LEVEL MUTEX LOCK & IDEMPOTENCY
  public async bookTickets(params: {
    eventId: string;
    userId: string;
    quantity: number;
    paymentMethod?: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; booking?: Booking; error?: string; status: number }> {
    const { eventId, userId, quantity, paymentMethod = 'Online Card / UPI', idempotencyKey } = params;

    // Check Idempotency Cache to prevent duplicate booking requests
    if (idempotencyKey && this.state.idempotencyCache.has(idempotencyKey)) {
      const cached = this.state.idempotencyCache.get(idempotencyKey)!;
      return cached.body as { success: boolean; booking?: Booking; error?: string; status: number };
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, error: 'Invalid ticket quantity requested.', status: 400 };
    }

    const lock = getEventLock(eventId);
    const release = await lock.acquire();

    try {
      // Re-fetch inside atomic critical section
      const eventIndex = this.state.events.findIndex((e) => e.event_id === eventId);
      if (eventIndex === -1) {
        return { success: false, error: 'Event not found.', status: 404 };
      }

      const event = this.state.events[eventIndex];
      const user = this.getUserById(userId) || {
        user_id: userId,
        name: 'Student Guest',
        email: 'student@campus.edu',
        role: 'student' as const,
      };

      // RACE CONDITION DEFENSE: Strict atomic verification of remaining tickets
      if (event.remaining_tickets <= 0) {
        return {
          success: false,
          error: 'Sorry, this event is completely sold out! No tickets remaining.',
          status: 409,
        };
      }

      if (event.remaining_tickets < quantity) {
        return {
          success: false,
          error: `Sorry, only ${event.remaining_tickets} ticket(s) remaining. Cannot book ${quantity}.`,
          status: 409,
        };
      }

      // Compute Authoritative Dynamic Price at this exact moment of booking
      const { currentPrice } = calculateEventPricing(
        event.base_price,
        event.maximum_capacity,
        event.remaining_tickets
      );

      const unitPrice = currentPrice;
      const totalAmount = unitPrice * quantity;

      // ATOMIC INVENTORY UPDATE
      event.remaining_tickets -= quantity;
      event.tickets_sold += quantity;

      // Recalculate price and surge status after deduction
      const postPricing = calculateEventPricing(
        event.base_price,
        event.maximum_capacity,
        event.remaining_tickets
      );
      event.current_price = postPricing.currentPrice;
      event.pricing_status = postPricing.pricingStatus;

      // Generate Unique Booking Record
      const bookingId =
        'BK-' +
        Math.floor(10000000 + Math.random() * 90000000).toString();

      const bookingTickets: Ticket[] = [];
      for (let i = 1; i <= quantity; i++) {
        const ticketId = 'TK-' + Math.floor(100000 + Math.random() * 900000);
        const qrCodePayload = `CAMPUS-PASS|${event.event_id}|${bookingId}|${ticketId}|${user.user_id}|${Date.now()}`;
        const ticket: Ticket = {
          ticket_id: ticketId,
          booking_id: bookingId,
          event_id: event.event_id,
          user_id: user.user_id,
          user_name: user.name,
          ticket_number: i,
          unique_qr_code: qrCodePayload,
          ticket_status: 'active',
          price_paid: unitPrice,
        };
        bookingTickets.push(ticket);
        this.state.tickets.push(ticket);
      }

      const booking: Booking = {
        booking_id: bookingId,
        user_id: user.user_id,
        user_name: user.name,
        user_email: user.email,
        event_id: event.event_id,
        event_name: event.event_name,
        event_date: event.date,
        event_venue: event.venue,
        city: event.city,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        booking_status: 'confirmed',
        payment_status: 'completed',
        payment_method: paymentMethod,
        idempotency_key: idempotencyKey,
        booking_timestamp: new Date().toISOString(),
        tickets: bookingTickets,
      };

      this.state.bookings.unshift(booking);

      const responsePayload = {
        success: true,
        booking,
        status: 201,
      };

      if (idempotencyKey) {
        this.state.idempotencyCache.set(idempotencyKey, {
          status: 201,
          body: responsePayload,
        });
      }

      return responsePayload;
    } finally {
      release();
    }
  }

  // Cancel booking with atomic ticket restoration & dynamic price re-adjustment
  public async cancelBooking(bookingId: string): Promise<{ success: boolean; error?: string }> {
    const booking = this.state.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };
    if (booking.booking_status === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }

    const event = this.state.events.find((e) => e.event_id === booking.event_id);
    if (!event) return { success: false, error: 'Associated event not found' };

    const lock = getEventLock(event.event_id);
    const release = await lock.acquire();

    try {
      booking.booking_status = 'cancelled';
      booking.payment_status = 'refunded';

      // Restore inventory
      event.remaining_tickets = Math.min(
        event.maximum_capacity,
        event.remaining_tickets + booking.quantity
      );
      event.tickets_sold = Math.max(0, event.tickets_sold - booking.quantity);

      // Re-evaluate dynamic pricing (e.g. if was surged and now > 20%, drops back to base price)
      const { currentPrice, pricingStatus } = calculateEventPricing(
        event.base_price,
        event.maximum_capacity,
        event.remaining_tickets
      );
      event.current_price = currentPrice;
      event.pricing_status = pricingStatus;

      // Mark tickets as cancelled
      for (const t of booking.tickets) {
        t.ticket_status = 'cancelled';
      }

      return { success: true };
    } finally {
      release();
    }
  }

  public getBookings(userId?: string): Booking[] {
    if (userId) {
      return this.state.bookings.filter((b) => b.user_id === userId);
    }
    return [...this.state.bookings];
  }

  public getBookingById(bookingId: string): Booking | undefined {
    return this.state.bookings.find((b) => b.booking_id === bookingId);
  }

  public getTicketsByEvent(eventId: string): Ticket[] {
    return this.state.tickets.filter((t) => t.event_id === eventId);
  }

  // QR Code Verification Scanner API
  public verifyAndCheckInTicket(qrCodeString: string): {
    success: boolean;
    ticket?: Ticket;
    booking?: Booking;
    event?: CampusEvent;
    error?: string;
  } {
    const cleanQr = qrCodeString.trim();
    const ticket = this.state.tickets.find(
      (t) => t.unique_qr_code === cleanQr || t.ticket_id === cleanQr
    );

    if (!ticket) {
      return { success: false, error: 'Invalid or fraudulent ticket pass QR code.' };
    }

    if (ticket.ticket_status === 'cancelled') {
      return { success: false, error: 'This ticket was cancelled and refunded.' };
    }

    if (ticket.ticket_status === 'used') {
      return {
        success: false,
        error: `Ticket already checked in at ${ticket.scanned_at || 'an earlier gate entry'}! Possible duplicate scan.`,
      };
    }

    ticket.ticket_status = 'used';
    ticket.scanned_at = new Date().toISOString();

    const booking = this.state.bookings.find((b) => b.booking_id === ticket.booking_id);
    const event = this.state.events.find((e) => e.event_id === ticket.event_id);

    return {
      success: true,
      ticket,
      booking,
      event,
    };
  }

  public getAnalytics(): DashboardAnalytics {
    this.refreshAllEventPricing();
    const total_events = this.state.events.length;
    const total_tickets_sold = this.state.events.reduce(
      (acc, e) => acc + e.tickets_sold,
      0
    );
    const total_remaining_tickets = this.state.events.reduce(
      (acc, e) => acc + e.remaining_tickets,
      0
    );

    // Sum revenue from confirmed bookings
    const total_revenue = this.state.bookings
      .filter((b) => b.booking_status === 'confirmed')
      .reduce((acc, b) => acc + b.total_amount, 0);

    // Events approaching full capacity (< 20% remaining)
    const events_approaching_capacity = this.state.events.filter(
      (e) =>
        e.remaining_tickets > 0 &&
        e.remaining_tickets <= Math.floor(e.maximum_capacity * 0.2)
    );

    // Category breakdown
    const categoryMap = new Map<string, { count: number; revenue: number }>();
    for (const b of this.state.bookings.filter((b) => b.booking_status === 'confirmed')) {
      const evt = this.state.events.find((e) => e.event_id === b.event_id);
      const cat = evt ? evt.category : 'General';
      const cur = categoryMap.get(cat) || { count: 0, revenue: 0 };
      cur.count += b.quantity;
      cur.revenue += b.total_amount;
      categoryMap.set(cat, cur);
    }

    const category_breakdown = Array.from(categoryMap.entries()).map(
      ([category, val]) => ({
        category,
        count: val.count,
        revenue: val.revenue,
      })
    );

    // Sales timeline by recent dates
    const salesTimelineMap = new Map<string, { tickets: number; revenue: number }>();
    for (const b of this.state.bookings.filter((b) => b.booking_status === 'confirmed')) {
      const dateKey = b.booking_timestamp.split('T')[0];
      const cur = salesTimelineMap.get(dateKey) || { tickets: 0, revenue: 0 };
      cur.tickets += b.quantity;
      cur.revenue += b.total_amount;
      salesTimelineMap.set(dateKey, cur);
    }

    const sales_timeline = Array.from(salesTimelineMap.entries())
      .map(([date, val]) => ({
        date,
        tickets: val.tickets,
        revenue: val.revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_events,
      total_tickets_sold,
      total_remaining_tickets,
      total_revenue,
      events_approaching_capacity,
      recent_bookings: this.state.bookings.slice(0, 10),
      category_breakdown,
      sales_timeline,
    };
  }

  // RACE CONDITION TESTING LAB SIMULATION
  // Fires N concurrent asynchronous booking requests at the EXACT SAME MILLISECOND
  // To test and prove the atomic single-winner guarantee
  public async simulateConcurrencyRace(
    eventId: string,
    simulatedUsersCount = 10
  ): Promise<ConcurrencySimulationResult> {
    const event = this.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found for simulation');
    }

    const initialRemaining = event.remaining_tickets;
    const capacity = event.maximum_capacity;

    const dummyUserNames = [
      'Priya Sundaram',
      'Aarav Patel',
      'Rohan Mehta',
      'Neha Sharma',
      'Kabir Das',
      'Tanvi Verma',
      'Aditya Roy',
      'Ananya Sen',
      'Vikram Seth',
      'Ishaan Malhotra',
      'Sneha Kulkarni',
      'Karan Johar',
    ];

    const startTime = Date.now();
    const logs: ConcurrencySimulationResult['logs'] = [];

    // Create an array of simultaneous promises
    const promises = Array.from({ length: simulatedUsersCount }).map(
      async (_, idx) => {
        const studentName = dummyUserNames[idx % dummyUserNames.length];
        const studentId = `sim_user_${idx + 1}_${Math.random().toString(36).substring(2, 6)}`;
        const reqStartTime = Date.now();

        const res = await this.bookTickets({
          eventId,
          userId: studentId,
          quantity: 1,
          paymentMethod: 'Simulated Rapid Checkout',
          idempotencyKey: `sim_key_${idx}_${Date.now()}`,
        });

        const offsetMs = Date.now() - startTime;

        if (res.success && res.booking) {
          logs.push({
            request_number: idx + 1,
            user_name: studentName,
            timestamp_offset_ms: offsetMs,
            status: 'success',
            booking_id: res.booking.booking_id,
            ticket_id: res.booking.tickets[0]?.ticket_id,
            message: `WINNER! Acquired lock and secured ticket at +${offsetMs}ms.`,
          });
        } else {
          logs.push({
            request_number: idx + 1,
            user_name: studentName,
            timestamp_offset_ms: offsetMs,
            status: 'failed',
            message: `REJECTED (${res.error || 'Sold out'}) at +${offsetMs}ms.`,
          });
        }
      }
    );

    // Fire all requests concurrently with Promise.all
    await Promise.all(promises);

    const updatedEvent = this.getEventById(eventId)!;
    const successful = logs.filter((l) => l.status === 'success').length;
    const failed = logs.filter((l) => l.status === 'failed').length;

    // Sort logs by offset
    logs.sort((a, b) => a.timestamp_offset_ms - b.timestamp_offset_ms);

    return {
      scenario: `Simulated ${simulatedUsersCount} students firing 'Book Now' concurrently for remaining ${initialRemaining} ticket(s)`,
      event_id: eventId,
      event_name: event.event_name,
      initial_remaining: initialRemaining,
      attempted_concurrent_requests: simulatedUsersCount,
      successful_bookings: successful,
      failed_bookings: failed,
      final_remaining: updatedEvent.remaining_tickets,
      final_tickets_sold: updatedEvent.tickets_sold,
      capacity,
      oversold: updatedEvent.tickets_sold > capacity,
      logs,
      duration_ms: Date.now() - startTime,
    };
  }

  // Reset or Seed specific state for test scenarios (e.g. 100 tickets @ ₹200)
  public setupScenarioTestEvent(): CampusEvent {
    // Check if test event already exists
    let testEvt = this.state.events.find((e) => e.event_id === 'evt_test_scenario_100');
    if (!testEvt) {
      testEvt = {
        event_id: 'evt_test_scenario_100',
        organizer_id: 'usr_admin_01',
        organizer_name: 'Campus QA & Evaluation Board',
        event_name: 'Test Scenario: Tech Symposium 2026',
        description: 'Benchmark event configured with Base Price ₹200 and Maximum Capacity 100 tickets.',
        date: '2026-12-10',
        time: '10:00 AM - 05:00 PM',
        venue: 'Engineering Quad - Hall A',
        city: 'Bengaluru',
        category: 'Technical',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        base_price: 200,
        current_price: 200,
        maximum_capacity: 100,
        tickets_sold: 0,
        remaining_tickets: 100,
        pricing_status: 'standard',
        allow_cancellation: true,
        created_at: new Date().toISOString(),
        tags: ['Benchmark', '100 Tickets', '₹200 Base'],
      };
      this.state.events.unshift(testEvt);
    } else {
      // Reset to pristine 100 tickets @ ₹200
      testEvt.base_price = 200;
      testEvt.current_price = 200;
      testEvt.maximum_capacity = 100;
      testEvt.tickets_sold = 0;
      testEvt.remaining_tickets = 100;
      testEvt.pricing_status = 'standard';
    }
    return testEvt;
  }
}

export const db = new DatabaseManager();
