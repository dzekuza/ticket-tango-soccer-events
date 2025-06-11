
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
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
  eventTitle: string;
  price: number;
  isUsed: boolean;
  validatedAt?: Date;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
