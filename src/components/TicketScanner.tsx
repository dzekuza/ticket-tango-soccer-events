
import React, { useState } from 'react';
import { Ticket, IndividualTicket } from './Dashboard';
import { ValidationStats } from './ValidationStats';
import { ScannerInterface } from './ScannerInterface';
import { ScanResult } from './ScanResult';
import { useToast } from '@/hooks/use-toast';

interface TicketScannerProps {
  tickets: Ticket[];
  onValidate: (ticketId: string) => void;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({ tickets, onValidate }) => {
  const [lastScannedTicket, setLastScannedTicket] = useState<IndividualTicket | null>(null);
  const { toast } = useToast();

  const findTicketByQRCode = (qrCode: string): IndividualTicket | null => {
    try {
      // Try to parse as JSON first (new format)
      const qrData = JSON.parse(qrCode);
      for (const batch of tickets) {
        const ticket = batch.tickets.find(t => t.id === qrData.ticketId);
        if (ticket) return ticket;
      }
    } catch {
      // Fallback to old format - direct search
      for (const batch of tickets) {
        const ticket = batch.tickets.find(t => t.qrCode === qrCode || t.id === qrCode);
        if (ticket) return ticket;
      }
    }
    return null;
  };

  const validateTicket = (qrCodeData: string) => {
    const ticket = findTicketByQRCode(qrCodeData);
    
    if (!ticket) {
      toast({
        title: "Invalid Ticket",
        description: "Ticket not found in the system",
        variant: "destructive",
      });
      setLastScannedTicket(null);
      return;
    }

    if (ticket.isUsed) {
      toast({
        title: "Already Used",
        description: `This ticket was already validated on ${ticket.validatedAt?.toLocaleString()}`,
        variant: "destructive",
      });
      setLastScannedTicket(ticket);
      return;
    }

    // Validate the ticket
    onValidate(ticket.id);
    setLastScannedTicket({ ...ticket, isUsed: true, validatedAt: new Date() });
    
    toast({
      title: "Ticket Validated",
      description: `Valid ticket for ${ticket.eventTitle}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Scanner</h1>
        <p className="text-gray-600 mt-1">Scan and validate tickets at the event</p>
      </div>

      <ValidationStats tickets={tickets} />

      <div className="max-w-2xl mx-auto">
        <ScannerInterface onScan={validateTicket} />

        {lastScannedTicket && (
          <div className="mt-6">
            <ScanResult ticket={lastScannedTicket} />
          </div>
        )}
      </div>
    </div>
  );
};
