
import React from 'react';
import { Ticket } from './Dashboard';
import { useTicketCreation } from '@/hooks/useTicketCreation';
import { TicketCreationForm } from './TicketCreationForm';

interface TicketCreationProps {
  onTicketCreated: (ticket: Ticket) => void;
}

export const TicketCreation: React.FC<TicketCreationProps> = ({ onTicketCreated }) => {
  const {
    formData,
    isCreating,
    handleInputChange,
    createTickets,
  } = useTicketCreation(onTicketCreated);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTickets();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Event Tickets</h1>
        <p className="text-gray-600 mt-1">Set up tickets for your soccer event</p>
      </div>

      <TicketCreationForm
        formData={formData}
        isCreating={isCreating}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
