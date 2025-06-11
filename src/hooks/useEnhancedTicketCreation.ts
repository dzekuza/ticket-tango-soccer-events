
import { useState } from 'react';
import { EnhancedTicketFormData } from '@/types/ticket';
import { TicketProgress } from '@/types/ticketCreation';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useEnhancedTicketCreationLogic } from './useEnhancedTicketCreationLogic';
import { validateEventData, validateTierData, sanitizeString } from '@/utils/inputValidation';

export const useEnhancedTicketCreation = (onTicketCreated: (ticket: any) => void) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { executeTicketCreation } = useEnhancedTicketCreationLogic();

  const [formData, setFormData] = useState<EnhancedTicketFormData>({
    eventTitle: '',
    homeTeam: '',
    awayTeam: '',
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '',
    stadiumName: '',
    competition: '',
    description: '',
    pricingTiers: [
      {
        tierName: 'General Admission',
        tierPrice: 25.00,
        tierQuantity: 100,
        tierDescription: 'Standard seating area'
      }
    ]
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState<TicketProgress>({
    status: 'idle',
    current: 0,
    total: 0,
    percentage: 0,
    currentTier: null,
    error: null
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Sanitize string inputs
      if (typeof value === 'string') {
        value = sanitizeString(value);
      }
      
      if (field.includes('.')) {
        const [section, subField] = field.split('.');
        const index = parseInt(section.split('[')[1].split(']')[0]);
        const tierField = subField;
        
        const newTiers = [...newData.pricingTiers];
        newTiers[index] = { ...newTiers[index], [tierField]: value };
        newData.pricingTiers = newTiers;
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });
  };

  const createTickets = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create tickets",
        variant: "destructive",
      });
      return;
    }

    // Validate input data
    const eventValidation = validateEventData(formData);
    if (!eventValidation.isValid) {
      toast({
        title: "Validation Error",
        description: eventValidation.errors.join('. '),
        variant: "destructive",
      });
      return;
    }

    const tierValidation = validateTierData(formData.pricingTiers);
    if (!tierValidation.isValid) {
      toast({
        title: "Tier Validation Error",
        description: tierValidation.errors.join('. '),
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    setIsCompleted(false);
    setProgress({
      status: 'creating',
      current: 0,
      total: formData.pricingTiers.reduce((sum, tier) => sum + tier.tierQuantity, 0),
      percentage: 0,
      currentTier: null,
      error: null
    });

    try {
      const result = await executeTicketCreation(formData, setProgress);
      
      if (result) {
        setIsCompleted(true);
        setProgress(prev => ({ ...prev, status: 'completed' }));
        onTicketCreated(result);
        
        toast({
          title: "Success",
          description: "Tickets created successfully!",
        });
      }
    } catch (error) {
      console.error('Ticket creation failed:', error);
      setProgress(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }));
      
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create tickets",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventTitle: '',
      homeTeam: '',
      awayTeam: '',
      eventDate: '',
      eventStartTime: '',
      eventEndTime: '',
      stadiumName: '',
      competition: '',
      description: '',
      pricingTiers: [
        {
          tierName: 'General Admission',
          tierPrice: 25.00,
          tierQuantity: 100,
          tierDescription: 'Standard seating area'
        }
      ]
    });
    setIsCompleted(false);
    setProgress({
      status: 'idle',
      current: 0,
      total: 0,
      percentage: 0,
      currentTier: null,
      error: null
    });
  };

  const cancelCreation = () => {
    setProgress(prev => ({ ...prev, status: 'cancelled' }));
    setIsCreating(false);
  };

  return {
    formData,
    isCreating,
    isCompleted,
    progress,
    handleInputChange,
    createTickets,
    resetForm,
    cancelCreation,
  };
};
