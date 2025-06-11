
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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl pr-8 break-words">{matchTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Event Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {eventDateTime && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-sm sm:text-base">{eventDateTime.date}</p>
                    {eventDateTime.timeRange && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{eventDateTime.timeRange}</p>
                    )}
                  </div>
                )}
                {supabaseTicket?.stadium_name && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium text-sm sm:text-base flex items-center">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="break-words">{supabaseTicket.stadium_name}</span>
                    </p>
                  </div>
                )}
                {supabaseTicket?.competition && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Competition</p>
                    <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs sm:text-sm">
                      {supabaseTicket.competition}
                    </Badge>
                  </div>
                )}
                {ticket.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Description</p>
                    <p className="font-medium text-sm sm:text-base break-words">{ticket.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          {supabaseTicket?.ticket_tiers && supabaseTicket.ticket_tiers.length > 0 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Pricing Tiers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {supabaseTicket.ticket_tiers.map((tier: any) => (
                    <div key={tier.id} className="p-3 sm:p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm sm:text-base lg:text-lg break-words">{tier.tier_name}</h4>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        ${tier.tier_price.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {tier.tier_quantity} tickets
                      </p>
                      {tier.tier_description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 break-words">
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
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Tickets</p>
                  <p className="text-lg sm:text-xl font-bold">{ticket.quantity}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground">Validated</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{validatedCount}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">{ticket.quantity - validatedCount}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Tickets */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Individual Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="px-4 sm:px-6">
                  <IndividualTicketTable tickets={ticket.tickets} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
