
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, QrCode, Download } from 'lucide-react';
import { Ticket } from './Dashboard';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';
import { IndividualTicketTable } from './IndividualTicketTable';

interface TicketDetailsDialogProps {
  ticket: Ticket;
  children: React.ReactNode;
}

export const TicketDetailsDialog: React.FC<TicketDetailsDialogProps> = ({ ticket, children }) => {
  const { tickets: supabaseTickets } = useSupabaseTickets();
  
  const supabaseTicket = supabaseTickets.find(t => t.id === ticket.id);
  const eventDateTime = supabaseTicket?.event_date ? {
    date: new Date(supabaseTicket.event_date).toLocaleDateString(),
    timeRange: supabaseTicket.event_start_time && supabaseTicket.event_end_time 
      ? `${supabaseTicket.event_start_time} - ${supabaseTicket.event_end_time}`
      : null
  } : null;

  const matchTitle = supabaseTicket?.home_team && supabaseTicket?.away_team
    ? `${supabaseTicket.home_team} vs ${supabaseTicket.away_team}`
    : supabaseTicket?.event_title || ticket.eventTitle;

  const validatedCount = ticket.tickets.filter(t => t.isUsed).length;
  const totalRevenue = ticket.price * ticket.quantity;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{matchTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Event Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventDateTime && (
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">{eventDateTime.date}</p>
                    {eventDateTime.timeRange && (
                      <p className="text-sm text-gray-500">{eventDateTime.timeRange}</p>
                    )}
                  </div>
                )}
                {supabaseTicket?.stadium_name && (
                  <div>
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {supabaseTicket.stadium_name}
                    </p>
                  </div>
                )}
                {supabaseTicket?.competition && (
                  <div>
                    <p className="text-sm text-gray-600">Competition</p>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      {supabaseTicket.competition}
                    </Badge>
                  </div>
                )}
                {ticket.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium">{ticket.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          {supabaseTicket?.ticket_tiers && supabaseTicket.ticket_tiers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Pricing Tiers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supabaseTicket.ticket_tiers.map((tier: any) => (
                    <div key={tier.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-lg">{tier.tier_name}</h4>
                      <p className="text-2xl font-bold text-green-600">
                        ${tier.tier_price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tier.tier_quantity} tickets
                      </p>
                      {tier.tier_description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {tier.tier_description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-xl font-bold">{ticket.quantity}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Validated</p>
                  <p className="text-xl font-bold text-green-600">{validatedCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-xl font-bold text-blue-600">{ticket.quantity - validatedCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Individual Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IndividualTicketTable tickets={ticket.tickets} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
