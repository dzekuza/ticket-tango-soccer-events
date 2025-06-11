
import { useState } from 'react';
import { Ticket } from '@/components/Dashboard';
import { useEnhancedTicketForm } from './useEnhancedTicketForm';
import { useEnhancedTicketValidation } from './useEnhancedTicketValidation';
import { useEnhancedTicketCreationLogic } from './useEnhancedTicketCreationLogic';

export const useEnhancedTicketCreation = (onTicketCreated: (ticket: Ticket) => void) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  const { formData, handleInputChange, resetForm: resetFormData } = useEnhancedTicketForm();
  const { validateForm } = useEnhancedTicketValidation();
  const { isCreating, createTickets: performTicketCreation } = useEnhancedTicketCreationLogic(onTicketCreated);

  const createTickets = async (): Promise<void> => {
    if (!validateForm(formData)) return;

    await performTicketCreation(formData);
    setIsCompleted(true);
  };

  const resetForm = () => {
    resetFormData();
    setIsCompleted(false);
  };

  return {
    formData,
    isCreating,
    isCompleted,
    handleInputChange,
    createTickets,
    resetForm,
  };
};
