
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, Calendar } from 'lucide-react';
import { Ticket } from './Dashboard';
import { useToast } from '@/hooks/use-toast';

interface TicketListProps {
  tickets: Ticket[];
}

export const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Tickets</h1>
        <p className="text-gray-600 mt-1">View and export your created tickets</p>
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
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{ticket.eventTitle}</CardTitle>
                    <p className="text-gray-600 mt-1">{ticket.description}</p>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {ticket.quantity} tickets
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-lg font-bold text-gray-900">${ticket.price}</p>
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

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleExportTickets(ticket)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export for WordPress</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>View Details</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
