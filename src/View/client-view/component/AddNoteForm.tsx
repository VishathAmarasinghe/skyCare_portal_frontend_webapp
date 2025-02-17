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
  useTheme,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Formik, Field, Form, FormikProps, validateYupSchema } from "formik";
import * as Yup from "yup";
import {
  NoteFiles,
  Notes,
  resetSubmitState,
  saveNotes,
  updateNotes,
} from "@slices/notesSlice/notes";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import { Card, Upload } from "antd";
import FileListTable from "../../../component/common/FileListTable";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import { CarePlan } from "../../../slices/carePlanSlice/carePlan";

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

interface AddNoteFormProps {
  isNoteModalVisible: boolean;
  isEditMode: boolean;
}

export interface UIShowingFile {
  name: string;
  docID: string;
  status: "New" | "Old";
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({
  isNoteModalVisible,
  isEditMode,
}) => {
  const [jobType, setJobType] = useState<"appointment" | "task" | "none">(
    "none"
  );
  const [uploadedFils, setUploadedFiles] = useState<File[]>([]);
  const [previouslyUploadedFiles, setPreviouslyUploadedFiles] = useState<
    NoteFiles[]
  >([]);
  const [UIShowingFile, setUIShowingFile] = useState<UIShowingFile[]>([]);
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const clientID = searchParams.get("clientID");
  const noteStates = useAppSelector((state) => state.notes);
  const [psdImageShowerModalOpen, setPsdImageShowerModalOpen] =
    useState<boolean>(false);
  const [imageViewerImageURl, setImageViewerImageURl] = useState<File | string>(
    ""
  );
  const [initialValues, setInitialValues] = useState<Notes>({
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
    documents: null,
  });

  const [clientAppointmentAndTask, setClientAppointmentAndTask] = useState<{
    appointments: string[];
    tasks: string[];
  }>({ appointments: [], tasks: [] });

  const carePlanSlice = useAppSelector((state) => state.carePlans);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);

  useEffect(() => {
    if (carePlanSlice?.carePlans?.length > 0) {
      setCarePlans(carePlanSlice.carePlans);
    }
  }, [carePlanSlice.carePlans]);

  useEffect(() => {}, [UIShowingFile, uploadedFils, previouslyUploadedFiles]);

  useEffect(() => {
    if (noteStates.selectedNote != null) {
      setInitialValues({
        ...noteStates.selectedNote,
        effectiveDate: dayjs(noteStates.selectedNote.effectiveDate)
          .format("YYYY-MM-DD")
          .toString(),
        careplanID: noteStates.selectedNote.careplanID || "",
        taskID: noteStates.selectedNote.taskID || "",
        appointmentID: noteStates.selectedNote.appointmentID || "",
      });

      console.log("");
      setUIShowingFile([
        ...(noteStates.selectedNote.documents?.map((doc) => ({
          name: doc.docID?.split(".")[0] || "",
          docID: doc.docID,
          status: "Old" as "Old",
        })) || []),
      ]);
    } else {
      setInitialValues({
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
        documents: null,
      });
      setUploadedFiles([]);
    }
  }, [noteStates.selectedNote, isNoteModalVisible]);

  useEffect(() => {
    console.log("initial values ", initialValues);
  }, [initialValues]);

  const handleClosePDFViewer = () => {
    setPsdImageShowerModalOpen(false);
    setImageViewerImageURl("");
  };

  const handleJobTypeChange = (event: SelectChangeEvent<string>) => {
    setJobType(event.target.value as "appointment" | "task" | "none");
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);
      setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);

      const previousUploadedFiles = UIShowingFile.filter(
        (file) => file.status === "Old"
      );
      const newUploadedFiles = UIShowingFile?.filter(
        (file) => file.status === "New"
      );
      setUIShowingFile([
        ...filesArray.map((file: File) => ({
          name: file.name,
          docID: file.name || file.name,
          status: "New" as "New",
        })),
        ...previousUploadedFiles,
        ...newUploadedFiles,
      ]);
    }
  };

  const handleView = (file: UIShowingFile) => {
    console.log("Viewing file", file);
    if (file.status === "Old") {
      const viewingFile = noteStates?.selectedNote?.documents?.find(
        (f) => f.docID == file.docID
      );
      if (viewingFile?.document) {
        setImageViewerImageURl(viewingFile?.document);
        setPsdImageShowerModalOpen(true);
      }
    } else if (file.status === "New") {
      console.log("file kos ", file);

      const viewingFile = uploadedFils.find((f) => f.name == file.docID);
      if (viewingFile) {
        console.log("Viewing file", viewingFile);
        const fileUrl = URL.createObjectURL(viewingFile);
        setImageViewerImageURl(viewingFile);

        setPsdImageShowerModalOpen(true);
      }
    }
  };

  const handleDeleteUploaded = (file: UIShowingFile) => {
    if (file.status === "New") {
      setUploadedFiles(uploadedFils.filter((f) => f.name !== file.docID));
    } else if (file.status === "Old") {
      const deletingFile =
        noteStates?.selectedNote?.documents?.find(
          (f) => f.docID == file.docID
        ) || [];
      setPreviouslyUploadedFiles(
        Array.isArray(deletingFile) ? [...deletingFile] : [deletingFile]
      );
    }
    const newFiles = UIShowingFile.filter((f) => f.docID !== file.docID);
    setUIShowingFile(newFiles);
    console.log("Deleted previously uploaded file", file);
  };

  const handleDownload = (file: UIShowingFile) => {
    console.log("Downloading file", file);
    // Handle download logic here
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        const notePayload: Notes = { ...values };
        if (notePayload.careplanID === "") notePayload.careplanID = null;
        if (notePayload.taskID === "") notePayload.taskID = null;
        if (notePayload.appointmentID === "") notePayload.appointmentID = null;
        console.log(values);
        console.log("Uploading files ", uploadedFils);
        if (noteStates.selectedNote) {
          notePayload.documents = previouslyUploadedFiles;
          dispatch(updateNotes({ notes: notePayload, files: uploadedFils }));
        } else {
          dispatch(saveNotes({ notes: notePayload, files: uploadedFils }));
        }
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
          if (
            noteStates.submitState == State.success ||
            noteStates.updateState == State.success
          ) {
            resetForm();
            setUploadedFiles([]);
            setUIShowingFile([]);
            setPreviouslyUploadedFiles([]);
          }
        }, [noteStates.submitState]);

        useEffect(() => {
          console.log("errors", errors);
        }, [errors]);
        return (
          <Form>
            <Grid container spacing={3}>
              {/* Note Type */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
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
                    readOnly={!isEditMode}
                    value={values.noteType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Note Type"
                  >
                    <MenuItem value="Other Note">Other Note</MenuItem>
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
                      InputProps={{ readOnly: !isEditMode }}
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
                      InputProps={{ readOnly: !isEditMode }}
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
                    readOnly={!isEditMode}
                    value={values.careplanID || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Careplan"
                  >
                    <MenuItem value="">No Careplan</MenuItem>
                    {carePlans.map((carePlan) => (
                      <MenuItem
                        key={carePlan.careplanID}
                        value={carePlan.careplanID}
                      >
                        {carePlan.title}
                      </MenuItem>
                    ))}
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
                    readOnly={!isEditMode}
                    label="Job Type"
                  >
                    <MenuItem value="appointment">Appointment</MenuItem>
                    {/* <MenuItem value="task">Task</MenuItem> */}
                    <MenuItem value="none">None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(jobType === "appointment" || jobType === "task") && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select relevent {jobType}</InputLabel>
                    <Select
                      readOnly={!isEditMode}
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
                  InputProps={{ readOnly: !isEditMode }}
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
                    readOnly={!isEditMode}
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
                  InputProps={{ readOnly: !isEditMode }}
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
            <Stack
              width="100%"
              border="1px solid #ccc"
              bgcolor={theme.palette.background.default}
              borderRadius={1}
              sx={{ p: 1, my: 1 }}
            >
              <Typography variant="h6" my={1}>
                Upload Notes
              </Typography>
              <Stack width="100%" flexDirection="column">
                <FileViewerWithModal
                  file={imageViewerImageURl}
                  isVisible={psdImageShowerModalOpen}
                  onClose={handleClosePDFViewer}
                />
                <FileListTable
                  files={UIShowingFile}
                  onDownload={handleDownload}
                  onView={handleView}
                  onDelete={handleDeleteUploaded}
                  isEditMode={isEditMode}
                />

                {isEditMode && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileUploadIcon />}
                  >
                    Upload Notes
                    <input
                      type="file"
                      hidden
                      accept="application/pdf, image/png, image/jpeg"
                      onChange={handleUploadChange}
                      multiple
                    />
                  </Button>
                )}
              </Stack>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddNoteForm;
