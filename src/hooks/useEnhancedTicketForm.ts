
import { useState } from 'react';
import { EnhancedTicketFormData } from '@/types/ticket';

export const useEnhancedTicketForm = () => {
  const [formData, setFormData] = useState<EnhancedTicketFormData>({
    homeTeam: '',
    awayTeam: '',
    competition: '',
    stadiumName: '',
    eventDate: '',
    eventStartTime: '',
    eventEndTime: '',
    description: '',
    tiers: [
      {
        tierName: 'Standard',
        tierPrice: '',
        tierQuantity: '',
        tierDescription: '',
      },
    ],
  });

  const handleInputChange = (field: keyof EnhancedTicketFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      homeTeam: '',
      awayTeam: '',
      competition: '',
      stadiumName: '',
      eventDate: '',
      eventStartTime: '',
      eventEndTime: '',
      description: '',
      tiers: [
        {
          tierName: 'Standard',
          tierPrice: '',
          tierQuantity: '',
          tierDescription: '',
        },
      ],
    });
  };

  return {
    formData,
    handleInputChange,
    resetForm,
  };
};
