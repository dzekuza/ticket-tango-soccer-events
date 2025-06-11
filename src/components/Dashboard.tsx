import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { ResponsiveHeader } from './ResponsiveHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { TicketCreation } from './TicketCreation';
import { TicketList } from './TicketList';
import { TicketScanner } from './TicketScanner';
import { DashboardOverview } from './DashboardOverview';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';

// Keep legacy interfaces for compatibility
export interface Ticket {
  id: string;
  eventTitle: string;
  description: string;
  price: number;
  quantity: number;
  createdAt: Date;
  tickets: IndividualTicket[];
}

export interface IndividualTicket {
  id: string;
  qrCode: string;
  qrCodeImage?: string;
  eventTitle: string;
  price: number;
  isUsed: boolean;
  validatedAt?: Date;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();
  const { tickets: supabaseTickets, loading, createTicketBatch, validateTicket } = useSupabaseTickets();

  // Convert Supabase tickets to legacy format for existing components
  const tickets: Ticket[] = supabaseTickets.map(ticket => ({
    id: ticket.id,
    eventTitle: ticket.event_title,
    description: ticket.description || '',
    price: ticket.price,
    quantity: ticket.quantity,
    createdAt: new Date(ticket.created_at),
    tickets: ticket.individual_tickets.map(individualTicket => ({
      id: individualTicket.id,
      qrCode: individualTicket.qr_code,
      qrCodeImage: individualTicket.qr_code_image,
      eventTitle: ticket.event_title,
      price: ticket.price,
      isUsed: individualTicket.is_used,
      validatedAt: individualTicket.validated_at ? new Date(individualTicket.validated_at) : undefined,
    }))
  }));

  const addTicketBatch = async (newTicket: Ticket) => {
    await createTicketBatch(
      newTicket.eventTitle,
      newTicket.description,
      newTicket.price,
      newTicket.quantity,
      newTicket.tickets
    );
  };

  const handleValidateTicket = async (ticketId: string) => {
    await validateTicket(ticketId);
  };

  const renderActiveComponent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview tickets={tickets} />;
      case 'create':
        return <TicketCreation onTicketCreated={addTicketBatch} />;
      case 'manage':
        return <TicketList tickets={tickets} />;
      case 'scanner':
        return <TicketScanner tickets={tickets} onValidate={handleValidateTicket} />;
      default:
        return <DashboardOverview tickets={tickets} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && (
          <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        <div className="flex-1 flex flex-col">
          <ResponsiveHeader />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto">
              {renderActiveComponent()}
            </div>
          </main>
        </div>
        {isMobile && (
          <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
