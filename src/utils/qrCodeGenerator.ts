
import QRCode from 'qrcode';

export const generateQRCodeImage = async (ticketData: any): Promise<string> => {
  try {
    // Create structured ticket data with security features
    const qrData = {
      ticketId: ticketData.id,
      eventTitle: ticketData.eventTitle,
      price: ticketData.price,
      timestamp: Date.now(),
      checksum: btoa(`${ticketData.id}_${ticketData.eventTitle}_${Date.now()}`).slice(0, 8)
    };
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
};
