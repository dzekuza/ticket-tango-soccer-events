
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import { useTicketPDF } from '@/hooks/useTicketPDF';
import { useToast } from '@/hooks/use-toast';
import { SupabaseTicket } from '@/hooks/useTicketData';

interface TicketPDFActionsProps {
  ticket: SupabaseTicket;
  refetchTickets: () => Promise<void>;
}

export const TicketPDFActions: React.FC<TicketPDFActionsProps> = ({ 
  ticket, 
  refetchTickets 
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { regeneratePDF } = useTicketPDF([ticket], refetchTickets);
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    if (ticket.pdf_url) {
      console.log('Opening PDF URL:', ticket.pdf_url);
      window.open(ticket.pdf_url, '_blank');
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
    setIsRegenerating(true);
    console.log('Starting PDF regeneration for ticket:', ticket.id);
    
    try {
      const success = await regeneratePDF(ticket.id);
      if (success) {
        console.log('PDF regeneration successful');
        toast({
          title: "PDF Regenerated",
          description: "Your ticket PDF has been regenerated successfully",
        });
      } else {
        console.log('PDF regeneration failed');
        toast({
          title: "Regeneration Failed",
          description: "Failed to regenerate PDF. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during PDF regeneration:', error);
      toast({
        title: "Error",
        description: "An error occurred while regenerating the PDF",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {ticket.pdf_url ? (
        <>
          <Button 
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
          <Button 
            onClick={handleRegeneratePDF}
            disabled={isRegenerating}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </Button>
        </>
      ) : (
        <Button 
          onClick={handleRegeneratePDF}
          disabled={isRegenerating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isRegenerating ? 'Generating PDF...' : 'Generate PDF'}</span>
        </Button>
      )}
    </div>
  );
};
