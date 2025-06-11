
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Search } from 'lucide-react';
import { IndividualTicket } from './Dashboard';

interface IndividualTicketTableProps {
  tickets: IndividualTicket[];
}

export const IndividualTicketTable: React.FC<IndividualTicketTableProps> = ({ tickets }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(ticket =>
    ticket.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.tierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.seatSection?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketNumber?.toString().includes(searchTerm)
  );

  const handleViewQR = (qrCode: string) => {
    // Create a simple QR code display (could be enhanced with a proper QR code library)
    const newWindow = window.open('', '_blank', 'width=400,height=400');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>QR Code - ${qrCode}</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
            <h3>Ticket QR Code</h3>
            <div style="border: 2px solid #000; padding: 20px; background: white;">
              <div style="font-family: monospace; word-break: break-all; max-width: 200px; text-align: center;">
                ${qrCode}
              </div>
            </div>
            <p style="margin-top: 20px; text-align: center; color: #666;">
              Use this QR code for ticket validation
            </p>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search tickets by QR code, tier, seat, or ticket number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket #</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No tickets match your search.' : 'No tickets found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    #{ticket.ticketNumber || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ticket.tierName || 'Standard'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.seatSection && ticket.seatRow && ticket.seatNumber
                      ? `${ticket.seatSection}-${ticket.seatRow}-${ticket.seatNumber}`
                      : 'General Admission'}
                  </TableCell>
                  <TableCell>${ticket.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.isUsed ? "destructive" : "default"}>
                      {ticket.isUsed ? "Used" : "Valid"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {ticket.qrCode.substring(0, 12)}...
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQR(ticket.qrCode)}
                      className="flex items-center space-x-1"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>View QR</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredTickets.length} of {tickets.length} tickets
      </div>
    </div>
  );
};
