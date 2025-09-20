import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Incidents, IncidentActionTypesQuestions } from '../../../slices/incidentSlice/incident';
import { Client } from '../../../slices/clientSlice/client';
import { Employee } from '../../../slices/employeeSlice/employee';
import dayjs from 'dayjs';

interface ReportMetadata {
  incidentType: string;
  incidentStatus: string;
  client: Client | null;
  employee: Employee | null;
  questions: IncidentActionTypesQuestions[];
  signatureData?: string | null;
  signatureType?: 'draw' | 'upload' | null;
}

// Helper function to convert image to base64 and get dimensions
const getImageBase64 = (imagePath: string): Promise<{ data: string; width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve({
        data: canvas.toDataURL('image/png'),
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      // Fallback if image fails to load
      resolve({ data: '', width: 0, height: 0 });
    };
    img.src = imagePath;
  });
};

export const generateIncidentPDF = async (
  incident: Incidents,
  metadata: ReportMetadata
): Promise<void> => {
  console.log('PDF Generation - Starting with metadata:', metadata);
  console.log('PDF Generation - Signature data present:', !!metadata.signatureData);
  console.log('PDF Generation - Signature type:', metadata.signatureType);
  console.log('PDF Generation - Signature data length:', metadata.signatureData?.length || 0);
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Try to load the logo
  let logoBase64 = '';
  let logoWidth = 0;
  let logoHeight = 0;
  try {
    const logoData = await getImageBase64('/orgLogo.png');
    logoBase64 = logoData.data;
    logoWidth = logoData.width;
    logoHeight = logoData.height;
  } catch (error) {
    console.warn('Could not load logo for PDF:', error);
  }

  // Helper function to add header with logo on each page
  const addHeader = (pageNumber: number) => {
    // Add logo if available with proper aspect ratio
    if (logoBase64 && logoWidth > 0 && logoHeight > 0) {
      try {
        // Calculate proper dimensions to maintain aspect ratio
        // Use a smaller height for header placement
        const targetHeight = 15; // Smaller size for header
        const targetWidth = (targetHeight * logoWidth) / logoHeight; // Maintain aspect ratio
        
        // Position logo in header area (top-right, smaller size)
        const logoX = pageWidth - targetWidth - margin;
        const logoY = 8; // Closer to top edge for header placement
        
        doc.addImage(logoBase64, 'PNG', logoX, logoY, targetWidth, targetHeight);
      } catch (error) {
        console.warn('Could not add logo to PDF:', error);
      }
    }
    
    // Add page number
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Reset text properties
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
  };

  // Helper function to add text with word wrapping and justification
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12, justify: boolean = true) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    
    if (justify && lines.length > 1) {
      // For multiple lines, justify the text by calculating spacing
      lines.forEach((line: string, index: number) => {
        if (index < lines.length - 1) {
          // Calculate extra spacing for justification
          const lineWidth = doc.getTextWidth(line);
          const extraSpace = maxWidth - lineWidth;
          const wordCount = line.split(' ').length - 1;
          
          if (wordCount > 0) {
            const spaceBetweenWords = extraSpace / wordCount;
            const words = line.split(' ');
            let currentX = x;
            
            words.forEach((word: string, wordIndex: number) => {
              doc.text(word, currentX, y + (index * fontSize * 0.4));
              if (wordIndex < words.length - 1) {
                currentX += doc.getTextWidth(word + ' ') + spaceBetweenWords;
              }
            });
          } else {
            doc.text(line, x, y + (index * fontSize * 0.4));
          }
        } else {
          // Last line - left align
          doc.text(line, x, y + (index * fontSize * 0.4));
        }
      });
    } else {
      // Single line or no justification - use normal text
      doc.text(lines, x, y);
    }
    
    return lines.length * (fontSize * 0.4); // Return height used
  };


  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 30) {
      doc.addPage();
      yPosition = margin + 15; // Leave space for smaller header
      addHeader(doc.getNumberOfPages());
      return true;
    }
    return false;
  };

  // Page 1: Header and Basic Information
  addHeader(1);

  // Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 84, 118); // Primary color #055476
  doc.text('INCIDENT REPORT', margin, yPosition);
  yPosition += 20;

  // Report ID
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${incident.incidentID}`, margin, yPosition);
  yPosition += 10;

  const caregiverName = metadata.employee ? `${metadata.employee.firstName} ${metadata.employee.lastName}` : 'Unknown';
  const caregiverRole = metadata.employee?.accessRole || 'Caregiver';

  // Basic Information Table
  const basicInfoData = [
    ['Client Name', metadata.client ? `${metadata.client.firstName} ${metadata.client.lastName}` : 
                   incident.clientID ? `Client ID: ${incident.clientID} (Not found in system)` : 'N/A'],
    ['Incident Date', dayjs(incident.incidentDate).format('MMMM DD, YYYY')],
    ['Time of Incident', incident.incidentTime],
    ['Location', `${incident.address.address} ${incident.address.city} ${incident.address.state} ${incident.address.postalCode}`],
    ['Incident Type', metadata.incidentType],
    ["Caregiver Name", caregiverName || 'N/A'],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    body: basicInfoData,
    theme: 'grid',
    styles: { fontSize: 12, cellPadding: 4, cellTextColor: [0, 0, 0] },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, cellTextColor: [0, 0, 0] },
      1: { cellWidth: 120, cellTextColor: [0, 0, 0] },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // People Involved Section
  checkNewPage(40);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 84, 118);
  doc.text('Other Parties Involved:', margin, yPosition);
  yPosition += 8;

  // Other People Involved
  if (incident.parties && incident.parties.length > 0) {
    const partiesData = incident.parties.map(party => [
      `${party.firstName} ${party.lastName}`,
      party.email,
      party.workPhoneNo
    ]);

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Name', 'Email', 'Phone']],
      body: partiesData,
      theme: 'grid',
      headStyles: { fillColor: [5, 84, 118], textColor: [255, 255, 255], fontStyle: 'bold' }, // Primary color with white text
      styles: { fontSize: 12, cellPadding: 3, cellTextColor: [0, 0, 0] }, // Black text for body
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Description of Incident
  checkNewPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 84, 118); // Primary color #055476
  doc.text('Description of Incident:', margin, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); 
  const descHeight = addWrappedText(incident.description, margin, yPosition, pageWidth - 2 * margin, 12, true);
  yPosition += descHeight + 10;

  // Actions Taken (using issue field as requested)
  checkNewPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 84, 118); // Primary color #055476
  doc.text('Actions Taken:', margin, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); 
  const actionsText = incident.issue || 'No actions documented';
  const actionsHeight = addWrappedText(actionsText, margin, yPosition, pageWidth - 2 * margin, 12, true);
  yPosition += actionsHeight + 10;

  // Questions and Answers
  checkNewPage(20); // Reduced from 80 to 30

  if (incident.answers && incident.answers.length > 0 && metadata.questions) {
    const activeQuestions = metadata.questions.filter(q => q.status === 'Active');
    
    activeQuestions.forEach((question) => {
        checkNewPage(20); // Reduced from 40 to 25
        
        const mainAnswer = incident.answers.find(
          a => a.incidentActionID === question.incidentActionID && !a.incidentSubActionID
        );
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(5, 84, 118)
        const questionHeight = addWrappedText(question.question, margin, yPosition, pageWidth - 2 * margin, 12, false);
        yPosition += questionHeight + 3; // Reduced from +5 to +3
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const answerText = question.yesNoAnswer 
          ? (mainAnswer?.answer === 'true' ? 'Yes' : 'No')
          : (mainAnswer?.answer || 'No answer provided');
        
        // Handle answer text wrapping for long answers
        if (answerText.length > 50) {
          doc.setTextColor(0, 0, 0);
          const answerHeight = addWrappedText(`Answer: ${answerText}`, margin, yPosition, pageWidth - 2 * margin, 12, false);
          yPosition += answerHeight + 3;
        } else {
          doc.text(`Answer: ${answerText}`, margin, yPosition);
          yPosition += 6;
        }

        // Sub-questions
        const subAnswers = incident.answers.filter(
          a => a.incidentActionID === question.incidentActionID && a.incidentSubActionID
        );

        if (subAnswers.length > 0 && question.incidentSubActionList) {
          yPosition += 2; // Small spacing before sub-questions
          
          question.incidentSubActionList
            .filter(sub => sub.state === 'Active')
            .forEach(subQuestion => {
              const subAnswer = subAnswers.find(sa => sa.incidentSubActionID === subQuestion.id);
              if (subAnswer) {
                checkNewPage(10); // Increased for better text handling
                doc.setFontSize(12);
                
                // Handle sub-question text wrapping
                const subQuestionText = `• ${subQuestion.question}`;
                const subQuestionHeight = addWrappedText(subQuestionText, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12, false);
                yPosition += subQuestionHeight + 3;
                
                // Handle sub-answer text wrapping
                const subAnswerText = `  Answer: ${subAnswer.answer}`;
                const subAnswerHeight = addWrappedText(subAnswerText, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12, false);
                yPosition += subAnswerHeight + 3;
                
                doc.setFontSize(12);
              }
            });
        }
        yPosition += 5; // Reduced from +10 to +5
      });
  } else {
    doc.setFontSize(12);
    doc.text('No questions answered for this incident.', margin, yPosition);
    yPosition += 15; // Reduced from +20 to +15
  }

  // Additional Notes
  if (incident.notes) {
    checkNewPage(50);
    doc.setFontSize(12);
    const notesHeight = addWrappedText(incident.notes, margin, yPosition, pageWidth - 2 * margin, 12, true);
    yPosition += notesHeight + 15;
  }

  // Signatures Section
  checkNewPage(90);

  // Reset text properties
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Reported By Section
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 84, 118)
  doc.text('Reported By:', margin, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${caregiverName.charAt(0).toUpperCase() + caregiverName.slice(1)}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Role: ${caregiverRole}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Date: ${dayjs(incident.reportDate).format('MMMM DD, YYYY')}`, margin, yPosition);
  yPosition += 15;
  
  yPosition += 15;

  // Manager Review Section
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 84, 118)
  doc.text('Manager Review:', margin, yPosition);
  yPosition += 15;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Name:',margin,yPosition);
  doc.line(margin + 20, yPosition + 2, margin + 100, yPosition + 2);
  yPosition += 8;
  
  doc.text('Date:', margin, yPosition);
  doc.line(margin + 15, yPosition + 2, margin + 80, yPosition + 2);
  yPosition += 8;
  
  // Comments section
  doc.setTextColor(0, 0, 0); // Black color
  doc.text('Comments/Recommendations:', margin, yPosition);
  yPosition += 8;
  
  // If there are notes from the incident, display them as manager comments
  if (incident.notes && incident.notes.trim()) {
    doc.setFontSize(12);
    const commentsHeight = addWrappedText(incident.notes, margin, yPosition, pageWidth - 2 * margin, 12);
    yPosition += commentsHeight + 8;
  } else {
    // Empty lines for manual comments
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  }
  
  // Signature line for manager
  doc.setTextColor(0, 0, 0); // Black color
  doc.text('Signature:', margin, yPosition);

  if (metadata.signatureData && metadata.signatureType) {
    console.log('PDF Generation - Adding manager signature to PDF...');
    try {
      // Calculate signature dimensions (maintain aspect ratio)
      const signatureMaxWidth = 75; // Max width for signature
      const signatureMaxHeight = 20; // Max height for signature
      
      // Create a temporary image to get dimensions synchronously
      const img = new Image();
      
      // Use a promise to handle the async image loading
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            console.log('PDF Generation - Manager signature image loaded, dimensions:', img.width, 'x', img.height);
            const aspectRatio = img.width / img.height;
            let signatureWidth = signatureMaxWidth;
            let signatureHeight = signatureMaxWidth / aspectRatio;
            
            // If height exceeds max, scale down by height
            if (signatureHeight > signatureMaxHeight) {
              signatureHeight = signatureMaxHeight;
              signatureWidth = signatureMaxHeight * aspectRatio;
            }
            
            console.log('PDF Generation - Adding manager signature with dimensions:', signatureWidth, 'x', signatureHeight);
            console.log('PDF Generation - Manager signature position:', margin + 25, yPosition - 2);
            
            // Add signature image
            doc.addImage(metadata.signatureData!, 'PNG', margin + 25, yPosition - 2, signatureWidth, signatureHeight);
            console.log('PDF Generation - Manager signature added to PDF successfully');
            resolve();
          } catch (error) {
            console.error('PDF Generation - Error adding manager signature to PDF:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          console.error('PDF Generation - Failed to load manager signature image');
          reject(new Error('Failed to load manager signature image'));
        };
        
        console.log('PDF Generation - Setting manager signature image source...');
        img.src = metadata.signatureData!;
      });
    } catch (error) {
      console.error('PDF Generation - Could not add manager signature to PDF:', error);
      // Fallback to line if signature fails
      doc.line(margin + 25, yPosition + 2, margin + 100, yPosition + 2);
    }
  } else {
    console.log('PDF Generation - No signature provided for manager, drawing line');
    // No signature provided, draw line
    doc.line(margin + 25, yPosition + 2, margin + 100, yPosition + 2);
  }
  
  yPosition += 20;

  // Footer
  yPosition += 15;
  
  // Add footer border
  doc.setDrawColor(0, 0, 0); // Black color
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Generated on ${dayjs().format('MMMM DD, YYYY at HH:mm')}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  // Generate descriptive filename with client name, report ID, and timestamp
  const clientName = metadata.client ? `${metadata.client.firstName}_${metadata.client.lastName}` : 
                     incident.clientID ? `Client_${incident.clientID}` : 'Unknown_Client';
  const reportID = incident.incidentID;
  const generatedDateTime = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  
  // Create filename: ClientName_ReportID_GeneratedDateTime.pdf
  const filename = `${clientName}_Report_${reportID}_${generatedDateTime}.pdf`;
  
  // Save the PDF with descriptive filename
  doc.save(filename);
};
