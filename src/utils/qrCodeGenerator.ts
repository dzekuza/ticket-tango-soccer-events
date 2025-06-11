
import QRCode from 'qrcode';
import { validateQRCode } from './inputValidation';

export interface QRCodeData {
  ticketId: string;
  batchId: string;
  eventTitle: string;
  tierName?: string;
  price: number;
  timestamp: string;
  checksum: string;
}

// Generate a simple checksum for data integrity
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

export const generateQRCodeData = (
  ticketId: string,
  batchId: string,
  eventTitle: string,
  price: number,
  tierName?: string
): QRCodeData => {
  const timestamp = new Date().toISOString();
  const baseData = `${ticketId}|${batchId}|${eventTitle}|${price}|${timestamp}`;
  const checksum = generateChecksum(baseData);
  
  return {
    ticketId,
    batchId,
    eventTitle,
    tierName,
    price,
    timestamp,
    checksum
  };
};

export const generateQRCodeString = (qrData: QRCodeData): string => {
  return JSON.stringify(qrData);
};

export const generateQRCodeImage = async (qrData: QRCodeData): Promise<string> => {
  const qrString = generateQRCodeString(qrData);
  
  // Validate the QR code data before generating
  if (!validateQRCode(qrString)) {
    throw new Error('Invalid QR code data structure');
  }
  
  try {
    const qrCodeImage = await QRCode.toDataURL(qrString, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrCodeImage;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code image');
  }
};

export const validateQRCodeData = (qrString: string): boolean => {
  try {
    const qrData: QRCodeData = JSON.parse(qrString);
    
    // Validate required fields
    if (!qrData.ticketId || !qrData.batchId || !qrData.eventTitle || 
        typeof qrData.price !== 'number' || !qrData.timestamp || !qrData.checksum) {
      return false;
    }
    
    // Validate checksum
    const baseData = `${qrData.ticketId}|${qrData.batchId}|${qrData.eventTitle}|${qrData.price}|${qrData.timestamp}`;
    const expectedChecksum = generateChecksum(baseData);
    
    return qrData.checksum === expectedChecksum;
  } catch {
    return false;
  }
};

// Enhanced QR code generation for individual tickets
export const generateIndividualTicketQR = async (
  ticketId: string,
  batchId: string,
  eventTitle: string,
  price: number,
  tierName?: string
): Promise<{ qrCode: string; qrCodeImage: string }> => {
  const qrData = generateQRCodeData(ticketId, batchId, eventTitle, price, tierName);
  const qrCode = generateQRCodeString(qrData);
  const qrCodeImage = await generateQRCodeImage(qrData);
  
  return {
    qrCode,
    qrCodeImage
  };
};
