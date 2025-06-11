
import { generateQRCodeImage } from '@/utils/qrCodeGenerator';

export interface TicketQRData {
  id: string;
  eventTitle: string;
  homeTeam: string;
  awayTeam: string;
  stadiumName: string;
  eventDate: string;
  eventStartTime: string;
  tierName: string;
  price: number;
  ticketNumber: number;
  tierIndex: number;
}

export const generateTicketQRCode = async (ticketData: TicketQRData): Promise<string> => {
  console.log(`Generating QR code for ticket ${ticketData.ticketNumber}`);
  
  const qrCodeImage = await generateQRCodeImage(ticketData);
  
  return qrCodeImage;
};

export const createQRCodeData = (ticketData: TicketQRData) => {
  return {
    ...ticketData,
    timestamp: Date.now(),
    checksum: btoa(`${ticketData.id}_${ticketData.eventTitle}_${Date.now()}`).slice(0, 8)
  };
};
