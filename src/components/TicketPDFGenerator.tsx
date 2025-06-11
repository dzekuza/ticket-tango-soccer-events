
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Ticket, IndividualTicket } from './Dashboard';
import { useToast } from '@/hooks/use-toast';
import { generateTicketPDF } from '@/utils/pdfRenderer';

interface TicketPDFGeneratorProps {
  ticket: Ticket;
  tickets?: IndividualTicket[];
  variant?: 'single' | 'all';
  className?: string;
}

export const TicketPDFGenerator: React.FC<TicketPDFGeneratorProps> = ({ 
  ticket, 
  tickets,
  variant = 'all',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const ticketsToGenerate = tickets || ticket.tickets;
      
      if (!ticketsToGenerate || ticketsToGenerate.length === 0) {
        throw new Error('No tickets found to generate PDF');
      }

      await generateTicketPDF(ticketsToGenerate, ticket);

      toast({
        title: "PDF Generated Successfully",
        description: `Generated PDF with ${ticketsToGenerate.length} ticket(s)`,
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Please try again or check your browser settings",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonText = variant === 'single' && tickets?.length === 1 
    ? 'Download This Ticket' 
    : `Download ${tickets?.length || ticket.tickets.length} Ticket(s)`;

  return (
    <Button 
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 ${className}`}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span>{isGenerating ? 'Generating PDF...' : buttonText}</span>
    </Button>
  );
};
