import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, PageBreak, VerticalAlign } from 'docx';
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
}

// Helper function to fetch image as buffer
const getImageBuffer = async (imagePath: string): Promise<ArrayBuffer | null> => {
  try {
    const response = await fetch(imagePath);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.warn('Could not load image for Word document:', error);
    return null;
  }
};

// Helper function to create styled text
const createText = (text: string, bold: boolean = false, size: number = 24, color?: string) => {
  return new TextRun({
    text,
    bold,
    size: size * 2, // docx uses half-points
    color: color,
  });
};

// Helper function to create styled paragraph
const createParagraph = (text: string, headingLevel?: typeof HeadingLevel[keyof typeof HeadingLevel], alignment?: typeof AlignmentType[keyof typeof AlignmentType]) => {
  return new Paragraph({
    text: text,
    heading: headingLevel,
    alignment: alignment || AlignmentType.LEFT,
    spacing: {
      after: 200,
    },
  });
};

// Helper function to create styled paragraph with custom text runs
const createStyledParagraph = (textRuns: TextRun[], alignment?: typeof AlignmentType[keyof typeof AlignmentType]) => {
  return new Paragraph({
    children: textRuns,
    alignment: alignment || AlignmentType.LEFT,
    spacing: {
      after: 200,
    },
  });
};

export const generateIncidentWord = async (
  incident: Incidents,
  metadata: ReportMetadata
): Promise<void> => {
  // Try to load the logo
  let logoBuffer: ArrayBuffer | null = null;
  try {
    logoBuffer = await getImageBuffer('/skycarelogo.png');
  } catch (error) {
    console.warn('Could not load logo for Word document:', error);
  }

  const caregiverName = metadata.employee ? `${metadata.employee.firstName} ${metadata.employee.lastName}` : 'Unknown';
  const caregiverRole = metadata.employee?.accessRole || 'Caregiver';
  const clientName = metadata.client ? `${metadata.client.firstName} ${metadata.client.lastName}` : 'N/A';

  // Logo will be added in headers section of document

  // Create the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch in twips
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      headers: {
        default: {
          options: {
            children: logoBuffer ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 120,
                      height: 60,
                    },
                    type: 'png',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ] : [
              new Paragraph({
                children: [createText('SkyCare Portal', true, 24)],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          },
        },
      },
      children: [
        // Professional Header
        createStyledParagraph([
          createText('INCIDENT REPORT', true, 32, '055476')
        ], AlignmentType.LEFT),
        createStyledParagraph([
          createText('Comprehensive Incident Documentation', false, 20, '808080')
        ], AlignmentType.LEFT),
        createStyledParagraph([
          createText(`Report ID: ${incident.incidentID}`, true, 24, '055476')
        ], AlignmentType.RIGHT),
        createStyledParagraph([
          createText(`Generated: ${dayjs().format('MMMM DD, YYYY')}`, false, 20, '808080')
        ], AlignmentType.RIGHT),
        
        // Basic Information Section
        createStyledParagraph([
          createText('📋 Incident Details', true, 28, '055476')
        ]),
        
        // Basic Information Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('Client Name', true, 24, '055476')] })],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: 'F0F8FF' },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText(clientName)] })],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('Incident Date', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText(dayjs(incident.incidentDate).format('MMMM DD, YYYY'))] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('Time of Incident', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText(incident.incidentTime)] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('Location', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText(`${incident.address.address}, ${incident.address.city}, ${incident.address.state} ${incident.address.postalCode}`)] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('Incident Type', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText(metadata.incidentType)] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('Status', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText(metadata.incidentStatus)] })],
                }),
              ],
            }),
          ],
        }),

        // People Involved Section
        createStyledParagraph([
          createText('👥 People Involved', true, 28, '055476')
        ]),
        createStyledParagraph([
          createText('Caregiver Involved: ', true),
          createText(`${caregiverName} (${caregiverRole})`),
        ]),

        // Other People Involved Table (if applicable)
        ...(incident.parties && incident.parties.length > 0 ? [
          createStyledParagraph([createText('Other People Involved:', true)]),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [createText('Name', true, 24, '055476')] })], shading: { fill: 'F0F8FF' } }),
                  new TableCell({ children: [new Paragraph({ children: [createText('Type', true, 24, '055476')] })], shading: { fill: 'F0F8FF' } }),
                  new TableCell({ children: [new Paragraph({ children: [createText('Email', true, 24, '055476')] })], shading: { fill: 'F0F8FF' } }),
                  new TableCell({ children: [new Paragraph({ children: [createText('Phone', true, 24, '055476')] })], shading: { fill: 'F0F8FF' } }),
                ],
              }),
              ...incident.parties.map(party => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [createText(`${party.firstName} ${party.lastName}`)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [createText(party.type)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [createText(party.email)] })] }),
                  new TableCell({ children: [new Paragraph({ children: [createText(party.workPhoneNo)] })] }),
                ],
              })),
            ],
          }),
        ] : []),

        // Description of Incident Section
        createStyledParagraph([
          createText('📝 Description of Incident', true, 28, '055476')
        ]),
        createStyledParagraph([
          createText('Issue Summary: ', true),
        ]),
        createParagraph(incident.issue),
        createStyledParagraph([
          createText('Detailed Description: ', true),
        ]),
        createParagraph(incident.description),

        // Actions Taken Section
        createStyledParagraph([
          createText('🚑 Actions Taken', true, 28, '055476')
        ]),
        createParagraph(incident.followUp || 'No specific actions documented'),

        // Hospitalization Section (if applicable)
        ...(incident.hospitalized ? [
          createStyledParagraph([
            createText('Hospitalization Details: ', true),
          ]),
          createParagraph(
            `Patient was hospitalized.${incident.admitDate ? ` Admit Date: ${dayjs(incident.admitDate).format('MMMM DD, YYYY')}` : ''}${incident.dischargeDate ? ` | Discharge Date: ${dayjs(incident.dischargeDate).format('MMMM DD, YYYY')}` : ''}`
          ),
        ] : []),

        // Questions and Answers Section
        createStyledParagraph([
          createText('❓ Questions and Answers', true, 28, '055476')
        ]),
        
        ...(incident.answers && incident.answers.length > 0 && metadata.questions ? 
          metadata.questions
            .filter(q => q.status === 'Active')
            .flatMap((question) => {
              const mainAnswer = incident.answers.find(
                a => a.incidentActionID === question.incidentActionID && !a.incidentSubActionID
              );
              const subAnswers = incident.answers.filter(
                a => a.incidentActionID === question.incidentActionID && a.incidentSubActionID
              );

              const paragraphs: Paragraph[] = [
                createStyledParagraph([
                  createText(`Q: ${question.question}`, true),
                ]),
                createStyledParagraph([
                  createText('A: ', true, 22, '1976D2'),
                  createText(
                    question.yesNoAnswer 
                      ? (mainAnswer?.answer === 'true' ? 'Yes' : 'No')
                      : (mainAnswer?.answer || 'No answer provided')
                  ),
                ]),
              ];

              // Add sub-questions if any
              if (subAnswers.length > 0 && question.incidentSubActionList) {
                question.incidentSubActionList
                  .filter(sub => sub.state === 'Active')
                  .forEach(subQuestion => {
                    const subAnswer = subAnswers.find(sa => sa.incidentSubActionID === subQuestion.id);
                    if (subAnswer) {
                      paragraphs.push(
                        createStyledParagraph([
                          createText('  • ', false, 22),
                          createText(`${subQuestion.question}: `, true),
                          createText(subAnswer.answer),
                        ])
                      );
                    }
                  });
              }

              return paragraphs;
            }) : [
              createParagraph('No questions answered for this incident.'),
            ]
        ),

        // Additional Notes Section (if applicable)
        ...(incident.notes ? [
          createStyledParagraph([
            createText('📄 Additional Notes', true, 28, '055476')
          ]),
          createParagraph(incident.notes),
        ] : []),

        // Page Break before signatures
        new Paragraph({
          children: [new PageBreak()],
        }),

        // Signatures Section
        createStyledParagraph([
          createText('✍️ Report Signatures', true, 28, '055476')
        ]),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [createText('REPORTED BY:', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph({ children: [createText('MANAGER REVIEW:', true, 24, '055476')] })],
                  shading: { fill: 'F0F8FF' },
                  width: { size: 50, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    createParagraph(`Name: ${caregiverName}`),
                    createParagraph(`Role: ${caregiverRole}`),
                    createParagraph(`Date: ${dayjs(incident.reportDate).format('MMMM DD, YYYY')}`),
                    createParagraph(''),
                    createParagraph('Signature: _______________'),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  children: [
                    createParagraph('Name: _______________'),
                    createParagraph('Date: _______________'),
                    createParagraph(''),
                    createParagraph('Comments/Recommendations:'),
                    createParagraph('_________________________'),
                    createParagraph('_________________________'),
                    createParagraph('_________________________'),
                    createParagraph(''),
                    createParagraph('Signature: _______________'),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
              ],
            }),
          ],
        }),

        // Footer
        createParagraph(''),
        createStyledParagraph([
          createText(`Generated on ${dayjs().format('MMMM DD, YYYY at HH:mm')}`, true, 22, '000000'),
        ], AlignmentType.CENTER),
        createStyledParagraph([
          createText('Incident Report System', false, 20, '055476'),
        ], AlignmentType.CENTER),
      ],
    }],
  });

  // Generate and download the document
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `incident-report-${incident.incidentID}-${dayjs().format('YYYY-MM-DD')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
