import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Checkbox,
  Typography,
  List,
  ListItem,
  Select,
  MenuItem,
  Stack,
  useTheme,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../../slices/store";
import {
  IncidentActionTypesQuestions,
  saveIncidentQuestion,
  saveQuestion,
  updateIncidentQuestion,
} from "../../../slices/incidentSliceName/incident";

export interface IncidentSubActionTypeQuestionsState {
  id: string;
  question: string;
  incidentActionTypesID: string;
  state: string;
  newlyAdded: boolean;
}

export interface IncidentActionTypesQuestionsState {
  incidentActionID: string;
  question: string;
  yesNoAnswer: boolean;
  status: string;
  newlyAdded: boolean;
  incidentSubActionList: IncidentSubActionTypeQuestionsState[];
}

const QuestionManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const questionSlice = useAppSelector((state) => state?.incident);
  const [questions, setQuestions] = useState<
    IncidentActionTypesQuestionsState[]
  >([]);
  const [editMode, setEditMode] = useState<boolean[]>([]); // Edit mode for main questions
  const theme = useTheme();

  useEffect(() => {
    setQuestions(
      questionSlice?.incidentActionTypesQuestions?.map((q) => ({
        ...q,
        newlyAdded: false,
        incidentSubActionList: q.incidentSubActionList.map((sub) => ({
          ...sub,
          newlyAdded: false,
        })),
      }))
    );
    setEditMode(
      new Array(questionSlice?.incidentActionTypesQuestions?.length || 0).fill(
        false
      )
    );
  }, [questionSlice?.incidentActionTypesQuestions]);

  const generateID = (prefix: string, index: number) =>
    `${prefix}${String(index + 1).padStart(5, "0")}`;

  const handleAddMainQuestion = () => {
    const newQuestionID = generateID("IA", questions.length);
    setQuestions([
      ...questions,
      {
        incidentActionID: newQuestionID,
        question: "",
        yesNoAnswer: false,
        status: "Active",
        newlyAdded: true,
        incidentSubActionList: [],
      },
    ]);
    setEditMode([...editMode, true]);
  };

  const handleToggleEdit = (index: number) => {
    const updatedEditMode = [...editMode];
    updatedEditMode[index] = !updatedEditMode[index];
    setEditMode(updatedEditMode);
  };

  const handleUpdateMainQuestion = (
    index: number,
    field: "question" | "yesNoAnswer" | "status",
    value: string | boolean
  ) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleAddSubQuestion = (mainIndex: number) => {
    const updatedQuestions = questions.map((q, i) =>
      i === mainIndex
        ? {
            ...q,
            incidentSubActionList: [
              ...q.incidentSubActionList,
              {
                id: `${q.incidentActionID}-SUB${
                  q.incidentSubActionList.length + 1
                }`,
                question: "",
                incidentActionTypesID: q.incidentActionID,
                state: "Active",
                newlyAdded: true,
              },
            ],
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const handleUpdateSubQuestion = (
    mainIndex: number,
    subIndex: number,
    field: "question" | "state",
    value: string
  ) => {
    const updatedQuestions = questions.map((q, i) =>
      i === mainIndex
        ? {
            ...q,
            incidentSubActionList: q.incidentSubActionList.map((sub, j) =>
              j === subIndex ? { ...sub, [field]: value } : sub
            ),
          }
        : q
    );
    setQuestions(updatedQuestions);
  };

  const handleSaveQuestionSet = (index: number) => {
    const questionToSave = questions[index];
    console.log("Save question set", questionToSave);
    const payload: saveQuestion = {
      mainQuestion: questionToSave.question,
      subQuestions: questionToSave.incidentSubActionList.map(
        (sub) => sub.question
      ),
      yesNoType: questionToSave.yesNoAnswer,
    };
    dispatch(saveIncidentQuestion([payload]));
    handleToggleEdit(index);
  };

  const handleUpdateQuestionSet = (index: number) => {
    const questionToUpdate = questions[index];
    console.log("Update question set", questionToUpdate);
    const payload: IncidentActionTypesQuestions = {
      incidentActionID: questionToUpdate.incidentActionID,
      question: questionToUpdate.question,
      yesNoAnswer: questionToUpdate.yesNoAnswer,
      status: questionToUpdate.status,
      incidentSubActionList: questionToUpdate.incidentSubActionList.map(
        (sub) => ({
          id: sub.id,
          question: sub.question,
          incidentActionTypesID: sub.incidentActionTypesID,
          state: sub.state,
        })
      ),
    };
    dispatch(updateIncidentQuestion(payload));

    // dispatch(updateQuestionSet(questionToUpdate)); // Action to update question set
    handleToggleEdit(index); // Exit edit mode
  };

  return (
    <Stack sx={{ padding: 3 }}>
      <Typography variant="h6" gutterBottom>
        Incident Question Manager
      </Typography>
      <Stack flexDirection="column" alignItems="flex-end" sx={{ mb: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddMainQuestion}
        >
          Add Main Question
        </Button>
      </Stack>
      <List>
        {questions.map((question, mainIndex) => (
          <Box
            key={mainIndex}
            sx={{
              mt: 2,
              p: 2,
              border: "1px solid #ccc",
              backgroundColor: theme?.palette?.background?.default,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Stack
              width={"100%"}
              flexDirection="row"
              justifyContent="flex-end"
              mb={1.5}
              gap={1}
            >
              {editMode[mainIndex] ? (
                <>
                  {question.newlyAdded ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveQuestionSet(mainIndex)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUpdateQuestionSet(mainIndex)}
                    >
                      Update
                    </Button>
                  )}
                  {question.newlyAdded ? (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        const updatedQuestions = questions.filter(
                          (q, i) => i !== mainIndex
                        );
                        setQuestions(updatedQuestions);
                        const updatedEditMode = editMode.filter(
                          (e, i) => i !== mainIndex
                        );
                        setEditMode(updatedEditMode);
                      }}
                    >
                      delete
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleToggleEdit(mainIndex)}
                    >
                      Cancel
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleToggleEdit(mainIndex)}
                >
                  Edit
                </Button>
              )}
            </Stack>
            <TextField
              fullWidth
              label={`Main Question ${mainIndex + 1}`}
              value={question.question}
              onChange={(e) =>
                handleUpdateMainQuestion(mainIndex, "question", e.target.value)
              }
              sx={{ mb: 2 }}
              InputProps={{
                readOnly: !editMode[mainIndex],
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography sx={{ mr: 2 }}>Yes/No Answer:</Typography>
              <Checkbox
                checked={question.yesNoAnswer}
                onChange={(e) =>
                  handleUpdateMainQuestion(
                    mainIndex,
                    "yesNoAnswer",
                    e.target.checked
                  )
                }
                disabled={!editMode[mainIndex]}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography>Status:</Typography>
              <Select
                value={question.status}
                onChange={(e) =>
                  handleUpdateMainQuestion(mainIndex, "status", e.target.value)
                }
                fullWidth
                disabled={!editMode[mainIndex]}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </Box>
            <Typography variant="h6">Sub-Questions</Typography>
            <List>
              {question.incidentSubActionList.map((subQuestion, subIndex) => (
                <ListItem key={subQuestion.id} sx={{ display: "flex" }}>
                  <TextField
                    fullWidth
                    InputProps={{
                      readOnly: !editMode[mainIndex],
                    }}
                    label={`Sub-Question ${subIndex + 1}`}
                    value={subQuestion.question}
                    onChange={(e) =>
                      handleUpdateSubQuestion(
                        mainIndex,
                        subIndex,
                        "question",
                        e.target.value
                      )
                    }
                    sx={{ mr: 2 }}
                  />
                  <Select
                    value={subQuestion.state}
                    readOnly={!editMode[mainIndex]}
                    onChange={(e) =>
                      handleUpdateSubQuestion(
                        mainIndex,
                        subIndex,
                        "state",
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </ListItem>
              ))}
            </List>
            <Button
              variant="outlined"
              onClick={() => handleAddSubQuestion(mainIndex)}
              sx={{ mt: 1 }}
            >
              Add Sub-Question
            </Button>
          </Box>
        ))}
      </List>
    </Stack>
  );
};

export default QuestionManager;
