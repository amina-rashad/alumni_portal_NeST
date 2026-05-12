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
