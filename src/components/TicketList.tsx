
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Calendar, FileText, MapPin, Clock, Users } from 'lucide-react';
import { Ticket } from './Dashboard';
import { useToast } from '@/hooks/use-toast';
import { TicketPreview } from './TicketPreview';
import { TicketPDFGenerator } from './TicketPDFGenerator';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';

interface TicketListProps {
  tickets: Ticket[];
}

export const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  const { toast } = useToast();
  const { tickets: supabaseTickets } = useSupabaseTickets();

  const handleExportTickets = (ticket: Ticket) => {
    // Create a simple CSV export for WordPress upload
    const csvContent = ticket.tickets.map(t => 
      `"${t.id}","${t.eventTitle}","${t.price}","${t.qrCode}","${t.isUsed}"`
    ).join('\n');
    
    const header = '"Ticket ID","Event Title","Price","QR Code","Used"\n';
    const fullCsv = header + csvContent;
    
    const blob = new Blob([fullCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_tickets.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${ticket.tickets.length} tickets for ${ticket.eventTitle}`,
    });
  };

  const getValidatedCount = (ticket: Ticket) => {
    return ticket.tickets.filter(t => t.isUsed).length;
  };

  const getSupabaseTicket = (ticketId: string) => {
    return supabaseTickets.find(t => t.id === ticketId);
  };

  const formatMatchTitle = (supabaseTicket: any) => {
    if (supabaseTicket?.home_team && supabaseTicket?.away_team) {
      return `${supabaseTicket.home_team} vs ${supabaseTicket.away_team}`;
    }
    return supabaseTicket?.event_title || 'Event';
  };

  const formatEventDateTime = (supabaseTicket: any) => {
    if (!supabaseTicket?.event_date) return null;
    
    const date = new Date(supabaseTicket.event_date).toLocaleDateString();
    const timeRange = supabaseTicket.event_start_time && supabaseTicket.event_end_time 
      ? `${supabaseTicket.event_start_time} - ${supabaseTicket.event_end_time}`
      : null;
    
    return { date, timeRange };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Tickets</h1>
        <p className="text-gray-600 mt-1">View, preview, and export your created tickets</p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets created yet</h3>
            <p className="text-gray-500">Create your first event tickets to see them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => {
            const supabaseTicket = getSupabaseTicket(ticket.id);
            const hasPDF = !!supabaseTicket?.pdf_url;
            const eventDateTime = formatEventDateTime(supabaseTicket);
            const matchTitle = formatMatchTitle(supabaseTicket);
            
            return (
              <Card key={ticket.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{matchTitle}</CardTitle>
                      {supabaseTicket?.competition && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {supabaseTicket.competition}
                        </Badge>
                      )}
                      {ticket.description && (
                        <p className="text-gray-600 mt-1">{ticket.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {ticket.quantity} tickets
                      </Badge>
                      {hasPDF && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <FileText className="w-3 h-3 mr-1" />
                          PDF Ready
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Event Details */}
                  {(eventDateTime || supabaseTicket?.stadium_name) && (
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                      {eventDateTime && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{eventDateTime.date}</span>
                          {eventDateTime.timeRange && (
                            <>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>{eventDateTime.timeRange}</span>
                            </>
                          )}
                        </div>
                      )}
                      {supabaseTicket?.stadium_name && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{supabaseTicket.stadium_name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Ticket Tiers Information */}
                  {supabaseTicket?.ticket_tiers && supabaseTicket.ticket_tiers.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Pricing Tiers
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {supabaseTicket.ticket_tiers.map((tier: any, index: number) => (
                          <div key={tier.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-sm">{tier.tier_name}</div>
                            <div className="text-lg font-bold text-green-600">
                              ${tier.tier_price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {tier.tier_quantity} tickets
                            </div>
                            {tier.tier_description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {tier.tier_description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Price</p>
                      <p className="text-lg font-bold text-gray-900">${ticket.price.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${(ticket.price * ticket.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Validated</p>
                      <p className="text-lg font-bold text-gray-900">
                        {getValidatedCount(ticket)} / {ticket.quantity}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-lg font-bold text-gray-900">
                        {ticket.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <TicketPreview ticket={ticket} />
                    
                    {hasPDF ? (
                      <>
                        <TicketPDFGenerator 
                          ticket={ticket} 
                          supabaseTicket={supabaseTicket}
                          variant="download"
                        />
                        <TicketPDFGenerator 
                          ticket={ticket} 
                          variant="regenerate"
                        />
                      </>
                    ) : (
                      <TicketPDFGenerator ticket={ticket} />
                    )}
                    
                    <Button 
                      onClick={() => handleExportTickets(ticket)}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>View Details</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
