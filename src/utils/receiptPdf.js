const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_LEFT = 40;
const START_Y = 800;
const LINE_HEIGHT = 16;
const MAX_CHARS = 74;
const LINES_PER_PAGE = 45;

const formatCurrency = (amount) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const sanitizeText = (value) => String(value ?? '')
  .replace(/\r?\n|\r/g, ' ')
  .replace(/[^\x20-\x7E]/g, '?')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)');

const wrapText = (value, maxChars = MAX_CHARS) => {
  const text = String(value ?? '').trim();
  if (!text) return ['N/A'];

  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    if (!current) {
      current = word;
      return;
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
      return;
    }

    lines.push(current);
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

const padRight = (value, width) => {
  const trimmed = String(value ?? '').slice(0, width);
  return trimmed.padEnd(width, ' ');
};

const padLeft = (value, width) => {
  const trimmed = String(value ?? '').slice(0, width);
  return trimmed.padStart(width, ' ');
};

const buildReceiptLines = (booking) => {
  const receiptNumber = `RCT-${String(booking?._id || 'UNKNOWN').slice(-8).toUpperCase()}`;
  const paymentReference = booking?.paymentId || booking?.paymentOrderId || 'Pending';
  const bookingReference = booking?._id || 'N/A';
  const paymentMode = booking?.paymentMode === 'demo' ? 'Demo' : 'Razorpay';
  const items = Array.isArray(booking?.items) ? booking.items : [];

  const lines = [
    'Furnish & Co.',
    'Booking Payment Receipt',
    ''.padEnd(74, '='),
    `Receipt No: ${receiptNumber}`,
    `Receipt Date: ${formatDate(booking?.paidAt || booking?.createdAt || new Date())}`,
    `Booking ID: ${bookingReference}`,
    `Payment Reference: ${paymentReference}`,
    `Payment Mode: ${paymentMode}`,
    `Payment Status: ${booking?.paymentStatus || 'N/A'}`,
    ''.padEnd(74, '-'),
    'Customer Details',
    ...wrapText(`Name: ${booking?.customerName || 'N/A'}`),
    ...wrapText(`Phone: ${booking?.phone || 'N/A'}`),
    ...wrapText(`Address: ${booking?.address || 'N/A'}`),
    ...wrapText(`Rental Start Date: ${formatDate(booking?.startDate || booking?.eventDate)}`),
    ...wrapText(`Rental End Date: ${formatDate(booking?.endDate)}`),
    ...(booking?.additionalRequirements
      ? wrapText(`Additional Requirements: ${booking.additionalRequirements}`)
      : []),
    ''.padEnd(74, '-'),
    'Booked Items',
    padRight('Item', 40) + padLeft('Qty', 6) + padLeft('Rate', 12) + padLeft('Amount', 16),
    ''.padEnd(74, '-')
  ];

  if (items.length === 0) {
    lines.push('No items available.');
  } else {
    items.forEach((item) => {
      const itemNameLines = wrapText(item?.name || 'Unnamed Item', 40);
      const quantity = String(item?.quantity || 0);
      const rate = formatCurrency(item?.price || 0);
      const amount = formatCurrency((item?.price || 0) * (item?.quantity || 0));

      itemNameLines.forEach((itemLine, index) => {
        if (index === 0) {
          lines.push(
            padRight(itemLine, 40) +
            padLeft(quantity, 6) +
            padLeft(rate, 12) +
            padLeft(amount, 16)
          );
        } else {
          lines.push(itemLine);
        }
      });
    });
  }

  lines.push(
    ''.padEnd(74, '-'),
    padRight('Total Booking Amount', 58) + padLeft(formatCurrency(booking?.totalPrice || 0), 16),
    padRight('Advance Paid', 58) + padLeft(formatCurrency(booking?.advanceAmount || 0), 16),
    padRight('Remaining Balance', 58) + padLeft(formatCurrency(booking?.remainingAmount || 0), 16),
    ''.padEnd(74, '-'),
    'Thank you for booking with Furnish & Co.',
    'Please keep this receipt for your records.'
  );

  return lines;
};

const createPdfContentStream = (lines) => {
  const sanitizedLines = lines.map((line) => `(${sanitizeText(line)}) Tj`);
  const stream = [
    'BT',
    '/F1 12 Tf',
    `${LINE_HEIGHT} TL`,
    `${MARGIN_LEFT} ${START_Y} Td`,
    sanitizedLines.join('\nT*\n'),
    'ET'
  ].join('\n');

  return `${stream}\n`;
};

const buildPdfDocument = (pages) => {
  const fontObjectId = 3;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  ];

  const pageObjectIds = pages.map((_, index) => 4 + (index * 2));
  const contentObjectIds = pages.map((_, index) => 5 + (index * 2));

  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>\nendobj\n`
  );

  objects.push(
    `${fontObjectId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`
  );

  pages.forEach((pageLines, index) => {
    const pageObjectId = pageObjectIds[index];
    const contentObjectId = contentObjectIds[index];
    const contentStream = createPdfContentStream(pageLines);
    const contentLength = new TextEncoder().encode(contentStream).length;

    objects.push(
      `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`
    );

    objects.push(
      `${contentObjectId} 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}endstream\nendobj\n`
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${offsets.length}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

export const downloadBookingReceiptPdf = (booking) => {
  const lines = buildReceiptLines(booking);
  const pages = [];

  for (let index = 0; index < lines.length; index += LINES_PER_PAGE) {
    pages.push(lines.slice(index, index + LINES_PER_PAGE));
  }

  const pdfText = buildPdfDocument(pages);
  const pdfBlob = new Blob([new TextEncoder().encode(pdfText)], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  const bookingRef = String(booking?._id || 'booking').slice(-8).toLowerCase();

  link.href = downloadUrl;
  link.download = `booking-receipt-${bookingRef}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
};
