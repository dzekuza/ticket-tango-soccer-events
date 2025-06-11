
import ReactDOMServer from 'react-dom/server';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';
import { IndividualTicket, Ticket } from '@/components/Dashboard';

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

export const generateAndUploadTicketPDF = async (
  tickets: IndividualTicket[],
  ticketBatch: Ticket,
  userId: string
): Promise<PDFGenerationResult> => {
  console.log('Starting PDF generation for tickets:', tickets.length);
  
  try {
    // Enhanced validation
    if (!tickets || tickets.length === 0) {
      console.error('No tickets provided for PDF generation');
      throw new Error('No tickets provided for PDF generation');
    }

    if (!userId) {
      console.error('User ID is required for PDF upload');
      throw new Error('User ID is required for PDF upload');
    }

    if (!ticketBatch) {
      console.error('Ticket batch information is required');
      throw new Error('Ticket batch information is required');
    }

    console.log('Validation passed, proceeding with PDF generation');
    console.log('Ticket batch info:', {
      id: ticketBatch.id,
      title: ticketBatch.eventTitle,
      ticketCount: tickets.length,
      hasEnhancedData: !!(ticketBatch.homeTeam && ticketBatch.awayTeam)
    });

    // Validate each ticket has required data
    const validTickets = tickets.filter(ticket => {
      const isValid = ticket.id && ticket.eventTitle && typeof ticket.price === 'number';
      if (!isValid) {
        console.warn('Invalid ticket found:', ticket);
      }
      return isValid;
    });

    if (validTickets.length !== tickets.length) {
      console.error(`${tickets.length - validTickets.length} invalid tickets found`);
      throw new Error(`Found ${tickets.length - validTickets.length} invalid tickets`);
    }

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.background = 'white';
    document.body.appendChild(container);

    // Generate HTML content for all tickets with page breaks
    const ticketsHtml = validTickets.map((ticket, index) => {
      const addPageBreak = index < validTickets.length - 1;
      return createTicketHTML(ticket, ticketBatch, addPageBreak);
    }).join('');

    container.innerHTML = ticketsHtml;

    // Apply all styles inline for PDF compatibility
    await applyInlineStyles(container);

    // Configure PDF options for better quality and handling of multiple pages
    const pdfOptions = {
      margin: [10, 10, 10, 10],
      filename: `${ticketBatch.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_tickets.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    console.log('Generating PDF with options:', pdfOptions);

    // Generate PDF blob
    const pdfBlob = await html2pdf().set(pdfOptions).from(container).outputPdf('blob');
    
    console.log('PDF blob generated, size:', pdfBlob.size, 'bytes');

    // Clean up DOM
    document.body.removeChild(container);

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Generated PDF is empty or invalid');
    }

    // Upload to Supabase storage
    const fileName = `${userId}/${ticketBatch.id}_${Date.now()}.pdf`;
    console.log('Uploading PDF to storage path:', fileName);

    const { data, error } = await supabase.storage
      .from('tickets')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log('PDF uploaded successfully:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tickets')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded PDF');
    }

    console.log('PDF public URL generated:', urlData.publicUrl);

    return {
      success: true,
      pdfUrl: urlData.publicUrl
    };

  } catch (error) {
    console.error('PDF generation and upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during PDF generation'
    };
  }
};

const createTicketHTML = (
  ticket: IndividualTicket,
  ticketBatch: Ticket,
  addPageBreak: boolean
): string => {
  // Safely access ticket properties with fallbacks
  const ticketPrice = ticket?.price ?? 0;
  const ticketId = ticket?.id ?? 'N/A';
  const isUsed = ticket?.isUsed ?? false;
  const qrCodeImage = ticket?.qrCodeImage;
  const validatedAt = ticket?.validatedAt;
  const tierName = (ticket as any)?.tierName || 'Standard';
  const ticketNumber = (ticket as any)?.ticketNumber || ticketId.split('_').pop();

  // Enhanced event data
  const isEnhancedTicket = !!(ticketBatch.homeTeam && ticketBatch.awayTeam);
  const eventTitle = isEnhancedTicket 
    ? `${ticketBatch.homeTeam} vs ${ticketBatch.awayTeam}`
    : ticketBatch.eventTitle;

  return `
    <div style="
      ${addPageBreak ? 'page-break-after: always;' : ''}
      padding: 20px;
      margin: 0 auto;
      max-width: 600px;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      box-sizing: border-box;
    ">
      <div style="
        background: white;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        height: auto;
        min-height: 400px;
      ">
        <!-- Header -->
        <div style="
          border-bottom: 2px dashed #d1d5db;
          padding-bottom: 16px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        ">
          <div style="flex: 1;">
            <h1 style="
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin: 0 0 8px 0;
              line-height: 1.2;
            ">${eventTitle}</h1>
            ${ticketBatch.competition ? `
              <p style="
                color: #3b82f6;
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 4px 0;
              ">${ticketBatch.competition}</p>
            ` : ''}
            ${ticketBatch.description ? `
              <p style="
                color: #6b7280;
                font-size: 14px;
                margin: 0;
                line-height: 1.4;
              ">${ticketBatch.description}</p>
            ` : ''}
          </div>
          <div style="text-align: right; margin-left: 20px;">
            <div style="
              font-size: 28px;
              font-weight: bold;
              color: #059669;
              line-height: 1;
            ">$${ticketPrice.toFixed(2)}</div>
            <div style="
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            ">TICKET PRICE</div>
            ${tierName !== 'Standard' ? `
              <div style="
                font-size: 10px;
                color: #7c3aed;
                font-weight: 600;
                margin-top: 4px;
                text-transform: uppercase;
              ">${tierName}</div>
            ` : ''}
          </div>
        </div>

        <!-- Content Grid -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 140px;
          gap: 20px;
          margin-bottom: 16px;
          align-items: start;
        ">
          <!-- Event Details -->
          <div>
            ${ticketBatch.eventDate ? `
              <div style="margin-bottom: 12px;">
                <div style="
                  font-size: 14px;
                  color: #374151;
                  display: flex;
                  align-items: center;
                ">
                  <span style="margin-right: 8px;">📅</span>
                  Event Date: ${new Date(ticketBatch.eventDate).toLocaleDateString()}
                </div>
              </div>
            ` : `
              <div style="margin-bottom: 12px;">
                <div style="
                  font-size: 14px;
                  color: #374151;
                  display: flex;
                  align-items: center;
                ">
                  <span style="margin-right: 8px;">📅</span>
                  Created: ${new Date(ticketBatch.createdAt).toLocaleDateString()}
                </div>
              </div>
            `}
            
            ${ticketBatch.eventStartTime && ticketBatch.eventEndTime ? `
              <div style="margin-bottom: 12px;">
                <div style="
                  font-size: 14px;
                  color: #374151;
                  display: flex;
                  align-items: center;
                ">
                  <span style="margin-right: 8px;">⏰</span>
                  Time: ${ticketBatch.eventStartTime} - ${ticketBatch.eventEndTime}
                </div>
              </div>
            ` : ''}
            
            ${ticketBatch.stadiumName ? `
              <div style="margin-bottom: 12px;">
                <div style="
                  font-size: 14px;
                  color: #374151;
                  display: flex;
                  align-items: center;
                ">
                  <span style="margin-right: 8px;">🏟️</span>
                  Venue: ${ticketBatch.stadiumName}
                </div>
              </div>
            ` : ''}
            
            <div style="margin-bottom: 12px;">
              <div style="
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
              ">
                <span style="margin-right: 8px;">🎫</span>
                Ticket #${ticketNumber}
              </div>
            </div>
            <div>
              <div style="
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
              ">
                <span style="margin-right: 8px;">✅</span>
                Status: ${isUsed ? 'VALIDATED' : 'VALID'}
              </div>
              ${validatedAt ? `
                <div style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-top: 4px;
                  margin-left: 20px;
                ">
                  Validated: ${new Date(validatedAt).toLocaleString()}
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- QR Code Section -->
          <div style="
            text-align: center;
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          ">
            ${qrCodeImage ? `
              <img 
                src="${qrCodeImage}" 
                alt="QR Code" 
                style="
                  width: 96px;
                  height: 96px;
                  margin: 0 auto 8px;
                  display: block;
                " 
              />
            ` : `
              <div style="
                width: 96px;
                height: 96px;
                background: #e5e7eb;
                margin: 0 auto 8px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6b7280;
              ">
                QR CODE
              </div>
            `}
            <div style="
              font-size: 10px;
              color: #6b7280;
              font-weight: 500;
            ">SCAN TO VALIDATE</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="
          border-top: 2px dashed #d1d5db;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="
            font-size: 10px;
            color: #6b7280;
          ">
            Generated by TicketManager
          </div>
          <div style="
            font-size: 10px;
            color: #6b7280;
            font-family: monospace;
          ">
            ${ticketId}
          </div>
        </div>
      </div>
    </div>
  `;
};

const applyInlineStyles = async (container: HTMLElement): Promise<void> => {
  // Get all computed styles and apply them inline for PDF compatibility
  const elements = container.querySelectorAll('*');
  elements.forEach((element) => {
    const computedStyles = window.getComputedStyle(element as Element);
    const inlineStyles = [];
    
    // Copy essential styles for PDF rendering
    const importantStyles = [
      'font-family', 'font-size', 'font-weight', 'color', 'background-color',
      'padding', 'margin', 'border', 'border-radius', 'display', 'flex-direction',
      'justify-content', 'align-items', 'text-align', 'line-height', 'width', 'height'
    ];
    
    importantStyles.forEach(prop => {
      const value = computedStyles.getPropertyValue(prop);
      if (value && value !== 'auto' && value !== 'normal') {
        inlineStyles.push(`${prop}: ${value}`);
      }
    });
    
    if (inlineStyles.length > 0) {
      (element as HTMLElement).style.cssText += '; ' + inlineStyles.join('; ');
    }
  });
};
