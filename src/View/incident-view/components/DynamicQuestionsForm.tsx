import React, { useEffect, useState } from "react";
import {
  Checkbox,
  TextField,
  Grid,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import {
  IncidentActionTypeAllAnswers,
  IncidentActionTypesQuestions,
} from "../../../slices/incidentSliceName/incident";
import { useAppSelector } from "../../../slices/store";

interface Props {
  incidentID: string;
  answers: IncidentActionTypeAllAnswers[];
  setAnswers: React.Dispatch<
    React.SetStateAction<IncidentActionTypeAllAnswers[]>
  >;
}

const DynamicQuestionsForm: React.FC<Props> = ({
  incidentID,
  answers,
  setAnswers,
}) => {
  const incidentSlice = useAppSelector((state) => state?.incident);
  const [questions, setQuestions] = useState<IncidentActionTypesQuestions[]>(
    []
  );

  useEffect(() => {
    setQuestions(incidentSlice?.incidentActionTypesQuestions);
  }, [incidentSlice?.subTypeState]);

  useEffect(() => {
    if (incidentSlice?.selectedIncident) {
      setAnswers(incidentSlice?.selectedIncident?.answers || []);
    }
  }, [incidentSlice?.selectedIncident]);

  const getAnswerValue = (
    incidentActionID: string,
    subActionID: string | null
  ) =>
    answers.find(
      (a) =>
        a.incidentActionID === incidentActionID &&
        a.incidentSubActionID === subActionID
    )?.answer || "";

  const handleMainQuestionChange = (
    incidentActionID: string,
    answer: string | boolean
  ) => {
    const updatedAnswers = answers.map((a) => {
      if (a.incidentActionID === incidentActionID && !a.incidentSubActionID) {
        // Create a new object with updated answer
        return { ...a, answer: String(answer) };
      }
      return a;
    });

    // If no existing answer is found, add a new one
    if (
      !updatedAnswers.some(
        (a) => a.incidentActionID === incidentActionID && !a.incidentSubActionID
      )
    ) {
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
    const updatedAnswers = answers.map((a) => {
      if (
        a.incidentActionID === incidentActionID &&
        a.incidentSubActionID === subActionID
      ) {
        // Create a new object with updated answer
        return { ...a, answer };
      }
      return a;
    });

    // If no existing answer is found, add a new one
    if (
      !updatedAnswers.some(
        (a) =>
          a.incidentActionID === incidentActionID &&
          a.incidentSubActionID === subActionID
      )
    ) {
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
    <Stack sx={{ p: 3 }} width="100%" maxHeight={400} overflow="auto">
      <Typography variant="h6" mb={2}>
        Questions
      </Typography>
      {questions
        .filter((question) => question.status === "Active")
        .map((question) => (
          <Box key={question.incidentActionID} mb={3}>
            <Typography variant="h6">{question.question}</Typography>
            {question.yesNoAnswer ? (
              <Checkbox
                checked={
                  getAnswerValue(question.incidentActionID, null) === "true"
                }
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
                value={getAnswerValue(question.incidentActionID, null)}
                onChange={(e) =>
                  handleMainQuestionChange(
                    question.incidentActionID,
                    e.target.value
                  )
                }
              />
            )}
            <Grid container spacing={2} mt={1}>
              {question.yesNoAnswer &&
                answers.some(
                  (a) =>
                    a.incidentActionID === question.incidentActionID &&
                    a.answer === "true"
                ) &&
                question.incidentSubActionList
                  ?.filter((sub) => sub.state === "Active")
                  .map((sub) => (
                    <Grid item xs={12} sm={6} key={sub.id}>
                      <TextField
                        fullWidth
                        label={sub.question}
                        value={getAnswerValue(
                          question.incidentActionID,
                          sub.id
                        )}
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
              {!question.yesNoAnswer &&
                question.incidentSubActionList
                  ?.filter((sub) => sub.state === "Active")
                  .map((sub) => (
                    <Grid item xs={12} sm={6} key={sub.id}>
                      <TextField
                        fullWidth
                        label={sub.question}
                        value={getAnswerValue(
                          question.incidentActionID,
                          sub.id
                        )}
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
