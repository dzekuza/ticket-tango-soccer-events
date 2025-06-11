
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
  try {
    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.background = 'white';
    document.body.appendChild(container);

    // Generate HTML content for all tickets
    const ticketsHtml = tickets.map((ticket, index) => 
      createTicketHTML(ticket, ticketBatch, index < tickets.length - 1)
    ).join('');

    container.innerHTML = ticketsHtml;

    // Apply all styles inline for PDF compatibility
    await applyInlineStyles(container);

    // Configure PDF options
    const pdfOptions = {
      margin: 10,
      filename: `${ticketBatch.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_tickets.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Generate PDF blob
    const pdfBlob = await html2pdf().set(pdfOptions).from(container).outputPdf('blob');
    
    // Clean up DOM
    document.body.removeChild(container);

    // Upload to Supabase storage
    const fileName = `${userId}/${ticketBatch.id}.pdf`;
    const { data, error } = await supabase.storage
      .from('tickets')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tickets')
      .getPublicUrl(fileName);

    return {
      success: true,
      pdfUrl: urlData.publicUrl
    };

  } catch (error) {
    console.error('PDF generation and upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

const createTicketHTML = (
  ticket: IndividualTicket,
  ticketBatch: Ticket,
  addPageBreak: boolean
): string => {
  return `
    <div style="
      ${addPageBreak ? 'page-break-after: always;' : ''}
      padding: 20px;
      margin: 0 auto;
      max-width: 600px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        background: white;
        border: 2px solid #d1d5db;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
            ">${ticketBatch.eventTitle}</h1>
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
            ">$${ticket.price.toFixed(2)}</div>
            <div style="
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            ">TICKET PRICE</div>
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
            <div style="margin-bottom: 12px;">
              <div style="
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
              ">
                <span style="margin-right: 8px;">📅</span>
                Event Date: ${ticketBatch.createdAt.toLocaleDateString()}
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="
                font-size: 14px;
                color: #374151;
                display: flex;
                align-items: center;
              ">
                <span style="margin-right: 8px;">🎫</span>
                Ticket ID: ${ticket.id.split('_').pop()}
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
                Status: ${ticket.isUsed ? 'VALIDATED' : 'VALID'}
              </div>
              ${ticket.validatedAt ? `
                <div style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-top: 4px;
                  margin-left: 20px;
                ">
                  Validated: ${ticket.validatedAt.toLocaleString()}
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
            ${ticket.qrCodeImage ? `
              <img 
                src="${ticket.qrCodeImage}" 
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
            ${ticket.id}
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
      'justify-content', 'align-items', 'text-align', 'line-height'
    ];
    
    importantStyles.forEach(prop => {
      const value = computedStyles.getPropertyValue(prop);
      if (value) {
        inlineStyles.push(`${prop}: ${value}`);
      }
    });
    
    if (inlineStyles.length > 0) {
      (element as HTMLElement).style.cssText += '; ' + inlineStyles.join('; ');
    }
  });
};
