
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
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading tickets...</div>
      </div>
    );
  }

  if (displayTickets.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">No tickets found</div>
        <p className="text-sm text-muted-foreground">Create your first ticket to get started</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {displayTickets.map((ticket) => (
        <AccordionItem value={ticket.id} key={ticket.id} className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex justify-between items-center w-full pr-4">
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base break-words">{ticket.eventTitle}</div>
                {ticket.homeTeam && ticket.awayTeam && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {ticket.homeTeam} vs {ticket.awayTeam}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs">
                  {ticket.quantity} Tickets
                </Badge>
                {ticket.pdfUrl && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    PDF Ready
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">{ticket.eventTitle}</CardTitle>
                {ticket.description && (
                  <CardDescription className="text-sm">{ticket.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Price</p>
                    <p className="text-sm font-semibold">${ticket.price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Quantity</p>
                    <p className="text-sm font-semibold">{ticket.quantity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">PDF Status</p>
                    {ticket.pdfUrl ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                        Generate PDF
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Event Information */}
                {(ticket.eventDate || ticket.stadiumName || ticket.competition) && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {ticket.eventDate && (
                        <div>
                          <span className="text-muted-foreground">Date: </span>
                          <span className="font-medium">
                            {new Date(ticket.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {ticket.stadiumName && (
                        <div>
                          <span className="text-muted-foreground">Venue: </span>
                          <span className="font-medium">{ticket.stadiumName}</span>
                        </div>
                      )}
                      {ticket.competition && (
                        <div>
                          <span className="text-muted-foreground">Competition: </span>
                          <span className="font-medium">{ticket.competition}</span>
                        </div>
                      )}
                    </div>
                    {ticket.eventStartTime && ticket.eventEndTime && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Time: </span>
                        <span className="font-medium">
                          {ticket.eventStartTime} - {ticket.eventEndTime}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-3">
                  <TicketPDFActions 
                    ticket={tickets.find(t => t.id === ticket.id)!} 
                    refetchTickets={refetch} 
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                  <TicketDetailsDialog ticket={ticket}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </TicketDetailsDialog>
                  <DeleteTicketDialog ticket={ticket} onTicketDeleted={handleTicketDeleted} />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
