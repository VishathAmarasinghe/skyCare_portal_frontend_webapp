import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../../slices/store';
import { Incidents } from '../../../slices/incidentSlice/incident';
import { Client } from '../../../slices/clientSlice/client';
import { Employee } from '../../../slices/employeeSlice/employee';
import { generateIncidentPDF } from './IncidentReportPDF';
import dayjs from 'dayjs';

interface IncidentReportProps {
  incident: Incidents;
  onClose?: () => void;
}

const IncidentReport: React.FC<IncidentReportProps> = ({ incident }) => {
  const [loading, setLoading] = useState(false);
  
  const incidentSlice = useAppSelector((state) => state.incident);
  const clientSlice = useAppSelector((state) => state.clients);
  const employeeSlice = useAppSelector((state) => state.employees);

  // Debug logging
  console.log('IncidentReport - incidentSlice:', incidentSlice);
  console.log('IncidentReport - questions available:', incidentSlice?.incidentActionTypesQuestions?.length);

  const getIncidentType = (typeId: string): string => {
    const type = incidentSlice?.incidentsTypes?.find(t => t.incidentTypeID === typeId);
    return type?.title || 'Unknown';
  };

  const getIncidentStatus = (statusId: string): string => {
    const status = incidentSlice?.incidentStatus?.find(s => s.incidentStatusID === statusId);
    return status?.status || 'Unknown';
  };

  const getClient = (clientId: string | null): Client | null => {
    if (!clientId) return null;
    return clientSlice?.clients?.find(c => c.clientID === clientId) || null;
  };

  const getEmployee = (employeeId: string): Employee | null => {
    return employeeSlice?.metaAllEmployees?.find(e => e.employeeID === employeeId) || null;
  };

  const client = getClient(incident.clientID);
  const employee = getEmployee(incident.employeeID);

  // Debug logging for client data
  console.log('IncidentReport - Full incident data:', incident);
  console.log('IncidentReport - incident.clientID:', incident.clientID);
  console.log('IncidentReport - incident keys:', Object.keys(incident));
  console.log('IncidentReport - clientSlice.clients:', clientSlice?.clients);
  console.log('IncidentReport - found client:', client);
  console.log('IncidentReport - client data:', client ? { firstName: client.firstName, lastName: client.lastName } : 'No client');

  // Ensure client data is loaded when component mounts
  useEffect(() => {
    if (incident.clientID && !client) {
      console.log('Client data not found, checking if clients are loaded...');
      console.log('Total clients in slice:', clientSlice?.clients?.length);
      console.log('Looking for client ID:', incident.clientID);
      if (clientSlice?.clients?.length > 0) {
        console.log('Available client IDs:', clientSlice.clients.map(c => c.clientID));
      }
    }
  }, [incident.clientID, client, clientSlice?.clients]);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      console.log('Incident data:', incident);
      console.log('Incident answers:', incident.answers);
      console.log('Questions from slice:', incidentSlice?.incidentActionTypesQuestions);
      
      const metadata = {
        incidentType: getIncidentType(incident.incidentTypeID),
        incidentStatus: getIncidentStatus(incident.incidentStatusID),
        client,
        employee,
        questions: incidentSlice?.incidentActionTypesQuestions || [],
      };
      
      console.log('Metadata being passed to PDF:', metadata);
      
      await generateIncidentPDF(incident, metadata);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box className="incident-report" sx={{ p: 4, maxWidth: '1200px', margin: '0 auto', backgroundColor: 'background.paper' }}>
      {/* Simple Header matching PDF */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            color: 'text.primary',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            INCIDENT REPORT
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <img 
            src="/orgLogo.png" 
            alt="Logo" 
            style={{ height: '45px', marginBottom: '8px' }}
          />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            Report ID: {incident.incidentID}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs().format('MMMM DD, YYYY')}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2,
        p: 2,
      }}>
        <Tooltip 
          title={!incidentSlice?.incidentActionTypesQuestions?.length ? "Loading questions data..." : "Download PDF Report"}
          placement="top"
        >
          <span>
            <Button
              variant="contained"
              startIcon={<PdfIcon />}
              onClick={handleDownloadPDF}
              className='bg-primary'
              disabled={loading || !incidentSlice?.incidentActionTypesQuestions?.length}
              sx={{
                '&:hover': { 
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Download PDF
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* Report Content */}
      <Box sx={{ mb: 4 }}>
        {/* Basic Information Table - matching PDF format */}
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '30%', color: 'black' }}>Client Name</TableCell>
                <TableCell sx={{ color: 'black' }}>
                  {client ? `${client.firstName} ${client.lastName}` : 
                   incident.clientID ? `Client ID: ${incident.clientID} (Not found in system)` : 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Incident Date</TableCell>
                <TableCell sx={{ color: 'black' }}>{dayjs(incident.incidentDate).format('MMMM DD, YYYY')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Time of Incident</TableCell>
                <TableCell sx={{ color: 'black' }}>{incident.incidentTime}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Location</TableCell>
                <TableCell sx={{ color: 'black' }}>{`${incident.address.address}, ${incident.address.city}, ${incident.address.state} ${incident.address.postalCode}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Incident Type</TableCell>
                <TableCell sx={{ color: 'black' }}>{getIncidentType(incident.incidentTypeID)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* People Involved - matching PDF format */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Caregiver Involved:
          </Typography>
          <Typography variant="body1" sx={{ ml: 0, mb: 1 }}>
            Name: {employee ? `${employee.firstName.charAt(0).toUpperCase() + employee.firstName.slice(1)} ${employee.lastName.charAt(0).toUpperCase() + employee.lastName.slice(1)}` : 'Unknown'}
          </Typography>
          <Typography variant="body1" sx={{ ml: 0, mb: 3 }}>
            Role: {employee?.accessRole || 'Caregiver'}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Others Involved:
          </Typography>
          
          {incident?.parties && incident?.parties?.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: 'primary.main', fontWeight: 'bold', color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', fontWeight: 'bold', color: 'white' }}>Type</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', fontWeight: 'bold', color: 'white' }}>Email</TableCell>
                    <TableCell sx={{ backgroundColor: 'primary.main', fontWeight: 'bold', color: 'white' }}>Phone</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incident?.parties?.map((party, index) => (
                    <TableRow key={party.partyID || index}>
                      <TableCell sx={{ color: 'black' }}>{`${party.firstName} ${party.lastName}`}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{party.type}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{party.email}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{party.workPhoneNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Description of Incident - matching PDF format */}
        <Box sx={{ mb: 4, maxWidth: '100%', overflow: 'hidden' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Description of Incident:
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 4, 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            textAlign: 'justify'
          }}>
            {incident.description}
          </Typography>
        </Box>

        {/* Actions Taken - matching PDF format */}
        <Box sx={{ mb: 4, maxWidth: '100%', overflow: 'hidden' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Actions Taken:
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 4, 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            textAlign: 'justify'
          }}>
            {incident.issue || 'No actions documented'}
          </Typography>
        </Box>

        {/* Questions and Answers - matching PDF format */}
        <Box sx={{ mb: 4, maxWidth: '100%', overflow: 'hidden' }}>
          {incident.answers && incident.answers.length > 0 ? (
            <Stack spacing={3} sx={{ width: '100%' }}>
              {incidentSlice?.incidentActionTypesQuestions
                ?.filter(q => q.status === 'Active')
                .map((question) => {
                  const mainAnswer = incident.answers.find(
                    a => a.incidentActionID === question.incidentActionID && !a.incidentSubActionID
                  );
                  const subAnswers = incident.answers.filter(
                    a => a.incidentActionID === question.incidentActionID && a.incidentSubActionID
                  );

                  return (
                    <Box key={question.incidentActionID} sx={{ 
                      mb: 3, 
                      p: 3, 
                      border: '1px solid', 
                      borderColor: 'grey.300', 
                      borderRadius: 2, 
                      backgroundColor: 'background.paper',
                      boxShadow: 1
                    }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: 'text.primary',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        textAlign: 'justify'
                      }}>
                        {question.question}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        mb: 2, 
                        color: 'text.primary',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'justify'
                      }}>
                        <strong>Answer:</strong> {question.yesNoAnswer ? (mainAnswer?.answer === 'true' ? 'Yes' : 'No') : (mainAnswer?.answer || 'No answer provided')}
                      </Typography>
                      
                      {subAnswers.length > 0 && (
                        <Box sx={{ ml: 2, mt: 1 }}>
                          {question.incidentSubActionList?.filter(sub => sub.state === 'Active').map(subQuestion => {
                            const subAnswer = subAnswers.find(sa => sa.incidentSubActionID === subQuestion.id);
                            return (
                              <Box key={subQuestion.id} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1, backgroundColor: 'background.paper' }}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'medium', 
                                  mb: 1,
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  textAlign: 'justify'
                                }}>
                                   {subQuestion.question}
                                </Typography>
                                <Typography variant="body2" color="text.primary" sx={{ 
                                  ml: 1,
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'pre-wrap',
                                  textAlign: 'justify'
                                }}>
                                  <strong>Answer:</strong> {subAnswer?.answer || 'No answer provided'}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })}
            </Stack>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No questions answered for this incident.
            </Typography>
          )}
        </Box>

        {/* Additional Notes - matching PDF format */}
        {incident.notes && (
          <Box sx={{ mb: 4, maxWidth: '100%', overflow: 'hidden' }}>
            <Typography variant="body1" sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              textAlign: 'justify'
            }}>
              {incident.notes}
            </Typography>
          </Box>
        )}

        {/* Signatures Section - matching PDF format */}
        <Box sx={{ mb: 6 }}>
          {/* Reported By Section */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Reported By:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Name: {employee ? `${employee.firstName.charAt(0).toUpperCase() + employee.firstName.slice(1)} ${employee.lastName.charAt(0).toUpperCase() + employee.lastName.slice(1)}` : 'Unknown'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Role: {employee?.accessRole || 'Caregiver'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Date: {dayjs(incident.reportDate).format('MMMM DD, YYYY')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Signature: _______________
          </Typography>

          {/* Manager Review Section */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Manager Review:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Name: {employee ? `${employee.firstName.charAt(0).toUpperCase() + employee.firstName.slice(1)} ${employee.lastName.charAt(0).toUpperCase() + employee.lastName.slice(1)}` : '_______________'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Date: _______________
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Comments/Recommendations:
          </Typography>
          {incident.notes && incident.notes.trim() ? (
            <Typography variant="body1" sx={{ 
              mb: 2, 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              textAlign: 'justify'
            }}>
              {incident.notes}
            </Typography>
          ) : (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">_________________________</Typography>
              <Typography variant="body1">_________________________</Typography>
              <Typography variant="body1">_________________________</Typography>
            </Box>
          )}
          <Typography variant="body1" sx={{ mb: 2 }}>
            Signature: _______________
          </Typography>
        </Box>

        {/* Footer - matching PDF format */}
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid', 
          borderColor: 'text.primary', 
          textAlign: 'center'
        }}>
          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
            Generated on {dayjs().format('MMMM DD, YYYY at HH:mm')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default IncidentReport;
