
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

  const handleViewQR = (ticket: IndividualTicket) => {
    const newWindow = window.open('', '_blank', 'width=500,height=600');
    if (newWindow) {
      const qrContent = ticket.qrCodeImage 
        ? `<img src="${ticket.qrCodeImage}" alt="QR Code" style="max-width: 300px; max-height: 300px; border: 2px solid #000; padding: 10px; background: white;" />`
        : `<div style="border: 2px solid #000; padding: 20px; background: white; font-family: monospace; word-break: break-all; max-width: 300px; text-align: center;">${ticket.qrCode}</div>`;

      newWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Ticket #${ticket.ticketNumber || 'N/A'}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
                background: #f5f5f5;
                padding: 20px;
                box-sizing: border-box;
              }
              .qr-container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                text-align: center;
              }
              h3 {
                margin-top: 0;
                color: #333;
              }
              .ticket-info {
                margin-top: 20px;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h3>Ticket QR Code</h3>
              ${qrContent}
              <div class="ticket-info">
                <p><strong>Ticket #:</strong> ${ticket.ticketNumber || 'N/A'}</p>
                ${ticket.tierName ? `<p><strong>Tier:</strong> ${ticket.tierName}</p>` : ''}
                ${ticket.seatSection ? `<p><strong>Seat:</strong> ${ticket.seatSection}-${ticket.seatRow}-${ticket.seatNumber}</p>` : ''}
                <p style="margin-top: 15px; font-size: 12px;">Use this QR code for ticket validation</p>
              </div>
            </div>
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
              <TableHead>QR Preview</TableHead>
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
                  <TableCell>
                    {ticket.qrCodeImage ? (
                      <img 
                        src={ticket.qrCodeImage} 
                        alt="QR Code" 
                        className="w-8 h-8 border rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 border rounded flex items-center justify-center">
                        <QrCode className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQR(ticket)}
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
