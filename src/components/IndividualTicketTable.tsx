
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
import { QrCode, Search, Download } from 'lucide-react';
import { IndividualTicket } from './Dashboard';
import { generateTicketPDF } from '@/utils/pdfRenderer';
import { useToast } from '@/hooks/use-toast';

interface IndividualTicketTableProps {
  tickets: IndividualTicket[];
}

export const IndividualTicketTable: React.FC<IndividualTicketTableProps> = ({ tickets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleGenerateIndividualPDF = async (ticket: IndividualTicket) => {
    setGeneratingPDF(ticket.id);
    
    try {
      // Create a ticket batch object for this single ticket
      const singleTicketBatch = {
        id: `single_${ticket.id}`,
        eventTitle: ticket.eventTitle || 'Event',
        description: '',
        price: ticket.price,
        quantity: 1,
        createdAt: new Date().toISOString(),
        tickets: [ticket]
      };

      await generateTicketPDF([ticket], singleTicketBatch);

      toast({
        title: "PDF Generated Successfully",
        description: `Generated PDF for ticket #${ticket.ticketNumber || ticket.id.slice(-4)}`,
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm min-w-[70px]">Ticket #</TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[70px]">Tier</TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[80px] hidden md:table-cell">Seat</TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[60px]">Price</TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[60px]">Status</TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[50px] hidden lg:table-cell">QR</TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                    {searchTerm ? 'No tickets match your search.' : 'No tickets found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      #{ticket.ticketNumber || ticket.id.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ticket.tierName || 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      {ticket.seatSection && ticket.seatRow && ticket.seatNumber
                        ? `${ticket.seatSection}-${ticket.seatRow}-${ticket.seatNumber}`
                        : 'General'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-medium">
                      ${ticket.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticket.isUsed ? "destructive" : "default"} className="text-xs">
                        {ticket.isUsed ? "Used" : "Valid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {ticket.qrCodeImage ? (
                        <img 
                          src={ticket.qrCodeImage} 
                          alt="QR Code" 
                          className="w-6 h-6 sm:w-8 sm:h-8 border rounded"
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted border rounded flex items-center justify-center">
                          <QrCode className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewQR(ticket)}
                          className="flex items-center space-x-1 text-xs h-7 px-2"
                        >
                          <QrCode className="w-3 h-3" />
                          <span className="hidden sm:inline">View QR</span>
                          <span className="sm:hidden">QR</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateIndividualPDF(ticket)}
                          disabled={generatingPDF === ticket.id}
                          className="flex items-center space-x-1 text-xs h-7 px-2"
                        >
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {generatingPDF === ticket.id ? 'PDF...' : 'PDF'}
                          </span>
                          <span className="sm:hidden">
                            {generatingPDF === ticket.id ? '...' : 'PDF'}
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing {filteredTickets.length} of {tickets.length} tickets
      </div>
    </div>
  );
};
