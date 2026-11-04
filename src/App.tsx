/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CampusEvent, Booking, Ticket } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { EventDiscovery } from './components/EventDiscovery.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { ConcurrencyTestLab } from './components/ConcurrencyTestLab.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { CreateEventModal } from './components/CreateEventModal.tsx';
import { TicketScannerModal } from './components/TicketScannerModal.tsx';
import { DigitalTicketModal } from './components/DigitalTicketModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { Zap, ShieldCheck } from 'lucide-react';

function MainAppContent() {
  const {
    currentUser,
    isLoggedIn,
    isOrganizer,
    isLoginModalOpen,
    setIsLoginModalOpen,
  } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'discovery' | 'student' | 'admin' | 'testlab'>('discovery');

  // Modals state
  const [bookingEvent, setBookingEvent] = useState<CampusEvent | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [activeTicketView, setActiveTicketView] = useState<{
    ticket: Ticket;
    booking?: Booking;
  } | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBookEventClick = (evt: CampusEvent) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setBookingEvent(evt);
  };

  const handleBookingSuccess = (booking: Booking) => {
    fetchEvents();
  };

  const handleEventSaved = (event: CampusEvent) => {
    fetchEvents();
  };

  const surgingEventsCount = events.filter(
    (e) => e.pricing_status === 'surged_25'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setScannerOpen(true)}
        surgingCount={surgingEventsCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'discovery' && (
          <EventDiscovery
            events={events}
            onBookEvent={handleBookEventClick}
            onOpenTestLab={() => setActiveTab('testlab')}
          />
        )}

        {activeTab === 'student' && (
          <StudentDashboard
            onDiscoverEvents={() => setActiveTab('discovery')}
            onRefreshData={fetchEvents}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            events={events}
            onOpenCreateModal={() => {
              setEditingEvent(null);
              setCreateModalOpen(true);
            }}
            onEditEvent={(evt) => {
              setEditingEvent(evt);
              setCreateModalOpen(true);
            }}
            onRefreshData={fetchEvents}
            onOpenScanner={() => setScannerOpen(true)}
          />
        )}

        {activeTab === 'testlab' && (
          <ConcurrencyTestLab
            events={events}
            onRefreshEvents={fetchEvents}
          />
        )}
      </main>

      {/* Global Modals */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          onClose={() => setBookingEvent(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {createModalOpen && (
        <CreateEventModal
          onClose={() => {
            setCreateModalOpen(false);
            setEditingEvent(null);
          }}
          onEventCreated={handleEventSaved}
          initialEvent={editingEvent}
        />
      )}

      {scannerOpen && (
        <TicketScannerModal
          onClose={() => setScannerOpen(false)}
        />
      )}

      {activeTicketView && (
        <DigitalTicketModal
          ticket={activeTicketView.ticket}
          booking={activeTicketView.booking}
          onClose={() => setActiveTicketView(null)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Smart Campus Ticketing India</span>
            <span>• Concurrency-Safe Dynamic Pricing Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Dynamic 20% Surge Rule
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Mutex Concurrency Locked
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
