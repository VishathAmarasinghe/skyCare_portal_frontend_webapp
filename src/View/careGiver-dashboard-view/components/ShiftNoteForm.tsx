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
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import { Card, Upload } from "antd";
import FileListTable from "../../../component/common/FileListTable";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import {
  saveShiftNotes,
  ShiftNoteDocuments,
  updatehiftNotes,
  updateShiftNote,
} from "../../../slices/shiftNoteSlice/shiftNote";
import {
  APPLICATION_ADMIN,
  APPLICATION_SUPER_ADMIN,
} from "../../../config/config";
import { Client } from "@slices/clientSlice/client";
import { CareGiver } from "@slices/careGiverSlice/careGiver";

// Validation schema using Yup
const validationSchema = (selectedShiftNote: updateShiftNote | null) =>
  Yup.object({
    title: Yup.string().required("Title is required"),
    shiftStartDate: Yup.date()
      .nullable()
      .when([], {
        is: () => !selectedShiftNote, // Skip validation if shiftNoteID exists
        then: Yup.date().required("Shift Start Date is required"),
      }),
    shiftStartTime: Yup.string()
      .nullable()
      .when([], {
        is: () => !selectedShiftNote,
        then: Yup.string().required("Shift Start Time is required"),
      }),
    shiftEndDate: Yup.date()
      .nullable()
      .when(["shiftStartDate"], (shiftStartDate, schema) =>
        selectedShiftNote
          ? schema
          : schema
              .min(
                Yup.ref("shiftStartDate"),
                "Shift End Date cannot be before Shift Start Date"
              )
              .required("Shift End Date is required")
      ),
    shiftEndTime: Yup.string()
      .nullable()
      .when([], {
        is: () => !selectedShiftNote,
        then: Yup.string().required("Shift End Time is required"),
      }),
  });

interface AddNoteFormProps {
  isNoteModalVisible: boolean;
  isEditMode: boolean;
  selectedShiftNote: { shiftNoteID: string | null };
  pureNew: boolean;
  foreignDetails: { recurrentID: string | null; careGiverID: string | null };
  setSelectedShiftNote: React.Dispatch<
    React.SetStateAction<{ shiftNoteID: string | null }>
  >;
}

export interface UIShowingFile {
  name: string;
  docID: string;
  status: "New" | "Old";
}

const ShiftNoteForm: React.FC<AddNoteFormProps> = ({
  isNoteModalVisible,
  isEditMode,
  selectedShiftNote,
  setSelectedShiftNote,
  foreignDetails,
  pureNew,
}) => {
  const [jobType, setJobType] = useState<"appointment" | "task" | "none">(
    "none"
  );
  const authUser = useAppSelector((state) => state.auth.userInfo);
  const [uploadedFils, setUploadedFiles] = useState<File[]>([]);
  const [previouslyUploadedFiles, setPreviouslyUploadedFiles] = useState<
    ShiftNoteDocuments[]
  >([]);
  const [UIShowingFile, setUIShowingFile] = useState<UIShowingFile[]>([]);
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const clientID = searchParams.get("clientID");
  const authRoles = useAppSelector((state) => state.auth.roles);
  const shiftNoteStates = useAppSelector((state) => state.shiftNotes);
  const careGiverSlice = useAppSelector((state) => state?.careGivers);
  const [psdImageShowerModalOpen, setPsdImageShowerModalOpen] =
    useState<boolean>(false);
  const [imageViewerImageURl, setImageViewerImageURl] = useState<File | string>(
    ""
  );
  const clientSlice = useAppSelector((state) => state?.clients);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [careGiverList, setCareGiverList] = useState<CareGiver[]>([]);

  const [initialValues, setInitialValues] = useState<updateShiftNote>({
    noteID: "",
    title: "",
    shiftStartDate: dayjs().format("YYYY-MM-DD").toString(),
    shiftStartTime: dayjs().format("HH:mm"), // Current time in "HH:mm" format
    shiftEndTime: dayjs().format("HH:mm"),
    shiftEndDate: dayjs().format("YYYY-MM-DD").toString(),
    systemShiftStartDate: "",
    systemShiftEndDate: "",
    systemShiftStartTime: "",
    systemShiftEndTime: "",
    recurrentAppointmentID: foreignDetails.recurrentID,
    notes: "",
    comments: "",
    employeeID: authUser?.userID || "",
    careGiverID: foreignDetails.careGiverID,
    state: "Active",
    documents: [],
    clientID: null,
    totalWorkHrs: 0,
  });

  const [clientAppointmentAndTask, setClientAppointmentAndTask] = useState<{
    appointments: string[];
    tasks: string[];
  }>({ appointments: [], tasks: [] });

  useEffect(() => {}, [UIShowingFile, uploadedFils, previouslyUploadedFiles]);

  useEffect(() => {
    if (clientSlice?.clients?.length > 0) {
      setClientList(clientSlice?.clients);
    }
  }, [clientSlice?.State,clientSlice?.clients]);

  useEffect(() => {
    if (careGiverSlice?.careGivers?.length > 0) {
      setCareGiverList(careGiverSlice?.careGivers);
    }
  }, [careGiverSlice?.state]);

  useEffect(() => {
    if (shiftNoteStates.selectedShiftNote != null) {
      setInitialValues({
        ...shiftNoteStates.selectedShiftNote,
        clientID:shiftNoteStates?.selectedShiftNote?.clientID
      });

      console.log("");
      setUIShowingFile([
        ...(shiftNoteStates?.selectedShiftNote?.documents?.map((doc) => ({
          name: doc.documentName?.split(".")[0] || "",
          docID: doc.documentId || "",
          status: "Old" as "Old",
        })) || []),
      ]);
    } else {
      setInitialValues({
        noteID: "",
        title: "",
        shiftStartDate: dayjs().format("YYYY-MM-DD").toString(),
        shiftStartTime: dayjs().format("HH:mm"), // Current time in "HH:mm" format
        shiftEndTime: dayjs().format("HH:mm"),
        shiftEndDate: dayjs().format("YYYY-MM-DD").toString(),
        systemShiftStartDate: "",
        systemShiftEndDate: "",
        systemShiftStartTime: "",
        systemShiftEndTime: "",
        recurrentAppointmentID: foreignDetails.recurrentID,
        notes: "",
        comments: "",
        employeeID: authUser?.userID || "",
        careGiverID: foreignDetails.careGiverID,
        state: "Active",
        documents: [],
        clientID: null,
        totalWorkHrs: 0,
      });
      setUploadedFiles([]);
    }
  }, [shiftNoteStates?.selectedShiftNote, isNoteModalVisible, foreignDetails]);

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
      const validFiles = filesArray.filter(
        (file) => file.size <= 5 * 1024 * 1024
      );
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
      const viewingFile = shiftNoteStates?.selectedShiftNote?.documents?.find(
        (f) => f.documentId == file.docID
      );
      if (viewingFile?.documentId) {
        setImageViewerImageURl(viewingFile?.documentLocation);
        setPsdImageShowerModalOpen(true);
      }
    } else if (file.status === "New") {
      console.log("file kos ", file);

      const viewingFile = uploadedFils.find((f) => f.name == file.docID);
      if (viewingFile) {
        console.log("Viewing file", viewingFile);
        setImageViewerImageURl(new File([viewingFile], viewingFile.name));
        setPsdImageShowerModalOpen(true);
      }
    }
  };

  const handleDeleteUploaded = (file: UIShowingFile) => {
    if (file.status === "New") {
      setUploadedFiles(uploadedFils.filter((f) => f.name !== file.docID));
    } else if (file.status === "Old") {
      const deletingFile =
        shiftNoteStates?.selectedShiftNote?.documents?.find(
          (f) => f.documentId == file.docID
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
      validationSchema={validationSchema(shiftNoteStates?.selectedShiftNote)}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        const notePayload: updateShiftNote = { ...values };
        if (pureNew) {
          notePayload.employeeID = authUser?.userID || "";
          dispatch(saveShiftNotes({ notes: notePayload, files: uploadedFils }));
        } else {
          if (shiftNoteStates?.selectedShiftNote) {
            notePayload.documents = previouslyUploadedFiles;
            dispatch(
              updatehiftNotes({ notes: notePayload, files: uploadedFils })
            );
          } else {
            notePayload.noteID = selectedShiftNote?.shiftNoteID || "";
            dispatch(
              saveShiftNotes({ notes: notePayload, files: uploadedFils })
            );
          }
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
      }: FormikProps<updateShiftNote>) => {
        useEffect(() => {
          if (
            shiftNoteStates.submitState == State.success ||
            shiftNoteStates.updateState == State.success
          ) {
            resetForm();
            setUploadedFiles([]);
            setUIShowingFile([]);
            setPreviouslyUploadedFiles([]);
          }
        }, [shiftNoteStates.submitState, shiftNoteStates.updateState]);

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
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="date"
                  name="shiftStartDate"
                  label="Shift Start Date"
                  value={values.shiftStartDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.shiftStartDate && Boolean(errors.shiftStartDate)
                  }
                  helperText={touched.shiftStartDate && errors.shiftStartDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Shift Start Time */}
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="time"
                  name="shiftStartTime"
                  label="Shift Start Time"
                  value={values.shiftStartTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.shiftStartTime && Boolean(errors.shiftStartTime)
                  }
                  helperText={touched.shiftStartTime && errors.shiftStartTime}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Shift End Date */}
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="date"
                  name="shiftEndDate"
                  label="Shift End Date"
                  value={values.shiftEndDate || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.shiftEndDate && Boolean(errors.shiftEndDate)}
                  helperText={touched.shiftEndDate && errors.shiftEndDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Shift End Time */}
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="time"
                  name="shiftEndTime"
                  label="Shift End Time"
                  value={values.shiftEndTime || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.shiftEndTime && Boolean(errors.shiftEndTime)}
                  helperText={touched.shiftEndTime && errors.shiftEndTime}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={3}
                sx={{
                  display:
                    authRoles.includes(APPLICATION_ADMIN) ||
                    authRoles.includes(APPLICATION_SUPER_ADMIN)
                      ? "block"
                      : "none",
                }}
              >
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="date"
                  name="systemShiftStartDate"
                  label="System Shift Start Date"
                  disabled={true}
                  value={values.systemShiftStartDate || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.systemShiftStartDate &&
                    Boolean(errors.systemShiftStartDate)
                  }
                  helperText={
                    touched.systemShiftStartDate && errors.systemShiftStartDate
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* System Shift Start Time */}
              <Grid
                item
                xs={12}
                sm={3}
                sx={{
                  display:
                    authRoles.includes(APPLICATION_ADMIN) ||
                    authRoles.includes(APPLICATION_SUPER_ADMIN)
                      ? "block"
                      : "none",
                }}
              >
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="time"
                  disabled={true}
                  name="systemShiftStartTime"
                  label="System Shift Start Time"
                  value={values.systemShiftStartTime || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.systemShiftStartTime &&
                    Boolean(errors.systemShiftStartTime)
                  }
                  helperText={
                    touched.systemShiftStartTime && errors.systemShiftStartTime
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* System Shift End Date */}
              <Grid
                item
                xs={12}
                sm={3}
                sx={{
                  display:
                    authRoles.includes(APPLICATION_ADMIN) ||
                    authRoles.includes(APPLICATION_SUPER_ADMIN)
                      ? "block"
                      : "none",
                }}
              >
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="date"
                  name="systemShiftEndDate"
                  label="System Shift End Date"
                  disabled={true}
                  value={values.systemShiftEndDate || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.systemShiftEndDate &&
                    Boolean(errors.systemShiftEndDate)
                  }
                  helperText={
                    touched.systemShiftEndDate && errors.systemShiftEndDate
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* System Shift End Time */}
              <Grid
                item
                xs={12}
                sm={3}
                sx={{
                  display:
                    authRoles.includes(APPLICATION_ADMIN) ||
                    authRoles.includes(APPLICATION_SUPER_ADMIN)
                      ? "block"
                      : "none",
                }}
              >
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="time"
                  name="systemShiftEndTime"
                  label="System Shift End Time"
                  disabled={true}
                  value={values.systemShiftEndTime || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.systemShiftEndTime &&
                    Boolean(errors.systemShiftEndTime)
                  }
                  helperText={
                    touched.systemShiftEndTime && errors.systemShiftEndTime
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Client"
                  name="clientID"
                  value={values.clientID}
                  onChange={handleChange}
                  InputProps={{ readOnly: !isEditMode }}
                  error={touched.clientID && Boolean(errors.clientID)}
                  helperText={touched.clientID && errors.clientID}
                >
                  {clientList?.map((client) => (
                    <MenuItem value={client?.clientID}>
                      {client?.firstName +
                        " " +
                        client?.lastName +
                        `(${client?.preferredName})`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {authRoles?.includes(APPLICATION_ADMIN) ||
              authRoles?.includes(APPLICATION_SUPER_ADMIN) ? (
                <Grid item xs={12} sm={4} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Care Giver"
                    name="careGiverID"
                    value={values.careGiverID}
                    onChange={handleChange}
                    InputProps={{ readOnly: !isEditMode }}
                    error={touched.careGiverID && Boolean(errors.careGiverID)}
                    helperText={touched.careGiverID && errors.careGiverID}
                  >
                    {careGiverList?.map((client) => (
                      <MenuItem value={client?.careGiverID}>
                        {client?.employee?.firstName +
                          " " +
                          client?.employee?.lastName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              ) : (
                <></>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  InputProps={{ readOnly: !isEditMode }}
                  type="number"
                  name="totalWorkHrs"
                  label="Total Work Hours"
                  value={values.totalWorkHrs}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.totalWorkHrs && Boolean(errors.totalWorkHrs)}
                  helperText={touched.totalWorkHrs && errors.totalWorkHrs}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="notes"
                  InputProps={{ readOnly: !isEditMode }}
                  label="Notes"
                  value={values.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={touched.notes && errors.notes}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Comments */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="comments"
                  InputProps={{ readOnly: !isEditMode }}
                  label="Comments"
                  value={values.comments}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.comments && Boolean(errors.comments)}
                  helperText={touched.comments && errors.comments}
                  multiline
                  rows={2}
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
                <Typography variant="body2" color="textSecondary">
                  Please upload images or PDF files size less than 5MB
                </Typography>
              </Stack>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
};
export default ShiftNoteForm;
