
import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Ticket, IndividualTicket } from './Dashboard';
import { TicketTemplate } from './TicketTemplate';
import { useToast } from '@/hooks/use-toast';

interface TicketPDFGeneratorProps {
  ticket: Ticket;
  tickets?: IndividualTicket[];
}

export const TicketPDFGenerator: React.FC<TicketPDFGeneratorProps> = ({ 
  ticket, 
  tickets 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (ticketsToGenerate: IndividualTicket[] = ticket.tickets) => {
    setIsGenerating(true);
    
    try {
      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      // Generate HTML content for each ticket
      const ticketElements = ticketsToGenerate.map((individualTicket, index) => {
        const ticketDiv = document.createElement('div');
        ticketDiv.innerHTML = `
          <div style="page-break-after: ${index < ticketsToGenerate.length - 1 ? 'always' : 'auto'}; padding: 20px;">
            <div class="ticket-pdf-content">
              ${renderTicketHTML(individualTicket, ticket)}
            </div>
          </div>
        `;
        return ticketDiv;
      });

      // Add all ticket elements to container
      ticketElements.forEach(element => tempContainer.appendChild(element));

      // Configure PDF options
      const opt = {
        margin: 10,
        filename: `${ticket.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_tickets.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF
      await html2pdf().set(opt).from(tempContainer).save();

      // Clean up
      document.body.removeChild(tempContainer);

      toast({
        title: "PDF Generated Successfully",
        description: `Generated PDF with ${ticketsToGenerate.length} ticket(s)`,
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Please try again or check your browser settings",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTicketHTML = (individualTicket: IndividualTicket, ticketBatch: Ticket) => {
    return `
      <div style="background: white; border: 2px solid #d1d5db; border-radius: 8px; padding: 24px; max-width: 600px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="border-bottom: 2px dashed #d1d5db; padding-bottom: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 8px 0;">${ticketBatch.eventTitle}</h1>
              ${ticketBatch.description ? `<p style="color: #6b7280; font-size: 14px; margin: 0;">${ticketBatch.description}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <div style="font-size: 28px; font-weight: bold; color: #059669;">$${individualTicket.price}</div>
              <div style="font-size: 12px; color: #6b7280;">TICKET PRICE</div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div style="display: grid; grid-template-columns: 1fr 200px; gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #374151;">Event Date: ${ticketBatch.createdAt.toLocaleDateString()}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="font-size: 14px; color: #374151;">Ticket ID: ${individualTicket.id.split('_').pop()}</div>
            </div>
            <div>
              <div style="font-size: 14px; color: #374151;">Status: ${individualTicket.isUsed ? 'VALIDATED' : 'VALID'}</div>
            </div>
          </div>
          
          <!-- QR Code -->
          <div style="text-align: center; background: #f9fafb; padding: 16px; border-radius: 8px;">
            ${individualTicket.qrCodeImage ? 
              `<img src="${individualTicket.qrCodeImage}" alt="QR Code" style="width: 96px; height: 96px; margin-bottom: 8px;" />` :
              `<div style="width: 96px; height: 96px; background: #e5e7eb; margin: 0 auto 8px; border-radius: 4px;"></div>`
            }
            <div style="font-size: 10px; color: #6b7280;">SCAN TO VALIDATE</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px dashed #d1d5db; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280;">
            <div>Generated by TicketManager</div>
            <div style="font-family: monospace;">${individualTicket.id}</div>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <Button 
      onClick={() => generatePDF()}
      disabled={isGenerating}
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>{isGenerating ? 'Generating PDF...' : 'Generate PDF'}</span>
    </Button>
  );
};
