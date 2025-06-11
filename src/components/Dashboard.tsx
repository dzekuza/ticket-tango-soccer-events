
import React from 'react';

export interface Ticket {
  id: string;
  eventTitle: string;
  description: string;
  price: number;
  quantity: number;
  pdfUrl?: string;
  createdAt: string;
  tickets: IndividualTicket[];
  // Enhanced event properties
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  homeTeam?: string;
  awayTeam?: string;
  stadiumName?: string;
  competition?: string;
}

export interface IndividualTicket {
  id: string;
  qrCode: string;
  qrCodeImage?: string;
  isUsed: boolean;
  validatedAt?: string;
  price: number;
  tierName?: string;
  ticketNumber?: number;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
  eventTitle?: string; // Add this property for compatibility
}

// Create a default Dashboard component
const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Dashboard component content goes here</p>
    </div>
  );
};

export default Dashboard;
