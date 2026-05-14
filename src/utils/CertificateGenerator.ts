import jsPDF from 'jspdf';
import { NEST_OVAL_LOGO, CERTIFICATE_BG, EVENT_CERTIFICATE_BG } from './LogoBase64';

export const generateEventCertificate = (participantName: string, eventName: string, date: string) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // ── 1. BACKGROUND (DYNAMIC RED & BLUE GEOMETRIC) ──
    try {
      doc.addImage(EVENT_CERTIFICATE_BG, 'PNG', 0, 0, pageWidth, pageHeight);
    } catch (e) {
      console.error("BG Load Error:", e);
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // ── 2. OFFICIAL NeST LOGO (Top Left - Blended) ──
    try {
      // Placing logo in the top-left area, integrated with the white space
      doc.addImage(NEST_OVAL_LOGO, 'PNG', 25, 20, 35, 21);
    } catch (e) {
      console.error("Logo Load Error:", e);
    }

    // ── 3. HEADER (Centered & Bold) ──
    doc.setTextColor(20, 40, 80); // Professional Deep Blue
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("CERTIFICATE", centerX, 65, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("OF PARTICIPATION", centerX, 75, { align: 'center' });

    // ── 4. BODY CONTENT (Centered) ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("PROUDLY PRESENTED TO", centerX, 100, { align: 'center' });

    // Participant Name (Elegant Large Script)
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "italic");
    doc.setFontSize(60);
    doc.text(participantName, centerX, 125, { align: 'center' });

    // Divider Line (Subtle)
    doc.setDrawColor(200, 200, 200);
    doc.line(centerX - 50, 130, centerX + 50, 130);

    // Achievement details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const description = `FOR SUCCESSFULLY PARTICIPATING IN THE EVENT\n${eventName.toUpperCase()}\nHELD ON ${date.toUpperCase()} AT NeST TECH PARK`;
    doc.text(description, centerX, 145, { align: 'center', maxWidth: 160 });

    doc.save(`${participantName.replace(/\s+/g, '_')}_Event_Certificate.pdf`);
  } catch (err) {
    console.error(err);
    alert("Generation failed: " + (err instanceof Error ? err.message : "Unknown error"));
  }
};

export const generateCourseCertificate = (participantName: string, courseName: string, date: string) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // ── 1. BACKGROUND (DYNAMIC RED & BLUE GEOMETRIC) ──
    try {
      doc.addImage(CERTIFICATE_BG, 'PNG', 0, 0, pageWidth, pageHeight);
    } catch (e) {
      console.error("BG Load Error:", e);
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // ── 2. LOGO (Top Left - Blended) ──
    try {
      doc.addImage(NEST_OVAL_LOGO, 'PNG', 25, 20, 35, 21);
    } catch (e) {
      console.error("Logo Load Error:", e);
    }

    // ── 3. HEADER (Centered) ──
    doc.setTextColor(20, 40, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("CERTIFICATE", centerX, 65, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("OF COMPLETION", centerX, 75, { align: 'center' });

    // ── 4. BODY CONTENT (Centered) ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("PROUDLY PRESENTED TO", centerX, 100, { align: 'center' });

    // Participant Name (Elegant Script)
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "italic");
    doc.setFontSize(60);
    doc.text(participantName, centerX, 125, { align: 'center' });

    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(centerX - 50, 130, centerX + 50, 130);

    // Achievement details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const description = `HAS SUCCESSFULLY COMPLETED THE TRAINING COURSE IN\n${courseName.toUpperCase()}\nCONDUCTED BY NeST DIGITAL ACADEMY ON ${date.toUpperCase()}`;
    doc.text(description, centerX, 145, { align: 'center', maxWidth: 160 });

    doc.save(`${participantName.replace(/\s+/g, '_')}_Course_Certificate.pdf`);
  } catch (err) {
    console.error(err);
    alert("Generation failed: " + (err instanceof Error ? err.message : "Unknown error"));
  }
};

const drawGeometricDesign = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  // Navy Shape (Bottom Right)
  doc.setFillColor(26, 38, 82); // Navy
  doc.triangle(pageWidth, pageHeight, pageWidth - 60, pageHeight, pageWidth, pageHeight - 120, 'F');
  
  // Red Shape (Middle Right)
  doc.setFillColor(200, 16, 46); // Red
  doc.triangle(pageWidth, 80, pageWidth - 40, 140, pageWidth, 200, 'F');
  
  // Navy Accent (Top Right)
  doc.setFillColor(26, 38, 82); // Navy
  doc.triangle(pageWidth, 0, pageWidth - 30, 0, pageWidth, 60, 'F');
  
  // Subtle Background Pattern (Optional - simple dots or lines)
  doc.setDrawColor(240, 240, 240);
  for(let i = 0; i < pageWidth; i += 10) {
    doc.line(i, 0, i, 5);
  }
};

const createIVPDF = (participantName: string, batch: string, date: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // 1. BACKGROUND (Clean White with Geometry)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  drawGeometricDesign(doc, pageWidth, pageHeight);

  // 2. LOGO (Top Left)
  try {
    doc.addImage(NEST_OVAL_LOGO, 'PNG', 20, 15, 30, 18);
  } catch (e) {
    console.error("Logo Error:", e);
  }

  // 3. HEADER
  doc.setTextColor(26, 38, 82); // Navy
  doc.setFont("helvetica", "bold");
  doc.setFontSize(42);
  doc.text("Certificate", 40, 65);
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("OF INDUSTRIAL VISIT", 40, 75);

  // 4. BODY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text("PROUDLY PRESENTED TO:", 40, 105);

  // Name
  doc.setTextColor(26, 38, 82);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(48);
  doc.text(participantName.toUpperCase(), 40, 125);
  
  // Underline
  doc.setDrawColor(26, 38, 82);
  doc.setLineWidth(1);
  doc.line(40, 130, 180, 130);

  // Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  const desc = `This is to certify that the above mentioned student of Batch ${batch} has successfully completed the Industrial Visit Program at NeST Digital Tech Park on ${date}.`;
  const lines = doc.splitTextToSize(desc, 140);
  doc.text(lines, 40, 145);

  // Seal / Badge (Optional simulation)
  doc.setDrawColor(218, 165, 32); // Gold
  doc.setLineWidth(0.5);
  doc.circle(pageWidth - 60, 150, 15, 'S');
  doc.setFontSize(8);
  doc.text("OFFICIAL\nSEAL", pageWidth - 60, 149, { align: 'center' });

  return doc;
};

export const generateIVCertificate = (participantName: string, batch: string, date: string) => {
  try {
    const doc = createIVPDF(participantName, batch, date);
    doc.save(`${participantName.replace(/\s+/g, '_')}_IV_Certificate.pdf`);
  } catch (err) {
    console.error(err);
    alert("Generation failed");
  }
};

export const getIVCertificatePDF = (participantName: string, batch: string, date: string) => {
  return createIVPDF(participantName, batch, date);
};


