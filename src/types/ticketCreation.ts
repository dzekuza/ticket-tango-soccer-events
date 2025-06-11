
export interface TicketProgress {
  current: number;
  total: number;
  percentage: number;
  currentTier?: string;
  status: 'idle' | 'creating' | 'completed' | 'cancelled' | 'error';
  error?: string;
}

export interface CreatedTicket {
  id: string;
  ticketNumber: number;
  tierName: string;
  qrCodeImage: string;
}

export interface TicketCreationResult {
  success: boolean;
  cancelled?: boolean;
  ticketBatch?: any;
  createdTickets?: CreatedTicket[];
  totalCreated?: number;
  error?: string;
}
