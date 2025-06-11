
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardOverview } from './DashboardOverview';
import { TicketList } from './TicketList';
import { TicketCreation } from './TicketCreation';
import { TicketScanner } from './TicketScanner';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';
import { LayoutDashboard, Ticket, Plus, QrCode } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from './MobileBottomNav';

export interface Ticket {
  id: string;
  eventTitle: string;
  description: string;
  price: number;
  quantity: number;
  pdfUrl?: string;
  createdAt: string;
  tickets: IndividualTicket[];
  // Enhanced event properties
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  homeTeam?: string;
  awayTeam?: string;
  stadiumName?: string;
  competition?: string;
}

export interface IndividualTicket {
  id: string;
  qrCode: string;
  qrCodeImage?: string;
  isUsed: boolean;
  validatedAt?: string;
  price: number;
  tierName?: string;
  ticketNumber?: number;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
  eventTitle?: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { tickets, loading, validateTicket, refetch } = useSupabaseTickets();
  const isMobile = useIsMobile();

  // Convert Supabase tickets to display format
  const convertToDisplayTickets = (): Ticket[] => {
    return tickets.map(ticket => ({
      id: ticket.id,
      eventTitle: ticket.event_title,
      description: ticket.description || '',
      price: ticket.price,
      quantity: ticket.quantity,
      pdfUrl: ticket.pdf_url,
      createdAt: ticket.created_at,
      eventDate: ticket.event_date,
      eventStartTime: ticket.event_start_time,
      eventEndTime: ticket.event_end_time,
      homeTeam: ticket.home_team,
      awayTeam: ticket.away_team,
      stadiumName: ticket.stadium_name,
      competition: ticket.competition,
      tickets: ticket.individual_tickets.map(individualTicket => ({
        id: individualTicket.id,
        qrCode: individualTicket.qr_code,
        qrCodeImage: individualTicket.qr_code_image,
        isUsed: individualTicket.is_used,
        validatedAt: individualTicket.validated_at,
        price: individualTicket.tier_price || ticket.price,
        tierName: individualTicket.tier_name,
        ticketNumber: individualTicket.ticket_number,
        seatSection: individualTicket.seat_section,
        seatRow: individualTicket.seat_row,
        seatNumber: individualTicket.seat_number,
        eventTitle: ticket.event_title,
      }))
    }));
  };

  const displayTickets = convertToDisplayTickets();

  const handleTicketCreated = (newTicket: Ticket) => {
    refetch();
  };

  const handleNavigateToTickets = () => {
    setActiveTab('tickets');
  };

  // Map mobile nav IDs to tab IDs
  const mapMobileNavToTab = (navId: string) => {
    switch (navId) {
      case 'manage':
        return 'tickets';
      default:
        return navId;
    }
  };

  const handleMobileNavChange = (navId: string) => {
    const tabId = mapMobileNavToTab(navId);
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Soccer Ticket Manager
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your soccer event tickets, create new events, and validate tickets
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tab Navigation */}
          <TabsList className={`grid w-full grid-cols-4 mb-4 sm:mb-6 ${isMobile ? 'h-12' : 'h-10'}`}>
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Tickets</span>
              <span className="sm:hidden">Manage</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
              <span className="sm:hidden">New</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
              <span className="sm:hidden">Scan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <DashboardOverview tickets={displayTickets} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Event Tickets</h2>
                  <p className="text-sm sm:text-base text-gray-600">View and manage your created ticket batches</p>
                </div>
                <TicketList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <TicketCreation
                  onTicketCreated={handleTicketCreated}
                  onNavigateToTickets={handleNavigateToTickets}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <TicketScanner
                  tickets={displayTickets}
                  onValidate={validateTicket}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav 
          activeTab={activeTab === 'tickets' ? 'manage' : activeTab} 
          setActiveTab={handleMobileNavChange} 
        />
      )}
    </div>
  );
};

export default Dashboard;
