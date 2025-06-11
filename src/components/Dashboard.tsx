
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TicketCreation } from './TicketCreation';
import { TicketList } from './TicketList';
import { DashboardOverview } from './DashboardOverview';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';

export interface IndividualTicket {
  id: string;
  qrCode: string;
  qrCodeImage?: string;
  eventTitle: string;
  price: number;
  isUsed: boolean;
  validatedAt?: Date;
  // New soccer-specific fields
  tierId?: string;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
}

export interface Ticket {
  id: string;
  eventTitle: string;
  description: string;
  price: number;
  quantity: number;
  createdAt: Date;
  tickets: IndividualTicket[];
  // New soccer-specific fields
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  homeTeam?: string;
  awayTeam?: string;
  stadiumName?: string;
  competition?: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage'>('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { user } = useAuth();
  const { tickets: supabaseTickets, loading } = useSupabaseTickets();

  useEffect(() => {
    if (supabaseTickets) {
      const mappedTickets: Ticket[] = supabaseTickets.map(ticket => ({
        id: ticket.id,
        eventTitle: ticket.event_title,
        description: ticket.description || '',
        price: ticket.price,
        quantity: ticket.quantity,
        createdAt: new Date(ticket.created_at),
        eventDate: ticket.event_date || undefined,
        eventStartTime: ticket.event_start_time || undefined,
        eventEndTime: ticket.event_end_time || undefined,
        homeTeam: ticket.home_team || undefined,
        awayTeam: ticket.away_team || undefined,
        stadiumName: ticket.stadium_name || undefined,
        competition: ticket.competition || undefined,
        tickets: ticket.individual_tickets.map(it => ({
          id: it.id,
          qrCode: it.qr_code,
          qrCodeImage: it.qr_code_image || undefined,
          eventTitle: ticket.event_title,
          price: ticket.price,
          isUsed: it.is_used,
          validatedAt: it.validated_at ? new Date(it.validated_at) : undefined,
          tierId: it.tier_id || undefined,
          seatSection: it.seat_section || undefined,
          seatRow: it.seat_row || undefined,
          seatNumber: it.seat_number || undefined,
        }))
      }));
      setTickets(mappedTickets);
    }
  }, [supabaseTickets]);

  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create Tickets
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manage Tickets
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && <DashboardOverview tickets={tickets} />}
      {activeTab === 'create' && <TicketCreation onTicketCreated={handleTicketCreated} />}
      {activeTab === 'manage' && <TicketList tickets={tickets} />}
    </div>
  );
};

export default Dashboard;
