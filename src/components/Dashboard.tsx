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
}

export interface IndividualTicket {
  id: string;
  qrCode: string;
  qrCodeImage?: string; // Add this field
  isUsed: boolean;
  validatedAt?: string;
  price: number;
  tierName?: string;
  ticketNumber?: number;
  seatSection?: string;
  seatRow?: string;
  seatNumber?: string;
}
