
import html2pdf from 'html2pdf.js';
import { IndividualTicket, Ticket } from '@/components/Dashboard';

export interface PDFOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
}

export const generateTicketPDF = async (
  tickets: IndividualTicket[],
  ticketBatch: Ticket,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    filename = `${ticketBatch.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_tickets.pdf`,
    format = 'a4',
    orientation = 'portrait',
    margin = 10
  } = options;

  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  document.body.appendChild(container);

  try {
    // Generate HTML for each ticket
    tickets.forEach((ticket, index) => {
      const ticketElement = createTicketElement(ticket, ticketBatch, index < tickets.length - 1);
      container.appendChild(ticketElement);
    });

    // Configure PDF options
    const pdfOptions = {
      margin,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: 'mm', 
        format, 
        orientation 
      }
    };

    // Generate PDF
    await html2pdf().set(pdfOptions).from(container).save();
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

const createTicketElement = (
  ticket: IndividualTicket,
  ticketBatch: Ticket,
  addPageBreak: boolean
): HTMLElement => {
  const ticketDiv = document.createElement('div');
  ticketDiv.style.pageBreakAfter = addPageBreak ? 'always' : 'auto';
  ticketDiv.style.padding = '20px';
  ticketDiv.style.margin = '0 auto';
  ticketDiv.style.maxWidth = '600px';

  ticketDiv.innerHTML = `
    <div style="
      background: white;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      font-family: system-ui, -apple-system, sans-serif;
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
        <div style="space-y: 12px;">
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
  `;

  return ticketDiv;
};
