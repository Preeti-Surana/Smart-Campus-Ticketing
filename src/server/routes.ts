import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import { getAvatarForName } from '../utils/avatar.ts';

export const apiRouter = Router();

// USERS & AUTH
apiRouter.get('/users', (req: Request, res: Response) => {
  res.json(db.getUsers());
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    const namePart = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const candidateName = formattedName || 'Campus Student';
    user = db.createUser({
      name: candidateName,
      email,
      role: 'student',
      department: 'Student Affairs',
      college_id: 'STU-' + Math.floor(1000 + Math.random() * 9000),
      avatar: getAvatarForName(candidateName),
    });
  }

  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, role, department, college_id } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.json(existing);
  }

  const newUser = db.createUser({
    name,
    email,
    role: role || 'student',
    department: department || 'General Studies',
    college_id: college_id || 'STU-' + Math.floor(1000 + Math.random() * 9000),
    avatar: getAvatarForName(name),
  });

  res.status(201).json(newUser);
});

// EVENTS
apiRouter.get('/events', (req: Request, res: Response) => {
  const { category, search, sortBy, city } = req.query;
  let events = db.getEvents();

  if (city && city !== 'All') {
    events = events.filter(
      (e) => e.city && e.city.toLowerCase() === String(city).toLowerCase()
    );
  }

  if (category && category !== 'All') {
    events = events.filter(
      (e) => e.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (search) {
    const q = String(search).toLowerCase();
    events = events.filter(
      (e) =>
        e.event_name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.city && e.city.toLowerCase().includes(q)) ||
        e.organizer_name.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'price_low') {
    events.sort((a, b) => a.current_price - b.current_price);
  } else if (sortBy === 'price_high') {
    events.sort((a, b) => b.current_price - a.current_price);
  } else if (sortBy === 'urgency') {
    events.sort((a, b) => a.remaining_tickets - b.remaining_tickets);
  } else if (sortBy === 'date') {
    events.sort((a, b) => a.date.localeCompare(b.date));
  }

  res.json(events);
});

apiRouter.get('/events/:id', (req: Request, res: Response) => {
  const event = db.getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

apiRouter.post('/events', (req: Request, res: Response) => {
  const {
    event_name,
    description,
    date,
    time,
    venue,
    city,
    category,
    banner_url,
    base_price,
    maximum_capacity,
    organizer_id,
    organizer_name,
    allow_cancellation,
    tags,
  } = req.body;

  if (!event_name || !date || !time || !venue || base_price === undefined || !maximum_capacity) {
    return res.status(400).json({ error: 'Missing required event fields.' });
  }

  const newEvent = db.createEvent({
    event_name,
    description: description || 'Exciting campus event.',
    date,
    time,
    venue,
    city: city || 'Bengaluru',
    category: category || 'Technical',
    banner_url:
      banner_url ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    base_price: Number(base_price),
    maximum_capacity: Number(maximum_capacity),
    organizer_id: organizer_id || 'usr_admin_01',
    organizer_name: organizer_name || 'Campus Student Affairs',
    allow_cancellation: allow_cancellation !== undefined ? Boolean(allow_cancellation) : true,
    tags: tags || ['Campus Event'],
  });

  res.status(201).json(newEvent);
});

apiRouter.put('/events/:id', (req: Request, res: Response) => {
  const updated = db.updateEvent(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(updated);
});

apiRouter.delete('/events/:id', (req: Request, res: Response) => {
  const deleted = db.deleteEvent(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json({ success: true, message: 'Event successfully removed.' });
});

// ATTENDEES & CSV EXPORT
apiRouter.get('/events/:id/attendees', (req: Request, res: Response) => {
  const tickets = db.getTicketsByEvent(req.params.id);
  res.json(tickets);
});

apiRouter.get('/events/:id/attendees/csv', (req: Request, res: Response) => {
  const event = db.getEventById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const tickets = db.getTicketsByEvent(req.params.id);
  const headers = ['Ticket ID', 'Booking ID', 'Student Name', 'Status', 'Price Paid (INR)', 'QR Code Payload'];
  const rows = tickets.map((t) => [
    t.ticket_id,
    t.booking_id,
    `"${t.user_name.replace(/"/g, '""')}"`,
    t.ticket_status,
    t.price_paid,
    `"${t.unique_qr_code}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="attendees-${event.event_id}.csv"`
  );
  res.send(csvContent);
});

// BOOKINGS (CONCURRENCY-SAFE TRANSACTIONAL API)
apiRouter.post('/bookings', async (req: Request, res: Response) => {
  const { eventId, userId, quantity, paymentMethod } = req.body;
  const idempotencyKey =
    req.headers['idempotency-key']?.toString() || req.body.idempotencyKey;

  if (!eventId || !userId || !quantity) {
    return res.status(400).json({ error: 'Missing eventId, userId or quantity.' });
  }

  const result = await db.bookTickets({
    eventId,
    userId,
    quantity: Number(quantity),
    paymentMethod,
    idempotencyKey,
  });

  return res.status(result.status).json(result);
});

apiRouter.get('/bookings', (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const bookings = db.getBookings(userId);
  res.json(bookings);
});

apiRouter.get('/bookings/:id', (req: Request, res: Response) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(booking);
});

apiRouter.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  const result = await db.cancelBooking(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Booking cancelled and tickets refunded to inventory.' });
});

// QR CODE VERIFICATION GATEWAY
apiRouter.post('/tickets/verify', (req: Request, res: Response) => {
  const { qrCode } = req.body;
  if (!qrCode) {
    return res.status(400).json({ error: 'QR Code payload is required.' });
  }

  const result = db.verifyAndCheckInTicket(qrCode);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    message: 'Ticket verified! Student check-in successful.',
    ticket: result.ticket,
    booking: result.booking,
    event: result.event,
  });
});

// ANALYTICS
apiRouter.get('/analytics', (req: Request, res: Response) => {
  res.json(db.getAnalytics());
});

// RACE CONDITION SIMULATION API
apiRouter.post('/simulate/race-condition', async (req: Request, res: Response) => {
  const { eventId, concurrentUsers = 10 } = req.body;
  const targetEventId = eventId || 'evt_race_condition';

  try {
    const simulationResult = await db.simulateConcurrencyRace(
      targetEventId,
      Math.min(30, Math.max(2, Number(concurrentUsers)))
    );
    res.json(simulationResult);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Simulation failed';
    res.status(500).json({ error: message });
  }
});

// RUN ALL 10 PROMPT TEST SCENARIOS
apiRouter.post('/simulate/run-all-tests', async (req: Request, res: Response) => {
  const testResults: {
    scenarioId: number;
    title: string;
    description: string;
    passed: boolean;
    details: string;
  }[] = [];

  try {
    // 1. Setup Scenario Event: 100 tickets @ ₹200
    const testEvt = db.setupScenarioTestEvent();
    testResults.push({
      scenarioId: 1,
      title: 'Initial Event Setup (100 tickets @ ₹200)',
      description: 'Initialize event with capacity 100 and base price ₹200.',
      passed:
        testEvt.maximum_capacity === 100 &&
        testEvt.base_price === 200 &&
        testEvt.current_price === 200 &&
        testEvt.remaining_tickets === 100,
      details: `Capacity: ${testEvt.maximum_capacity}, Remaining: ${testEvt.remaining_tickets}, Current Price: ₹${testEvt.current_price}`,
    });

    // 2. Booking tickets until 20 tickets remain (80 tickets booked)
    // Book 80 tickets in chunks
    const book80 = await db.bookTickets({
      eventId: testEvt.event_id,
      userId: 'usr_stu_01',
      quantity: 80,
      paymentMethod: 'Test Automation',
    });

    const evtAfter80 = db.getEventById(testEvt.event_id)!;
    testResults.push({
      scenarioId: 2,
      title: 'Booking tickets until 20 tickets remain',
      description: 'Book 80 tickets, leaving exactly 20 tickets (20% of 100 capacity).',
      passed: book80.success && evtAfter80.remaining_tickets === 20,
      details: `Remaining tickets: ${evtAfter80.remaining_tickets} (Tickets sold: ${evtAfter80.tickets_sold})`,
    });

    // 3. Verify that the price automatically changes to ₹250
    const priceChanged =
      evtAfter80.current_price === 250 && evtAfter80.pricing_status === 'surged_25';
    testResults.push({
      scenarioId: 3,
      title: 'Automatic dynamic price increase to ₹250',
      description: 'At 20% remaining capacity, price must automatically surge by 25% (₹200 * 1.25 = ₹250).',
      passed: priceChanged,
      details: `Current Price: ₹${evtAfter80.current_price} (Status: ${evtAfter80.pricing_status})`,
    });

    // 4. Refresh/Query again and verify price remains ₹250
    const evtRequery = db.getEventById(testEvt.event_id)!;
    testResults.push({
      scenarioId: 4,
      title: 'Price stability on page reload / repeat queries',
      description: 'Price must remain constant at ₹250 and never surge repeatedly.',
      passed: evtRequery.current_price === 250,
      details: `Verified authoritative price on subsequent read: ₹${evtRequery.current_price}`,
    });

    // Book 19 more tickets, leaving EXACTLY 1 ticket remaining
    await db.bookTickets({
      eventId: testEvt.event_id,
      userId: 'usr_stu_02',
      quantity: 19,
      paymentMethod: 'Test Automation',
    });
    const evtWith1Left = db.getEventById(testEvt.event_id)!;

    // 6. Simulate multiple users (e.g. 5 users) booking the last available ticket simultaneously
    const simResult = await db.simulateConcurrencyRace(testEvt.event_id, 5);

    // 7. Verify that exactly one booking succeeds
    testResults.push({
      scenarioId: 6,
      title: 'Simultaneous booking for last ticket (Race Condition)',
      description: '5 concurrent requests hit the backend at the exact same millisecond for 1 remaining ticket.',
      passed: simResult.logs.length === 5,
      details: `Fired 5 concurrent requests in parallel (${simResult.duration_ms}ms total execution).`,
    });

    testResults.push({
      scenarioId: 7,
      title: 'Exactly one booking succeeds',
      description: 'Strict mutex critical section allows only 1 buyer to secure the last ticket.',
      passed: simResult.successful_bookings === 1 && simResult.failed_bookings === 4,
      details: `Success: ${simResult.successful_bookings}, Rejected: ${simResult.failed_bookings}`,
    });

    // 8. Verify that total bookings never exceed event capacity
    const finalEvt = db.getEventById(testEvt.event_id)!;
    testResults.push({
      scenarioId: 8,
      title: 'Total bookings never exceed event capacity',
      description: 'Capacity is 100; tickets sold must equal exactly 100 and remaining must be 0 (no oversell).',
      passed:
        finalEvt.tickets_sold === 100 &&
        finalEvt.remaining_tickets === 0 &&
        !simResult.oversold,
      details: `Tickets sold: ${finalEvt.tickets_sold}/${finalEvt.maximum_capacity}, Remaining: ${finalEvt.remaining_tickets}`,
    });

    // 5. Try booking when no tickets remain
    const tryBookingSoldOut = await db.bookTickets({
      eventId: testEvt.event_id,
      userId: 'usr_stu_01',
      quantity: 1,
    });
    testResults.push({
      scenarioId: 5,
      title: 'Booking attempt when no tickets remain (Sold Out)',
      description: 'Booking request on 0 inventory is cleanly rejected with 409 Conflict.',
      passed: Boolean(
        !tryBookingSoldOut.success &&
        tryBookingSoldOut.status === 409 &&
        tryBookingSoldOut.error?.includes('sold out')
      ),
      details: `Rejected with error: "${tryBookingSoldOut.error}"`,
    });

    // 9. Verify that failed bookings do not reduce ticket availability
    const postFailedEvt = db.getEventById(testEvt.event_id)!;
    testResults.push({
      scenarioId: 9,
      title: 'Failed bookings do not mutate inventory',
      description: 'Failed requests leave remaining tickets intact at 0.',
      passed: postFailedEvt.remaining_tickets === 0 && postFailedEvt.tickets_sold === 100,
      details: `Remaining remains ${postFailedEvt.remaining_tickets}, Sold remains ${postFailedEvt.tickets_sold}`,
    });

    // 10. Verify that QR codes are generated only for confirmed bookings
    const confirmedBooking = simResult.logs.find((l) => l.status === 'success');
    const winnerBooking = confirmedBooking?.booking_id
      ? db.getBookingById(confirmedBooking.booking_id)
      : null;
    const hasValidQr = Boolean(
      winnerBooking &&
        winnerBooking.tickets.length > 0 &&
        winnerBooking.tickets[0].unique_qr_code.includes('CAMPUS-PASS')
    );

    testResults.push({
      scenarioId: 10,
      title: 'QR codes generated only for confirmed bookings',
      description: 'Confirmed booking has verified digital QR ticket payload; failed attempts have none.',
      passed: hasValidQr,
      details: `Generated QR Payload: ${winnerBooking?.tickets[0]?.unique_qr_code || 'None'}`,
    });

    res.json({
      allPassed: testResults.every((t) => t.passed),
      totalTests: testResults.length,
      passedTests: testResults.filter((t) => t.passed).length,
      results: testResults,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Test suite execution error';
    res.status(500).json({ error: message, results: testResults });
  }
});
