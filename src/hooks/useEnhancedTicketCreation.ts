
import { useState } from 'react';
import { Ticket } from '@/components/Dashboard';
import { useEnhancedTicketForm } from './useEnhancedTicketForm';
import { useEnhancedTicketValidation } from './useEnhancedTicketValidation';
import { useEnhancedTicketCreationLogic } from './useEnhancedTicketCreationLogic';

export const useEnhancedTicketCreation = (onTicketCreated: (ticket: Ticket) => void) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  const { formData, handleInputChange, resetForm: resetFormData } = useEnhancedTicketForm();
  const { validateForm } = useEnhancedTicketValidation();
  const { 
    isCreating, 
    progress, 
    createdTickets,
    createTickets: performTicketCreation,
    cancelCreation,
    resetProgress 
  } = useEnhancedTicketCreationLogic(onTicketCreated);

  const createTickets = async (): Promise<void> => {
    if (!validateForm(formData)) return;

    setIsCompleted(false);
    await performTicketCreation(formData);
    
    // Check if creation was successful
    if (progress.status === 'completed') {
      setIsCompleted(true);
    }
  };

  const resetForm = () => {
    resetFormData();
    resetProgress();
    setIsCompleted(false);
  };

  const handleCancel = () => {
    cancelCreation();
  };

  return {
    formData,
    isCreating,
    isCompleted,
    progress,
    createdTickets,
    handleInputChange,
    createTickets,
    resetForm,
    cancelCreation: handleCancel,
  };
};
