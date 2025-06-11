
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const isMobile = useIsMobile();

  const addTicketBatch = (newTicket: Ticket) => {
    setTickets(prev => [...prev, newTicket]);
  };

  const validateTicket = (ticketId: string) => {
    setTickets(prev => prev.map(batch => ({
      ...batch,
      tickets: batch.tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, isUsed: true, validatedAt: new Date() }
          : ticket
      )
    })));
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview tickets={tickets} />;
      case 'create':
        return <TicketCreation onTicketCreated={addTicketBatch} />;
      case 'manage':
        return <TicketList tickets={tickets} />;
      case 'scanner':
        return <TicketScanner tickets={tickets} onValidate={validateTicket} />;
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
