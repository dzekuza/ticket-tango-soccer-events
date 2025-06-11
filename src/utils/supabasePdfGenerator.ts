
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
  console.log('🚀 Starting enhanced PDF generation for tickets:', {
    ticketCount: tickets.length,
    batchId: ticketBatch.id,
    userId: userId.substring(0, 8) + '...'
  });
  
  try {
    // Enhanced validation with detailed logging
    if (!tickets || tickets.length === 0) {
      console.error('❌ No tickets provided for PDF generation');
      throw new Error('No tickets provided for PDF generation');
    }

    if (!userId) {
      console.error('❌ User ID is required for PDF upload');
      throw new Error('User ID is required for PDF upload');
    }

    if (!ticketBatch) {
      console.error('❌ Ticket batch information is required');
      throw new Error('Ticket batch information is required');
    }

    console.log('✅ Validation passed, proceeding with enhanced PDF generation');
    console.log('📊 Ticket batch info:', {
      id: ticketBatch.id,
      title: ticketBatch.eventTitle,
      ticketCount: tickets.length,
      hasEnhancedData: !!(ticketBatch.homeTeam && ticketBatch.awayTeam)
    });

    // Validate each ticket has required data
    const validTickets = tickets.filter(ticket => {
      const isValid = ticket.id && ticket.eventTitle && typeof ticket.price === 'number';
      if (!isValid) {
        console.warn('⚠️ Invalid ticket found:', ticket);
      }
      return isValid;
    });

    if (validTickets.length !== tickets.length) {
      console.error(`❌ ${tickets.length - validTickets.length} invalid tickets found`);
      throw new Error(`Found ${tickets.length - validTickets.length} invalid tickets`);
    }

    console.log('🎯 All tickets validated successfully');

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.background = 'white';
    document.body.appendChild(container);

    // Generate enhanced HTML content for all tickets with page breaks
    console.log('🎨 Generating enhanced HTML content...');
    const ticketsHtml = validTickets.map((ticket, index) => {
      const addPageBreak = index < validTickets.length - 1;
      return createEnhancedTicketHTML(ticket, ticketBatch, addPageBreak);
    }).join('');

    container.innerHTML = ticketsHtml;

    // Apply all styles inline for PDF compatibility
    console.log('🎨 Applying enhanced inline styles...');
    await applyInlineStyles(container);

    // Configure PDF options for better quality and handling of multiple pages
    const pdfOptions = {
      margin: [8, 8, 8, 8],
      filename: `${ticketBatch.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_tickets.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2.5, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: 1123
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    console.log('📄 Generating enhanced PDF...');

    // Generate PDF blob with better error handling
    let pdfBlob;
    try {
      pdfBlob = await html2pdf().set(pdfOptions).from(container).outputPdf('blob');
    } catch (pdfError) {
      console.error('❌ Enhanced PDF generation failed:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    }
    
    console.log('✅ Enhanced PDF blob generated successfully, size:', pdfBlob.size, 'bytes');

    // Clean up DOM
    document.body.removeChild(container);

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Generated PDF is empty or invalid');
    }

    // Upload to Supabase storage with retry logic
    const fileName = `${userId}/${ticketBatch.id}_${Date.now()}.pdf`;
    console.log('☁️ Uploading enhanced PDF to storage path:', fileName);

    let uploadAttempts = 0;
    const maxAttempts = 3;
    
    while (uploadAttempts < maxAttempts) {
      try {
        const { data, error } = await supabase.storage
          .from('tickets')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          });

        if (error) {
          console.error(`❌ Storage upload attempt ${uploadAttempts + 1} failed:`, error);
          uploadAttempts++;
          if (uploadAttempts >= maxAttempts) {
            throw new Error(`Storage upload failed after ${maxAttempts} attempts: ${error.message}`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
          continue;
        }

        console.log('✅ Enhanced PDF uploaded successfully:', data);
        break;
      } catch (uploadError) {
        console.error(`❌ Upload attempt ${uploadAttempts + 1} error:`, uploadError);
        uploadAttempts++;
        if (uploadAttempts >= maxAttempts) {
          throw uploadError;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('tickets')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded PDF');
    }

    console.log('✅ Enhanced PDF public URL generated:', urlData.publicUrl);

    return {
      success: true,
      pdfUrl: urlData.publicUrl
    };

  } catch (error) {
    console.error('❌ Enhanced PDF generation and upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during PDF generation'
    };
  }
};

const createEnhancedTicketHTML = (
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
  const seatSection = (ticket as any)?.seatSection;
  const seatRow = (ticket as any)?.seatRow;
  const seatNumber = (ticket as any)?.seatNumber;

  // Enhanced event data
  const isEnhancedTicket = !!(ticketBatch.homeTeam && ticketBatch.awayTeam);
  const eventTitle = isEnhancedTicket 
    ? `${ticketBatch.homeTeam} vs ${ticketBatch.awayTeam}`
    : ticketBatch.eventTitle;

  // Seating information
  const hasSeating = seatSection && seatRow && seatNumber;
  const seatInfo = hasSeating ? `${seatSection} - Row ${seatRow} - Seat ${seatNumber}` : 'General Admission';

  return `
    <div style="
      ${addPageBreak ? 'page-break-after: always;' : ''}
      padding: 15px;
      margin: 0 auto;
      max-width: 650px;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      box-sizing: border-box;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    ">
      <div style="
        background: white;
        border: 3px solid #1e293b;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        position: relative;
        overflow: hidden;
      ">
        <!-- Decorative corner elements -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          clip-path: polygon(0 0, 100% 0, 0 100%);
        "></div>
        <div style="
          position: absolute;
          top: 0;
          right: 0;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #10b981, #047857);
          clip-path: polygon(0 0, 100% 0, 100% 100%);
        "></div>

        <!-- Header Section -->
        <div style="
          border-bottom: 3px dashed #cbd5e1;
          padding-bottom: 20px;
          margin-bottom: 20px;
          position: relative;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
          ">
            <div style="flex: 1; margin-right: 20px;">
              <h1 style="
                font-size: 28px;
                font-weight: bold;
                color: #1e293b;
                margin: 0 0 10px 0;
                line-height: 1.2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
              ">${eventTitle}</h1>
              
              ${ticketBatch.competition ? `
                <div style="
                  display: inline-block;
                  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                  color: white;
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  margin-bottom: 8px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">${ticketBatch.competition}</div>
              ` : ''}
              
              ${ticketBatch.description ? `
                <p style="
                  color: #64748b;
                  font-size: 14px;
                  margin: 0;
                  line-height: 1.5;
                ">${ticketBatch.description}</p>
              ` : ''}
            </div>
            
            <div style="
              text-align: right;
              background: linear-gradient(135deg, #10b981, #047857);
              color: white;
              padding: 15px 20px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            ">
              <div style="
                font-size: 32px;
                font-weight: bold;
                line-height: 1;
                margin-bottom: 4px;
              ">$${ticketPrice.toFixed(2)}</div>
              <div style="
                font-size: 11px;
                opacity: 0.9;
                text-transform: uppercase;
                letter-spacing: 1px;
              ">TICKET PRICE</div>
              ${tierName !== 'Standard' ? `
                <div style="
                  font-size: 10px;
                  background: rgba(255,255,255,0.2);
                  padding: 4px 8px;
                  border-radius: 8px;
                  margin-top: 8px;
                  text-transform: uppercase;
                  font-weight: 600;
                ">${tierName}</div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 160px;
          gap: 25px;
          margin-bottom: 20px;
          align-items: start;
        ">
          <!-- Event Details Section -->
          <div style="space-y: 15px;">
            <!-- Date and Time -->
            ${ticketBatch.eventDate ? `
              <div style="
                display: flex;
                align-items: center;
                background: #f8fafc;
                padding: 12px 15px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
                margin-bottom: 12px;
              ">
                <span style="
                  font-size: 18px;
                  margin-right: 12px;
                ">📅</span>
                <div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 2px;
                  ">Event Date</div>
                  <div style="
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e293b;
                  ">${new Date(ticketBatch.eventDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</div>
                </div>
              </div>
            ` : `
              <div style="
                display: flex;
                align-items: center;
                background: #f8fafc;
                padding: 12px 15px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
                margin-bottom: 12px;
              ">
                <span style="
                  font-size: 18px;
                  margin-right: 12px;
                ">📅</span>
                <div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 2px;
                  ">Created</div>
                  <div style="
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e293b;
                  ">${new Date(ticketBatch.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            `}
            
            <!-- Time -->
            ${ticketBatch.eventStartTime && ticketBatch.eventEndTime ? `
              <div style="
                display: flex;
                align-items: center;
                background: #f0f9ff;
                padding: 12px 15px;
                border-radius: 8px;
                border-left: 4px solid #0ea5e9;
                margin-bottom: 12px;
              ">
                <span style="
                  font-size: 18px;
                  margin-right: 12px;
                ">⏰</span>
                <div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 2px;
                  ">Event Time</div>
                  <div style="
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e293b;
                  ">${ticketBatch.eventStartTime} - ${ticketBatch.eventEndTime}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Venue -->
            ${ticketBatch.stadiumName ? `
              <div style="
                display: flex;
                align-items: center;
                background: #f0fdf4;
                padding: 12px 15px;
                border-radius: 8px;
                border-left: 4px solid #10b981;
                margin-bottom: 12px;
              ">
                <span style="
                  font-size: 18px;
                  margin-right: 12px;
                ">🏟️</span>
                <div>
                  <div style="
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 2px;
                  ">Venue</div>
                  <div style="
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e293b;
                  ">${ticketBatch.stadiumName}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Seating Information -->
            <div style="
              display: flex;
              align-items: center;
              background: #fefce8;
              padding: 12px 15px;
              border-radius: 8px;
              border-left: 4px solid #eab308;
              margin-bottom: 12px;
            ">
              <span style="
                font-size: 18px;
                margin-right: 12px;
              ">${hasSeating ? '🪑' : '🎫'}</span>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #374151;
                  margin-bottom: 2px;
                ">${hasSeating ? 'Assigned Seat' : 'Admission Type'}</div>
                <div style="
                  font-size: 16px;
                  font-weight: bold;
                  color: #1e293b;
                ">${seatInfo}</div>
              </div>
            </div>
            
            <!-- Ticket Information -->
            <div style="
              display: flex;
              align-items: center;
              background: #fdf2f8;
              padding: 12px 15px;
              border-radius: 8px;
              border-left: 4px solid #ec4899;
              margin-bottom: 12px;
            ">
              <span style="
                font-size: 18px;
                margin-right: 12px;
              ">🎫</span>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #374151;
                  margin-bottom: 2px;
                ">Ticket Number</div>
                <div style="
                  font-size: 16px;
                  font-weight: bold;
                  color: #1e293b;
                ">#${ticketNumber}</div>
              </div>
            </div>
            
            <!-- Ticket Status -->
            <div style="
              display: flex;
              align-items: center;
              background: ${isUsed ? '#fef2f2' : '#f0fdf4'};
              padding: 12px 15px;
              border-radius: 8px;
              border-left: 4px solid ${isUsed ? '#ef4444' : '#10b981'};
            ">
              <span style="
                font-size: 18px;
                margin-right: 12px;
              ">${isUsed ? '❌' : '✅'}</span>
              <div>
                <div style="
                  font-size: 14px;
                  font-weight: 600;
                  color: #374151;
                  margin-bottom: 2px;
                ">Status</div>
                <div style="
                  font-size: 16px;
                  font-weight: bold;
                  color: ${isUsed ? '#dc2626' : '#059669'};
                ">${isUsed ? 'VALIDATED' : 'VALID'}</div>
                ${validatedAt ? `
                  <div style="
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 4px;
                  ">
                    Validated: ${new Date(validatedAt).toLocaleString()}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <!-- QR Code Section -->
          <div style="
            text-align: center;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #cbd5e1;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          ">
            <div style="
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
              ${qrCodeImage ? `
                <img 
                  src="${qrCodeImage}" 
                  alt="QR Code" 
                  style="
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                    display: block;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                  " 
                />
              ` : `
                <div style="
                  width: 120px;
                  height: 120px;
                  background: linear-gradient(135deg, #f1f5f9, #cbd5e1);
                  margin: 0 auto;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  color: #64748b;
                  font-weight: 600;
                  border: 2px dashed #94a3b8;
                ">
                  QR CODE<br/>PLACEHOLDER
                </div>
              `}
            </div>
            <div style="
              font-size: 11px;
              color: #475569;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            ">SCAN TO VALIDATE</div>
            <div style="
              font-size: 10px;
              color: #64748b;
              line-height: 1.3;
            ">Present this code<br/>at venue entrance</div>
          </div>
        </div>

        <!-- Enhanced Footer Section -->
        <div style="
          border-top: 3px dashed #cbd5e1;
          padding-top: 20px;
          background: #f8fafc;
          margin: 0 -30px -30px -30px;
          padding-left: 30px;
          padding-right: 30px;
          padding-bottom: 20px;
          border-radius: 0 0 9px 9px;
        ">
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
          ">
            <div>
              <div style="
                font-size: 10px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 4px;
              ">Terms & Conditions</div>
              <div style="
                font-size: 9px;
                color: #64748b;
                line-height: 1.3;
              ">Non-transferable unless<br/>explicitly authorized</div>
            </div>
            
            <div>
              <div style="
                font-size: 10px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 4px;
              ">Support</div>
              <div style="
                font-size: 9px;
                color: #64748b;
                line-height: 1.3;
              ">Contact venue for<br/>assistance</div>
            </div>
            
            <div>
              <div style="
                font-size: 10px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 4px;
              ">Entry Instructions</div>
              <div style="
                font-size: 9px;
                color: #64748b;
                line-height: 1.3;
              ">Arrive 30 mins early<br/>for security screening</div>
            </div>
          </div>
          
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
          ">
            <div style="
              font-size: 10px;
              color: #64748b;
              font-weight: 500;
            ">
              Generated by TicketManager Pro
            </div>
            <div style="
              font-size: 9px;
              color: #94a3b8;
              font-family: 'Courier New', monospace;
              background: white;
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid #e2e8f0;
            ">
              ID: ${ticketId.slice(-12)}
            </div>
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
      'justify-content', 'align-items', 'text-align', 'line-height', 'width', 'height',
      'background', 'box-shadow', 'text-transform', 'letter-spacing', 'opacity'
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
