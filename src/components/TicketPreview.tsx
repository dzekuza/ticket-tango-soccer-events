
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ticket } from './Dashboard';
import { TicketTemplate } from './TicketTemplate';
import { TicketPDFGenerator } from './TicketPDFGenerator';

interface TicketPreviewProps {
  ticket: Ticket;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ ticket }) => {
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const currentTicket = ticket.tickets[currentTicketIndex];

  const nextTicket = () => {
    setCurrentTicketIndex((prev) => 
      prev < ticket.tickets.length - 1 ? prev + 1 : 0
    );
  };

  const prevTicket = () => {
    setCurrentTicketIndex((prev) => 
      prev > 0 ? prev - 1 : ticket.tickets.length - 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>Preview Tickets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ticket Preview - {ticket.eventTitle}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentTicketIndex + 1} of {ticket.tickets.length}
              </span>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTicket}
                  disabled={ticket.tickets.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTicket}
                  disabled={ticket.tickets.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ticket Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <TicketTemplate
              ticket={currentTicket}
              eventTitle={ticket.eventTitle}
              eventDescription={ticket.description}
              eventDate={new Date(ticket.createdAt).toLocaleDateString()}
            />
          </div>

          {/* Download Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <TicketPDFGenerator 
              ticket={ticket} 
              tickets={[currentTicket]} 
              variant="single"
            />
            <TicketPDFGenerator 
              ticket={ticket} 
              variant="all"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
