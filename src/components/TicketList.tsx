
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { TicketDetailsDialog } from './TicketDetailsDialog';
import { DeleteTicketDialog } from './DeleteTicketDialog';
import { TicketPDFActions } from './TicketPDFActions';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';
import { Badge } from '@/components/ui/badge';
import { SupabaseTicket } from '@/hooks/useTicketData';

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

export const TicketList: React.FC = () => {
  const { tickets, loading, refetch } = useSupabaseTickets();

  const convertToDisplayTickets = (supabaseTickets: SupabaseTicket[]): Ticket[] => {
    return supabaseTickets.map(ticket => ({
      id: ticket.id,
      eventTitle: ticket.event_title,
      description: ticket.description || '',
      price: ticket.price,
      quantity: ticket.quantity,
      pdfUrl: ticket.pdf_url,
      createdAt: ticket.created_at,
      // Enhanced properties
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

  const displayTickets = React.useMemo(() => convertToDisplayTickets(tickets), [tickets]);

  const handleTicketDeleted = () => {
    refetch();
  };

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {displayTickets.map((ticket) => (
        <AccordionItem value={ticket.id} key={ticket.id}>
          <AccordionTrigger>
            <div className="flex justify-between w-full">
              <span>{ticket.eventTitle}</span>
              <Badge variant="secondary">{ticket.quantity} Tickets</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle>{ticket.eventTitle}</CardTitle>
                <CardDescription>{ticket.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Price</p>
                  <p>${ticket.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantity</p>
                  <p>{ticket.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                  <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">PDF Status</p>
                  {ticket.pdfUrl ? (
                    <span className="text-green-600 font-medium">Available</span>
                  ) : (
                    <span className="text-amber-600 font-medium">Missing - Click Generate</span>
                  )}
                </div>
              </CardContent>
              <div className="p-4 space-y-4">
                <TicketPDFActions 
                  ticket={tickets.find(t => t.id === ticket.id)!} 
                  refetchTickets={refetch} 
                />
                <div className="flex justify-end space-x-2">
                  <TicketDetailsDialog ticket={ticket}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TicketDetailsDialog>
                  <DeleteTicketDialog ticket={ticket} onTicketDeleted={handleTicketDeleted} />
                </div>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
