
import { useToast } from '@/hooks/use-toast';
import { EnhancedTicketFormData } from '@/types/ticket';

export const useEnhancedTicketValidation = () => {
  const { toast } = useToast();

  const validateForm = (formData: EnhancedTicketFormData): boolean => {
    if (!formData.homeTeam || !formData.awayTeam || !formData.stadiumName) {
      toast({
        title: "Error",
        description: "Please fill in all required team and venue fields",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.eventDate || !formData.eventStartTime || !formData.eventEndTime) {
      toast({
        title: "Error",
        description: "Please fill in all required date and time fields",
        variant: "destructive",
      });
      return false;
    }

    if (formData.tiers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one pricing tier",
        variant: "destructive",
      });
      return false;
    }

    for (const tier of formData.tiers) {
      if (!tier.tierName || !tier.tierPrice || !tier.tierQuantity) {
        toast({
          title: "Error",
          description: "Please fill in all required tier fields",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  return {
    validateForm,
  };
};
