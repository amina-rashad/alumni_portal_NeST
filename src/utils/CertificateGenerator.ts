import jsPDF from 'jspdf';
import { NEST_OVAL_LOGO, CERTIFICATE_BG, EVENT_CERTIFICATE_BG } from './LogoBase64';

export const formatCertificateDate = (rawDate?: string | Date | null): string => {
  if (!rawDate) {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (rawDate instanceof Date) {
    return rawDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const str = String(rawDate).trim();
  if (!str) {
    return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // 1. Try standard Date parsing directly (handles ISO '2026-10-23T...', 'YYYY-MM-DD', 'YYYY/MM/DD', US 'MM/DD/YYYY')
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2000 && parsed.getFullYear() <= 2099) {
    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // 2. Delimiter parsing for non-standard formats (e.g. DD-MM-YYYY or DD/MM/YYYY)
  const cleanDateStr = str.includes('T') ? str.split('T')[0] : str.includes(' ') ? str.split(' ')[0] : str;
  const parts = cleanDateStr.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } else if (parts[2].length === 4) {
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      
      let d = p0;
      let m = p1 - 1;
      // If p1 > 12, then p1 is day and p0 is month (MM/DD/YYYY)
      if (p1 > 12 && p0 <= 12) {
        m = p0 - 1;
        d = p1;
      }
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    }
  }

  return cleanDateStr;
};

export interface EventTemplatePDFOptions {
  participantName: string;
  subHeader: string;
  description: string;
  certificateId?: string;
}

export const createEventTemplatePDF = (options: EventTemplatePDFOptions): jsPDF => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // ── 1. BACKGROUND (DYNAMIC RED & BLUE GEOMETRIC TEMPLATE) ──
  try {
    doc.addImage(EVENT_CERTIFICATE_BG, 'PNG', 0, 0, pageWidth, pageHeight);
  } catch (e) {
    console.error("BG Load Error:", e);
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  // ── 2. OFFICIAL NeST LOGO (Top Left - Blended) ──
  try {
    doc.addImage(NEST_OVAL_LOGO, 'PNG', 25, 20, 35, 21);
  } catch (e) {
    console.error("Logo Load Error:", e);
  }

  // ── 3. HEADER (Centered & Bold Deep Navy) ──
  doc.setTextColor(20, 40, 80); // Professional Deep Blue (#142850)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("CERTIFICATE", centerX, 65, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(options.subHeader.toUpperCase(), centerX, 75, { align: 'center' });

  // ── 4. BODY CONTENT (Centered) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text("PROUDLY PRESENTED TO", centerX, 100, { align: 'center' });

  // Participant Name (Elegant Script - Times Italic)
  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "italic");
  const rawName = (options.participantName || 'Participant').trim();
  let nameFontSize = 56;
  if (rawName.length > 28) {
    nameFontSize = 38;
  } else if (rawName.length > 20) {
    nameFontSize = 46;
  }
  doc.setFontSize(nameFontSize);
  doc.text(rawName, centerX, 125, { align: 'center' });

  // Divider Line (Subtle)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.6);
  doc.line(centerX - 55, 130, centerX + 55, 130);

  // Achievement details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(options.description, centerX, 145, { align: 'center', maxWidth: 165 });

  // Credential ID (if provided)
  if (options.certificateId) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(`CREDENTIAL ID: ${options.certificateId.toUpperCase()}`, centerX, 175, { align: 'center' });
  }

  return doc;
};

// ── 1. EVENT CERTIFICATE ──
export const generateEventCertificate = (participantName: string, eventName: string, date: string) => {
  try {
    const cleanDate = formatCertificateDate(date);
    const description = `FOR SUCCESSFULLY PARTICIPATING IN THE EVENT\n${(eventName || 'EVENT').toUpperCase()}\nHELD ON ${cleanDate.toUpperCase()} AT NeST TECH PARK`;
    const doc = createEventTemplatePDF({
      participantName,
      subHeader: 'OF PARTICIPATION',
      description
    });
    doc.save(`${(participantName || 'Participant').replace(/\s+/g, '_')}_Event_Certificate.pdf`);
  } catch (err) {
    console.error(err);
    alert("Generation failed: " + (err instanceof Error ? err.message : "Unknown error"));
  }
};

// ── 2. COURSE CERTIFICATE (Clean Event Template Format) ──
export const createCoursePDF = (participantName: string, courseName: string, date: string, certificateId?: string): jsPDF => {
  const cleanDate = formatCertificateDate(date);
  const description = `FOR SUCCESSFULLY COMPLETING THE COURSE\n${(courseName || 'COURSE PROGRAM').toUpperCase()}\nCOMPLETED ON ${cleanDate.toUpperCase()} AT NeST DIGITAL TECH PARK`;
  return createEventTemplatePDF({
    participantName,
    subHeader: 'OF COMPLETION',
    description,
    certificateId
  });
};

export const createCourseIVPDF = (participantName: string, courseName: string, date: string, certificateId?: string): jsPDF => {
  return createCoursePDF(participantName, courseName, date, certificateId);
};

export const generateCourseCertificate = (participantName: string, courseName: string, date: string, certificateId?: string) => {
  try {
    const doc = createCoursePDF(participantName, courseName, date, certificateId);
    doc.save(`${(participantName || 'Learner').replace(/\s+/g, '_')}_${(courseName || 'Course').replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`);
  } catch (err) {
    console.error(err);
    alert("Generation failed: " + (err instanceof Error ? err.message : "Unknown error"));
  }
};

export const generateCourseIVCertificate = (participantName: string, courseName: string, date: string, certificateId?: string) => {
  generateCourseCertificate(participantName, courseName, date, certificateId);
};

export const getCourseIVCertificatePDF = (participantName: string, courseName: string, date: string, certificateId?: string): jsPDF => {
  return createCourseIVPDF(participantName, courseName, date, certificateId);
};

// ── 3. INDUSTRIAL VISIT (IV) CERTIFICATE (Clean Event Template Format) ──
const createIVPDF = (participantName: string, batch?: string, date?: string): jsPDF => {
  const cleanDate = formatCertificateDate(date);
  const description = `FOR SUCCESSFULLY PARTICIPATING IN THE INDUSTRIAL VISIT\nHELD ON ${cleanDate.toUpperCase()} AT NeST TECH PARK`;

  return createEventTemplatePDF({
    participantName,
    subHeader: 'OF INDUSTRIAL VISIT',
    description
  });
};

export const generateIVCertificate = (participantName: string, batch: string, date: string) => {
  try {
    const doc = createIVPDF(participantName, batch, date);
    doc.save(`${(participantName || 'Student').replace(/\s+/g, '_')}_IV_Certificate.pdf`);
  } catch (err) {
    console.error(err);
    alert("Generation failed");
  }
};

export const getIVCertificatePDF = (participantName: string, batch: string, date: string): jsPDF => {
  return createIVPDF(participantName, batch, date);
};

// ── 4. JOB / PROFESSIONAL CERTIFICATE ──
export const generateJobCertificate = (participantName: string, role: string, company: string, date: string) => {
  try {
    const cleanDate = formatCertificateDate(date);
    const description = `IN RECOGNITION OF OUTSTANDING PERFORMANCE AND COMPLETION OF ROLE AS\n${(role || 'ROLE').toUpperCase()}\nAT ${(company || 'NeST DIGITAL').toUpperCase()} ON ${cleanDate.toUpperCase()}`;
    const doc = createEventTemplatePDF({
      participantName,
      subHeader: 'OF PROFESSIONAL EXCELLENCE',
      description
    });
    doc.save(`${(participantName || 'Employee').replace(/\s+/g, '_')}_Job_Certificate.pdf`);
  } catch (err) {
    console.error(err);
  }
};
