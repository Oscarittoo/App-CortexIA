import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

class PDFExportService {
  constructor() {
    this.defaultOptions = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
      compress: true,
    };

    this.colors = {
      primary: [99, 102, 241],
      secondary: [108, 117, 125],
      success: [16, 185, 129],
      warning: [245, 158, 11],
      error: [239, 68, 68],
      text: [26, 26, 26],
      textLight: [108, 117, 125],
      border: [233, 236, 239],
    };
  }

  exportSession(session, options = {}) {
    const doc = new jsPDF(this.defaultOptions);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    this.addHeader(doc, pageWidth, yPos);
    yPos += 25;

    this.addSessionInfo(doc, session, pageWidth, yPos);
    yPos += 30;

    if (session.summary) {
      yPos = this.addSection(doc, 'Summary', session.summary, pageWidth, yPos, pageHeight);
    }

    if (session.keyPoints && session.keyPoints.length > 0) {
      yPos = this.addKeyPoints(doc, session.keyPoints, pageWidth, yPos, pageHeight);
    }

    if (session.actions && session.actions.length > 0) {
      yPos = this.addActions(doc, session.actions, pageWidth, yPos, pageHeight);
    }

    if (session.decisions && session.decisions.length > 0) {
      yPos = this.addDecisions(doc, session.decisions, pageWidth, yPos, pageHeight);
    }

    if (session.participants && session.participants.length > 0) {
      yPos = this.addParticipants(doc, session.participants, pageWidth, yPos, pageHeight);
    }

    if (session.transcript && session.transcript.length > 0) {
      yPos = this.addTranscript(doc, session.transcript, pageWidth, yPos, pageHeight);
    }

    this.addFooter(doc, pageWidth, pageHeight);

    const fileName = `${session.title.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(session.createdAt), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);

    return fileName;
  }

  addHeader(doc, pageWidth, yPos) {
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text('Cortex AI', pageWidth / 2, yPos, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colors.textLight);
    doc.text('Meeting Report', pageWidth / 2, yPos + 6, { align: 'center' });
  }

  addSessionInfo(doc, session, pageWidth, yPos) {
    const leftMargin = 20;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.text);
    doc.text(session.title, leftMargin, yPos);
    
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colors.textLight);
    
    const dateStr = format(new Date(session.createdAt), "d MMMM yyyy 'at' HH:mm", { locale: fr });
    doc.text(`Date: ${dateStr}`, leftMargin, yPos);
    
    if (session.duration) {
      const duration = Math.floor(session.duration / 60);
      doc.text(`Duration: ${duration} min`, leftMargin + 70, yPos);
    }
    
    if (session.tags && session.tags.length > 0) {
      yPos += 6;
      doc.setFontSize(9);
      doc.text(`Tags: ${session.tags.join(', ')}`, leftMargin, yPos);
    }
  }

  addSection(doc, title, content, pageWidth, yPos, pageHeight) {
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text(title, leftMargin, yPos);
    
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colors.text);
    
    const lines = doc.splitTextToSize(content, rightMargin - leftMargin);
    lines.forEach(line => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, leftMargin, yPos);
      yPos += 5;
    });
    
    return yPos + 5;
  }

  addKeyPoints(doc, keyPoints, pageWidth, yPos, pageHeight) {
    const leftMargin = 20;
    
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text('Key Points', leftMargin, yPos);
    
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colors.text);
    
    keyPoints.forEach((point, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(...this.colors.primary);
      doc.circle(leftMargin + 2, yPos - 1.5, 1, 'F');
      
      const lines = doc.splitTextToSize(point, pageWidth - leftMargin - 30);
      doc.text(lines, leftMargin + 6, yPos);
      yPos += lines.length * 5 + 2;
    });
    
    return yPos + 5;
  }

  addActions(doc, actions, pageWidth, yPos, pageHeight) {
    const leftMargin = 20;
    
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text('Action Items', leftMargin, yPos);
    
    yPos += 10;
    
    const tableData = actions.map(action => [
      action.action || action.text || '',
      action.responsible || 'Not assigned',
      action.priority || 'Medium',
      action.deadline || 'No deadline',
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Action', 'Responsible', 'Priority', 'Deadline']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.colors.text,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: leftMargin, right: leftMargin },
    });
    
    return doc.lastAutoTable.finalY + 10;
  }

  addDecisions(doc, decisions, pageWidth, yPos, pageHeight) {
    const leftMargin = 20;
    
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text('Decisions', leftMargin, yPos);
    
    yPos += 10;
    
    const tableData = decisions.map(decision => [
      decision.decision || decision.text || '',
      decision.impact || 'Medium',
      decision.category || 'General',
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Decision', 'Impact', 'Category']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.colors.text,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      margin: { left: leftMargin, right: leftMargin },
    });
    
    return doc.lastAutoTable.finalY + 10;
  }

  addParticipants(doc, participants, pageWidth, yPos, pageHeight) {
    const leftMargin = 20;
    
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text('Participants', leftMargin, yPos);
    
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colors.text);
    doc.text(participants.join(', '), leftMargin, yPos);
    
    return yPos + 10;
  }

  addTranscript(doc, transcript, pageWidth, yPos, pageHeight) {
    const leftMargin = 20;
    const rightMargin = pageWidth - 20;
    
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.primary);
    doc.text('Full Transcript', leftMargin, yPos);
    
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colors.text);
    
    transcript.forEach(item => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      const text = typeof item === 'string' ? item : (item.text || '');
      const lines = doc.splitTextToSize(text, rightMargin - leftMargin);
      
      lines.forEach(line => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, leftMargin, yPos);
        yPos += 4;
      });
      
      yPos += 1;
    });
    
    return yPos;
  }

  addFooter(doc, pageWidth, pageHeight) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...this.colors.textLight);
      
      doc.text(
        `Generated by Cortex AI - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  exportMultipleSessions(sessions, options = {}) {
    const doc = new jsPDF(this.defaultOptions);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    this.addHeader(doc, pageWidth, 20);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colors.text);
    doc.text('Sessions Summary', pageWidth / 2, 40, { align: 'center' });
    
    const tableData = sessions.map(session => [
      session.title,
      format(new Date(session.createdAt), 'dd/MM/yyyy'),
      session.duration ? `${Math.floor(session.duration / 60)} min` : 'N/A',
      session.tags ? session.tags.join(', ') : '',
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [['Title', 'Date', 'Duration', 'Tags']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.colors.text,
      },
    });
    
    this.addFooter(doc, pageWidth, pageHeight);
    
    const fileName = `Sessions_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    
    return fileName;
  }
}

const pdfExportService = new PDFExportService();
export default pdfExportService;
