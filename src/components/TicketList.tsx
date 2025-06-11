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
import { TicketDetailsDialog } from './TicketDetailsDialog';
import { DeleteTicketDialog } from './DeleteTicketDialog';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { saveAs } from 'file-saver';
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
}

export interface IndividualTicket {
  id: string;
  qrCode: string;
  qrCodeImage?: string; // Add this field
  isUsed: boolean;
  validatedAt?: string;
  price: number;
  tierName?: string;
  ticketNumber?: number;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
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
      }))
    }));
  };

  const displayTickets = React.useMemo(() => convertToDisplayTickets(tickets), [tickets]);

  const handleTicketDeleted = () => {
    refetch();
  };

  const handleDownloadPDF = async (ticket: Ticket) => {
    try {
      const pdfBlob = await generatePDF(ticket);
      saveAs(pdfBlob, `${ticket.eventTitle.replace(/\s+/g, '_').toLowerCase()}_tickets.pdf`);
    } catch (error) {
      console.error('Error generating or downloading PDF:', error);
    }
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
              <CardContent className="grid grid-cols-2 gap-4">
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
                  <p className="text-sm font-medium text-gray-600">PDF</p>
                  {ticket.pdfUrl ? (
                    <a href={ticket.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View PDF
                    </a>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(ticket)} className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </Button>
                  )}
                </div>
              </CardContent>
              <div className="flex justify-end space-x-2 p-4">
                <TicketDetailsDialog ticket={ticket}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TicketDetailsDialog>
                <DeleteTicketDialog ticket={ticket} onTicketDeleted={handleTicketDeleted} />
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
