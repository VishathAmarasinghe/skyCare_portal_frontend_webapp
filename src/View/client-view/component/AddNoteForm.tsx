import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  FormHelperText,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Formik, Field, Form, FormikProps, validateYupSchema } from "formik";
import * as Yup from "yup";
import { Notes, resetSubmitState, saveNotes } from "@slices/NotesSlice/notes";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { State } from "../../../types/types";
import { Upload } from "antd";

// Validation schema using Yup
const validationSchema = Yup.object({
  noteType: Yup.string().required("Note Type is required"),
  title: Yup.string().required("Title is required"),
  shiftStartTime: Yup.string().when("noteType", {
    is: "Shift Note",
    then: Yup.string().required("Shift Start Time is required"),
    otherwise: Yup.string().nullable(),
  }),
  shiftEndTime: Yup.string().when("noteType", {
    is: "Shift Note",
    then: Yup.string().required("Shift End Time is required"),
    otherwise: Yup.string().nullable(),
  }),
  careplanID: Yup.string().nullable(),
  taskID: Yup.string().when("noteType", {
    is: "Task",
    then: Yup.string().required("Task ID is required"),
    otherwise: Yup.string(),
  }),
  appointmentID: Yup.string().when("noteType", {
    is: "Appointment",
    then: Yup.string().required("Appointment ID is required"),
    otherwise: Yup.string(),
  }),
  effectiveDate: Yup.date().required("Effective Date is required"),
  description: Yup.string().required("Description is required"),
  sharedGroup: Yup.string().required("Shared Group is required"),
});

const AddNoteForm = () => {
  const [jobType, setJobType] = useState<"appointment" | "task" | "none">(
    "none"
  );
  const [uploadedFils, setUploadedFiles] = useState<File[]>([]);
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const clientID = searchParams.get("clientID");
  const noteStates = useAppSelector((state) => state.notes);
  const [clientAppointmentAndTask, setClientAppointmentAndTask] = useState<{
    appointments: string[];
    tasks: string[];
  }>({ appointments: [], tasks: [] });

  const handleJobTypeChange = (event: SelectChangeEvent<string>) => {
    setJobType(event.target.value as "appointment" | "task" | "none");
  };

  const handleUploadChange = (info: any) => {
    const files = info.fileList.map((file: any) => file.originFileObj);
    setUploadedFiles(files);
  };

  return (
    <Formik
      initialValues={{
        noteType: "Internal Note",
        shiftStartTime: null,
        shiftEndTime: null,
        careplanID: "",
        taskID: "",
        appointmentID: "",
        effectiveDate: dayjs().format("YYYY-MM-DD").toString(),
        description: "",
        sharedGroup: "All",
        clientID: clientID || "",
        createDate: dayjs().format("YYYY-MM-DD").toString(),
        createdBy: "Admin",
        noteID: "",
        title: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        
        const notePayload: Notes = { ...values };
        if (notePayload.careplanID === "") notePayload.careplanID = null;
        if (notePayload.taskID === "") notePayload.taskID = null;
        if (notePayload.appointmentID === "") notePayload.appointmentID = null;
        console.log(values);
        console.log("Uploading files ",uploadedFils);
        dispatch(saveNotes({notes:notePayload, files:uploadedFils}));
      }}
    >
      {({
        values,
        handleChange,
        setFieldValue,
        handleBlur,
        touched,
        errors,
        resetForm,
      }: FormikProps<Notes>) => {
        useEffect(() => {
          if (noteStates.submitState == State.success) {
            resetForm();
            setUploadedFiles([]);
          }
        }, [noteStates.submitState]);
        return (
          <Form>
            <Grid container spacing={3}>
              {/* Note Type */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="text"
                  name="title"
                  label="Note Title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Note Type</InputLabel>
                  <Select
                    name="noteType"
                    value={values.noteType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Note Type"
                  >
                    <MenuItem value="Shift Note">Shift Note</MenuItem>
                    <MenuItem value="Internal Note">Internal Note</MenuItem>
                  </Select>
                  {touched.noteType && errors.noteType && (
                    <FormHelperText error>{errors.noteType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Shift Time fields (only visible if "Shift Note" is selected) */}
              {values.noteType === "Shift Note" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      name="shiftStartTime"
                      label="Shift Start Time"
                      value={values.shiftStartTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.shiftStartTime && Boolean(errors.shiftStartTime)
                      }
                      helperText={
                        touched.shiftStartTime && errors.shiftStartTime
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      name="shiftEndTime"
                      label="Shift End Time"
                      value={values.shiftEndTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.shiftEndTime && Boolean(errors.shiftEndTime)
                      }
                      helperText={touched.shiftEndTime && errors.shiftEndTime}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              {/* Careplan Selector */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Careplan</InputLabel>
                  <Select
                    name="careplanID"
                    value={values.careplanID || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Careplan"
                  >
                    <MenuItem value="">No Careplan</MenuItem>
                    <MenuItem value="CP001">Careplan 1</MenuItem>
                    <MenuItem value="CP002">Careplan 2</MenuItem>
                  </Select>
                  {touched.careplanID && errors.careplanID && (
                    <FormHelperText error>{errors.careplanID}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Appointment/Task Selector */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Job Type</InputLabel>
                  <Select
                    value={jobType}
                    onChange={handleJobTypeChange}
                    onBlur={handleBlur}
                    label="Job Type"
                  >
                    <MenuItem value="appointment">Appointment</MenuItem>
                    <MenuItem value="task">Task</MenuItem>
                    <MenuItem value="none">None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(jobType === "appointment" || jobType === "task") && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select relevent {jobType}</InputLabel>
                    <Select
                      name={
                        jobType == "appointment" ? "appointmentID" : "taskID"
                      }
                      value={
                        jobType == "appointment"
                          ? values.appointmentID
                          : values.taskID
                      }
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={`Select Relevent ${jobType}`}
                    >
                      {jobType == "appointment"
                        ? clientAppointmentAndTask.appointments.map(
                            (appointment) => (
                              <MenuItem key={appointment} value={appointment}>
                                {appointment}
                              </MenuItem>
                            )
                          )
                        : clientAppointmentAndTask.tasks.map((task) => (
                            <MenuItem key={task} value={task}>
                              {task}
                            </MenuItem>
                          ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Effective Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="effectiveDate"
                  label="Effective Date"
                  value={values.effectiveDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.effectiveDate && Boolean(errors.effectiveDate)}
                  helperText={touched.effectiveDate && errors.effectiveDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={jobType == "none" ? 0 : 6}>
                <FormControl fullWidth>
                  <InputLabel>Shared Group</InputLabel>
                  <Select
                    value={values.sharedGroup}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Shared Group"
                  >
                    <MenuItem value="All">All Members</MenuItem>
                    <MenuItem value="Internal">Internal Admins</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  multiline
                  rows={4}
                />
              </Grid>
              <button
                id="note-submit-button"
                style={{ display: "none" }}
                type="submit"
              >
                Submit
              </button>
            </Grid>
            <Stack width="100%" border="2px solid red">
              <Typography variant="h6" my={1}>
                Upload Notes
              </Typography>
              <Stack width="100%">
                <Upload
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  listType="picture"
                >
                  <Button variant="contained">
                    <FileUploadIcon />
                    Upload Notes
                  </Button>
                </Upload>
              </Stack>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddNoteForm;
