
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
      <DialogContent className="max-w-[96vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[96vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg lg:text-xl xl:text-2xl pr-6 sm:pr-8 break-words leading-tight">
            {matchTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Event Information */}
          <Card className="border-muted">
            <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base lg:text-lg">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Event Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 lg:space-y-4 pt-0 px-3 sm:px-6">
              <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                {eventDateTime && (
                  <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium text-sm sm:text-base">{eventDateTime.date}</p>
                    {eventDateTime.timeRange && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{eventDateTime.timeRange}</p>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {supabaseTicket?.stadium_name && (
                    <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Venue</p>
                      <p className="font-medium text-sm sm:text-base flex items-center">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="break-words">{supabaseTicket.stadium_name}</span>
                      </p>
                    </div>
                  )}
                  
                  {supabaseTicket?.competition && (
                    <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Competition</p>
                      <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs sm:text-sm">
                        {supabaseTicket.competition}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {ticket.description && (
                  <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="font-medium text-sm sm:text-base break-words leading-relaxed">{ticket.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          {supabaseTicket?.ticket_tiers && supabaseTicket.ticket_tiers.length > 0 && (
            <Card className="border-muted">
              <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-6">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base lg:text-lg">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span>Pricing Tiers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                  {supabaseTicket.ticket_tiers.map((tier: any) => (
                    <div key={tier.id} className="p-3 sm:p-4 bg-muted/50 rounded-lg border">
                      <h4 className="font-medium text-sm sm:text-base lg:text-lg break-words mb-1">
                        {tier.tier_name}
                      </h4>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-1">
                        ${tier.tier_price.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {tier.tier_quantity} tickets available
                      </p>
                      {tier.tier_description && (
                        <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
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
          <Card className="border-muted">
            <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-6">
              <CardTitle className="text-sm sm:text-base lg:text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Tickets</p>
                  <p className="text-lg sm:text-xl font-bold">{ticket.quantity}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Validated</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{validatedCount}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">{ticket.quantity - validatedCount}</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Tickets */}
          <Card className="border-muted">
            <CardHeader className="pb-2 sm:pb-3 lg:pb-4 px-3 sm:px-6">
              <CardTitle className="flex items-center space-x-2 text-sm sm:text-base lg:text-lg">
                <QrCode className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span>Individual Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 sm:px-6">
              <IndividualTicketTable tickets={ticket.tickets} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
