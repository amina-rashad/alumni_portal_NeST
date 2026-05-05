import { jsPDF } from 'jspdf';

export const generateEventCertificate = (participantName: string, eventName: string, date: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── BRAND COLORS ──
  const nestRed = [227, 30, 36];   // #E31E24
  const nestNavy = [27, 54, 93];   // #1B365D
  const goldAccent = [199, 160, 81];

  // ── BACKGROUND & BORDER ──
  // Luxury Navy Outer Border
  doc.setFillColor(27, 54, 93); 
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Gold Inner Border
  doc.setDrawColor(199, 160, 81);
  doc.setLineWidth(1.5);
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14, 'S');

  // White Certificate Area
  doc.setFillColor(255, 255, 255);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'F');

  // Decorative Corner Accents
  doc.setFillColor(199, 160, 81);
  doc.triangle(12, 12, 42, 12, 12, 42, 'F'); // Top Left
  doc.triangle(pageWidth - 12, 12, pageWidth - 42, 12, pageWidth - 12, 42, 'F'); // Top Right
  doc.triangle(12, pageHeight - 12, 42, pageHeight - 12, 12, pageHeight - 42, 'F'); // Bottom Left
  doc.triangle(pageWidth - 12, pageHeight - 12, pageWidth - 42, pageHeight - 12, pageWidth - 12, pageHeight - 42, 'F'); // Bottom Right

  // ── HEADER ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  
  const nestText = "NeST";
  const digitalText = "DIGITAL";
  
  // Calculate exact widths for centering
  const nestWidth = doc.getTextWidth(nestText);
  const digitalWidth = doc.getTextWidth(digitalText);
  const spacing = 4; // Space between NeST and DIGITAL
  const totalHeaderWidth = nestWidth + digitalWidth + spacing;
  const headerStartX = (pageWidth - totalHeaderWidth) / 2;

  // Draw Header Text
  doc.setTextColor(227, 30, 36); // NeST Red
  doc.text(nestText, headerStartX, 35);
  
  doc.setTextColor(27, 54, 93); // NeST Navy
  doc.text(digitalText, headerStartX + nestWidth + spacing, 35);

  // Red accent line - centered with text
  doc.setDrawColor(227, 30, 36);
  doc.setLineWidth(1);
  doc.line(headerStartX, 40, headerStartX + totalHeaderWidth, 40);

  // Tagline - precisely centered
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("ENGINEERING TRANSFORMATION", pageWidth / 2, 47, { align: 'center', charSpace: 1 });

  // ── MAIN CONTENT ──
  doc.setTextColor(27, 54, 93);
  doc.setFont("times", "normal");
  doc.setFontSize(48);
  doc.text("CERTIFICATE", pageWidth / 2, 75, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("OF PARTICIPATION", pageWidth / 2, 87, { align: 'center', charSpace: 3 });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("This certificate is proudly presented to", pageWidth / 2, 105, { align: 'center' });

  // Participant Name
  doc.setTextColor(27, 54, 93);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(40);
  doc.text(participantName, pageWidth / 2, 122, { align: 'center' });

  // Elegant line under name
  doc.setDrawColor(199, 160, 81);
  doc.setLineWidth(1.2);
  doc.line(pageWidth / 2 - 80, 128, pageWidth / 2 + 80, 128);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("for successfully participating in the event", pageWidth / 2, 142, { align: 'center' });

  // Event Name
  doc.setTextColor(227, 30, 36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(eventName, pageWidth / 2, 158, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`held on ${date}`, pageWidth / 2, 168, { align: 'center' });

  // ── FOOTER / SIGNATURES ──
  doc.setDrawColor(27, 54, 93);
  doc.setLineWidth(0.5);
  
  // Repositioned to avoid badge overlap
  const signatureY = 192;
  const labelY = 197;
  const companyY = 202;

  // Left Signature
  doc.line(40, signatureY, 95, signatureY);
  doc.setTextColor(27, 54, 93);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Event Coordinator", 67.5, labelY, { align: 'center' });
  doc.setFont("helvetica", "normal");
  doc.text("NeST Alumni Association", 67.5, companyY, { align: 'center' });

  // Right Signature
  doc.line(pageWidth - 95, signatureY, pageWidth - 40, signatureY);
  doc.setFont("helvetica", "bold");
  doc.text("HR Department", pageWidth - 67.5, labelY, { align: 'center' });
  doc.setFont("helvetica", "normal");
  doc.text("NeST Digital", pageWidth - 67.5, companyY, { align: 'center' });

  // Verified Badge - Shifted up slightly
  doc.setDrawColor(199, 160, 81);
  doc.setLineWidth(0.3);
  doc.circle(pageWidth / 2, 185, 15, 'S');
  doc.setFontSize(8);
  doc.setTextColor(199, 160, 81);
  doc.text("OFFICIAL", pageWidth / 2, 181, { align: 'center' });
  doc.text("VERIFIED", pageWidth / 2, 185, { align: 'center' });
  doc.text("CREDENTIAL", pageWidth / 2, 189, { align: 'center' });

  // Save the PDF
  doc.save(`${participantName.replace(/\s+/g, '_')}_Certificate.pdf`);
};
