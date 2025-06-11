
import { useState } from 'react';
import { Ticket } from '@/components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTicketFormData } from '@/types/ticket';
import { useIndividualTicketCreation } from './useIndividualTicketCreation';

export const useEnhancedTicketCreationLogic = (onTicketCreated: (ticket: Ticket) => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const {
    progress,
    createdTickets,
    createTicketsIndividually,
    cancelCreation,
    resetProgress,
  } = useIndividualTicketCreation();

  const createTickets = async (formData: EnhancedTicketFormData): Promise<void> => {
    setIsCreating(true);

    try {
      console.log('Starting enhanced individual ticket creation with data:', {
        eventTitle: `${formData.homeTeam} vs ${formData.awayTeam}`,
        totalTiers: formData.tiers.length,
        tiers: formData.tiers.map(t => ({ name: t.tierName, quantity: t.tierQuantity, price: t.tierPrice }))
      });
      
      const result = await createTicketsIndividually(formData, onTicketCreated);

      if (result.success) {
        console.log('✅ Individual ticket creation completed successfully');
      } else if (result.cancelled) {
        console.log('⚠️ Ticket creation was cancelled by user');
      } else {
        console.error('❌ Individual ticket creation failed:', result.error);
      }

    } catch (error) {
      console.error('Enhanced individual ticket creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    cancelCreation();
    setIsCreating(false);
  };

  const handleReset = () => {
    resetProgress();
    setIsCreating(false);
  };

  return {
    isCreating,
    progress,
    createdTickets,
    createTickets,
    cancelCreation: handleCancel,
    resetProgress: handleReset,
  };
};
