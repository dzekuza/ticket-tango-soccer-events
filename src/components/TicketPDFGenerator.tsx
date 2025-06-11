
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { Ticket, IndividualTicket } from './Dashboard';
import { useToast } from '@/hooks/use-toast';
import { generateTicketPDF } from '@/utils/pdfRenderer';
import { useSupabaseTickets } from '@/hooks/useSupabaseTickets';
import { SupabaseTicket } from '@/hooks/useSupabaseTickets';

interface TicketPDFGeneratorProps {
  ticket: Ticket;
  supabaseTicket?: SupabaseTicket;
  tickets?: IndividualTicket[];
  variant?: 'single' | 'all' | 'download' | 'regenerate';
  className?: string;
}

export const TicketPDFGenerator: React.FC<TicketPDFGeneratorProps> = ({ 
  ticket, 
  supabaseTicket,
  tickets,
  variant = 'all',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { regeneratePDF } = useSupabaseTickets();

  const handleDownloadFromStorage = () => {
    if (supabaseTicket?.pdf_url) {
      window.open(supabaseTicket.pdf_url, '_blank');
      toast({
        title: "Download Started",
        description: "PDF download has been initiated",
      });
    } else {
      toast({
        title: "No PDF Available",
        description: "PDF not found. Try regenerating it.",
        variant: "destructive",
      });
    }
  };

  const handleRegeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const success = await regeneratePDF(ticket.id);
      if (success) {
        toast({
          title: "PDF Regenerated",
          description: "Your ticket PDF has been regenerated successfully",
        });
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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

  // If we have a stored PDF and this is the download variant, show download button
  if (variant === 'download' && supabaseTicket?.pdf_url) {
    return (
      <Button 
        onClick={handleDownloadFromStorage}
        className={`flex items-center space-x-2 bg-green-600 hover:bg-green-700 ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Download PDF</span>
      </Button>
    );
  }

  // If this is the regenerate variant, show regenerate button
  if (variant === 'regenerate') {
    return (
      <Button 
        onClick={handleRegeneratePDF}
        disabled={isGenerating}
        variant="outline"
        className={`flex items-center space-x-2 ${className}`}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        <span>{isGenerating ? 'Regenerating...' : 'Regenerate PDF'}</span>
      </Button>
    );
  }

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
