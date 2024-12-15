import React, { useEffect, useState } from 'react';
import {
  Checkbox,
  TextField,
  Grid,
  Typography,
  Button,
  Paper,
  Box,
  Stack,
} from '@mui/material';
import { IncidentActionTypeAllAnswers, IncidentActionTypesQuestions } from '../../../slices/IncidentSlice/incident';
import { useAppSelector } from '../../../slices/store';

interface Props {
  incidentID: string;
  answers: IncidentActionTypeAllAnswers[]; 
  setAnswers: React.Dispatch<React.SetStateAction<IncidentActionTypeAllAnswers[]>>;
}

const DynamicQuestionsForm: React.FC<Props> = ({ incidentID,answers,setAnswers }) => {

  const incidentSlice = useAppSelector((state) => state?.incident);
  const [questions, setQuestions] = useState<IncidentActionTypesQuestions[]>([]);

  useEffect(() => {
    setQuestions(incidentSlice?.incidentActionTypesQuestions);
    console.log("incident questions ",incidentSlice?.incidentActionTypesQuestions);
    
  }, [incidentSlice?.subTypeState]);

  const handleMainQuestionChange = (
    incidentActionID: string,
    answer: string | boolean
  ) => {
    const existingAnswerIndex = answers.findIndex(
      (a) => a.incidentActionID === incidentActionID && !a.incidentSubActionID
    );

    const updatedAnswers = [...answers];
    if (existingAnswerIndex >= 0) {
      updatedAnswers[existingAnswerIndex].answer = String(answer);
    } else {
      updatedAnswers.push({
        id: null,
        incidentActionID,
        incidentSubActionID: null,
        incidentID,
        answer: String(answer),
      });
    }
    setAnswers(updatedAnswers);
  };

  const handleSubQuestionChange = (
    incidentActionID: string,
    subActionID: string,
    answer: string
  ) => {
    const existingAnswerIndex = answers.findIndex(
      (a) =>
        a.incidentActionID === incidentActionID &&
        a.incidentSubActionID === subActionID
    );

    const updatedAnswers = [...answers];
    if (existingAnswerIndex >= 0) {
      updatedAnswers[existingAnswerIndex].answer = answer;
    } else {
      updatedAnswers.push({
        id: null,
        incidentActionID,
        incidentSubActionID: subActionID,
        incidentID,
        answer,
      });
    }
    setAnswers(updatedAnswers);
  };

  return (
    <Stack sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Questions
      </Typography>
      {questions
        .filter((question) => question.status === 'Active')
        .map((question) => (
          <Box key={question.incidentActionID} mb={3}>
            <Typography variant="h6">{question.question}</Typography>
            {question.yesNoAnswer ? (
              <Checkbox
                onChange={(e) =>
                  handleMainQuestionChange(
                    question.incidentActionID,
                    e.target.checked
                  )
                }
              />
            ) : (
              <TextField
                fullWidth
                label="Answer"
                onChange={(e) =>
                  handleMainQuestionChange(
                    question.incidentActionID,
                    e.target.value
                  )
                }
              />
            )}
            <Grid container spacing={2} mt={1}>
              {question.yesNoAnswer && (
                <>
                  {answers.some(
                    (a) =>
                      a.incidentActionID === question.incidentActionID &&
                      a.answer === 'true'
                  ) &&
                    question.incidentSubActionList
                      ?.filter((sub) => sub.state === 'Active') // Filter sub-questions by state
                      .map((sub) => (
                        <Grid item xs={12} sm={6} key={sub.id}>
                          <TextField
                            fullWidth
                            label={sub.question}
                            onChange={(e) =>
                              handleSubQuestionChange(
                                question.incidentActionID,
                                sub.id,
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                      ))}
                </>
              )}
              {!question.yesNoAnswer &&
                question.incidentSubActionList
                  ?.filter((sub) => sub.state === 'Active') // Filter sub-questions by state
                  .map((sub) => (
                    <Grid item xs={12} sm={6} key={sub.id}>
                      <TextField
                        fullWidth
                        label={sub.question}
                        onChange={(e) =>
                          handleSubQuestionChange(
                            question.incidentActionID,
                            sub.id,
                            e.target.value
                          )
                        }
                      />
                    </Grid>
                  ))}
            </Grid>
          </Box>
        ))}
    </Stack>
  );
};

export default DynamicQuestionsForm;
