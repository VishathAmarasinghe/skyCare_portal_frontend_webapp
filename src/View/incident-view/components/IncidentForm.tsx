import React, { useEffect, useState } from "react";
import { Formik, Field, Form, FormikProps, FormikHelpers } from "formik";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import IncidentInvolvedPartiesComponent from '../components/IncidentInvolvedPartiesComponent';
import * as Yup from "yup";
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import AppointmentParticipantTable from "../../../component/common/AppointmentParticipantTable";

import { useSearchParams } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { set } from "date-fns";
import { IncidentActionTypeAllAnswers, IncidentDocuments, IncidentInvolvedParties, Incidents, IncidentStatus, IncidentType, saveIncident, updateIncident } from "../../../slices/IncidentSlice/incident";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import DynamicQuestionsForm from "./DynamicQuestionsForm";
import { UIShowingFile } from "@view/client-view/component/AddNoteForm";
import { NoteFiles } from "@slices/NotesSlice/notes";
import FileViewerWithModal from "@component/common/FileViewerWithModal";
import FileListTable from "@component/common/FileListTable";
import { State } from "../../../types/types";

dayjs.extend(isSameOrAfter);

interface IncidentFormProps {
  isEditMode: boolean;
  activeStep: number;
}

const IncidentForm: React.FC<IncidentFormProps> = ({
  isEditMode,
  activeStep,
}) => {
  const theme = useTheme();
  const incidentSlice = useAppSelector((state) => state.incident);
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [incidentTYpes,setIncidentTypes] = useState<IncidentType[]>([]);
  const [incidentStatus,setIncidentStatus] = useState<IncidentStatus[]>([]);
  const [involvedPartiesRows, setInvolvedPartiesRows] = useState<IncidentInvolvedParties[]>([]);
  const [answers, setAnswers] = useState<IncidentActionTypeAllAnswers[]>([]);
  const [uploadedFils, setUploadedFiles] = useState<File[]>([]);
  const authUserInfo = useAppSelector((state) => state.auth.userInfo);
  const dispatch = useAppDispatch();
  const [previouslyUploadedFiles, setPreviouslyUploadedFiles] = useState<
    IncidentDocuments[]
  >([]);
  const [UIShowingFile, setUIShowingFile] = useState<UIShowingFile[]>([]);
  const [psdImageShowerModalOpen, setPsdImageShowerModalOpen] =
    useState<boolean>(false);
  const [imageViewerImageURl, setImageViewerImageURl] = useState<File | string>(
    ""
  );
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
    const [searchInput, setSearchInput] = useState("");

  const [initialValues, setInitialValues] = useState<Incidents>({
    incidentID: "",
    title: "",
    reportDate: dayjs().toISOString(),
    incidentDate: dayjs().format("YYYY-MM-DD"),
    incidentTime: dayjs().format("HH:mm"),
    incidentTypeID: "",
    incidentStatusID: "",
    address: {
      appointmentAddressID: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
    },
    issue: "",
    description: "",
    hospitalized: false,
    admitDate: null,
    dischargeDate: null,
    carePlanID: "",
    appointmentID: "",
    taskID: "",
    followUp: "",
    notes: "",
    documents: [],
    answers: [],
    parties: [],
    employeeID: authUserInfo?.userID || "",
  });

  // Validation schema using Yup
  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Title is required")
      .max(100, "Title must be 100 characters or less"),
    reportDate: Yup.date()
      .required("Reporting Date is required")
      .max(new Date(), "Reporting Date cannot be in the future"),
    incidentDate: Yup.date()
      .required("Incident Date is required")
      .max(new Date(), "Incident Date cannot be in the future"),
    incidentTime: Yup.string().required("Incident Time is required"),
    address: Yup.object({
      address: Yup.string()
        .required("Address is required")
        .max(255, "Address must be 255 characters or less"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      postalCode: Yup.string()
        .required("Postal Code is required")
        .matches(/^\d{5}(-\d{4})?$/, "Enter a valid postal code"),
    }),
    issue: Yup.string()
      .required("Issue is required")
      .max(1000, "Issue description must be 1000 characters or less"),
    description: Yup.string()
      .required("Description is required")
      .max(2000, "Description must be 2000 characters or less")
  });

  useEffect(()=>{
    if(incidentSlice?.incidentsTypes){
      setIncidentTypes(incidentSlice?.incidentsTypes?.filter((type:IncidentType)=>type.status === "Active"))
    }
  },[incidentSlice?.subTypeState,incidentSlice?.incidentTypeState])

  useEffect(()=>{
    if(incidentSlice?.incidentStatus){
        setIncidentStatus(incidentSlice?.incidentStatus?.filter((status:IncidentStatus)=>status.status === "Active"))
      }
  },[incidentSlice?.subTypeState])

  useEffect(() => {
    if (incidentSlice?.selectedIncident) {
      setInitialValues({
        ...incidentSlice.selectedIncident,
      });
      setUIShowingFile([
        ...(incidentSlice?.selectedIncident?.documents?.map((doc) => ({
          name: doc.documentName?.split(".")[0] || "",
          docID: doc.documentID,
          status: "Old" as "Old",
        })) || []),
      ]);
    } else {
      setInitialValues({
        incidentID: "",
        title: "",
        reportDate: dayjs().format("YYYY-MM-DD"),
        incidentDate: dayjs().format("YYYY-MM-DD"),
        incidentTime: dayjs().format("HH:mm"),
        incidentTypeID: "",
        incidentStatusID: "",
        address: {
          appointmentAddressID: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
        },
        issue: "",
        description: "",
        hospitalized: false,
        admitDate: null,
        dischargeDate: null,
        carePlanID: "",
        appointmentID: "",
        taskID: "",
        followUp: "",
        notes: "",
        documents:[],
        answers:[],
        parties:[],
        employeeID: authUserInfo?.userID || "",
      });
    }
  }, [incidentSlice.selectedIncident]);

  const handleAddressSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      console.log("Selected Place:", place); // Log the place details
    }
  };

  const handleClosePDFViewer = () => {
    setPsdImageShowerModalOpen(false);
    setImageViewerImageURl("");
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prevFiles) => [...prevFiles, ...filesArray]);

      const previousUploadedFiles = UIShowingFile.filter(
        (file) => file.status === "Old"
      );
      const newUploadedFiles = UIShowingFile?.filter((file) => file.status === "New");
      setUIShowingFile([
        ...filesArray.map((file: File) => ({
          name: file.name,
          docID: file.name || file.name,
          status: "New" as "New",
        })),
        ...previousUploadedFiles,
        ...newUploadedFiles
      ]);
    }
  };

  const handleView = (file: UIShowingFile) => {
    console.log("Viewing file", file);
    if (file.status === "Old") {
      const viewingFile = incidentSlice?.selectedIncident?.documents?.find(
        (f) => f.documentID == file.docID
      );
      if (viewingFile?.documentLocation) {
        setImageViewerImageURl(viewingFile?.documentLocation);
        setPsdImageShowerModalOpen(true);
      }
    } else if (file.status === "New") {
      console.log("file kos ",file);
      
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
      incidentSlice?.selectedIncident?.documents?.find(
          (f) => f.documentID == file.docID
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

  const handleSubmit = async (
    values: Incidents,
    formikHelpers: FormikHelpers<Incidents>
  ) => {
    const errors = await formikHelpers.validateForm();
    console.log("form values ",values);
    console.log("rows ",involvedPartiesRows);
    console.log("files ",uploadedFils);
    console.log("answers ",answers);
    values.parties=involvedPartiesRows;
    values.answers=answers;
    if(incidentSlice?.selectedIncident){
      dispatch(updateIncident({incident:values,files:uploadedFils}))
    }else{
      values.employeeID = authUserInfo?.userID || "";
      dispatch(saveIncident({incident:values,files:uploadedFils}))
    }

  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      validateOnMount={true}
      onSubmit={handleSubmit}
    >
      {({
        values,
        handleChange,
        handleBlur,
        touched,
        errors,
        setFieldValue,
        resetForm
      }: FormikProps<Incidents>) => {
        const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
          if (!autocomplete) return;
          // const place = autocomplete.getPlace();
          const addressComponents = place?.address_components;
          const address = place?.formatted_address;

          let city = "";
          let state = "";
          let postalCode = "";

          addressComponents?.forEach((component: any) => {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (component.types.includes("administrative_area_level_1")) {
              state = component.long_name;
            }
            if (component.types.includes("postal_code")) {
              postalCode = component.long_name;
            }
          });

          setAddressDetails({
            address,
            city,
            state,
            postalCode,
          });
        };

        useEffect(() => {
          if (addressDetails) {
            // Update the form values with the selected address details
            setFieldValue("address.address", addressDetails.address);
            setFieldValue("address.city", addressDetails.city);
            setFieldValue("address.state", addressDetails.state);
            setFieldValue(
              "address.postalCode",
              addressDetails.postalCode
            );
          }
        }, [addressDetails]);

        useEffect(() => {
            if(incidentSlice?.submitState === State.success){
                resetForm();
            }
        }, [incidentSlice?.submitState]);

        return (
          <Form>
            <Grid container spacing={2}>
              {/* Title */}
              {activeStep === 0 && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Reporting Date"
                      type="date"
                      name="reportDate"
                      value={values.reportDate}
                      onChange={handleChange}
                      error={touched.reportDate && Boolean(errors.reportDate)}
                      helperText={touched.reportDate && errors.reportDate}
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Incident Date"
                      type="date"
                      name="incidentDate"
                      value={values.incidentDate}
                      onChange={handleChange}
                      error={
                        touched.incidentDate && Boolean(errors.incidentDate)
                      }
                      helperText={touched.incidentDate && errors.incidentDate}
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Incident Time"
                      type="time"
                      name="incidentTime"
                      value={values.incidentTime}
                      onChange={handleChange}
                      error={
                        touched.incidentTime && Boolean(errors.incidentTime)
                      }
                      helperText={touched.incidentTime && errors.incidentTime}
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4} >
                    <TextField
                      select
                      fullWidth
                      label="Incident Type"
                      name="incidentTypeID"
                      value={values.incidentTypeID}
                      onChange={handleChange}
                      error={
                        touched.incidentTypeID && Boolean(errors.incidentTypeID)
                      }
                      helperText={
                        touched.incidentTypeID && errors.incidentTypeID
                      }
                    >
                        {
                            incidentTYpes.map((type:IncidentType)=>(
                                <MenuItem value={type.incidentTypeID}>{type.title}</MenuItem>
                            ))
                        }
                    </TextField>
                  </Grid>
                    <Grid item xs={12} sm={4} md={4}>
                        <TextField
                        select
                        fullWidth
                        label="Incident Status"
                        name="incidentStatusID"
                        value={values.incidentStatusID}
                        onChange={handleChange}
                        error={
                            touched.incidentStatusID &&
                            Boolean(errors.incidentStatusID)
                        }
                        helperText={
                            touched.incidentStatusID && errors.incidentStatusID
                        }
                        >
                        {
                            incidentStatus.map((status:IncidentStatus)=>(
                                <MenuItem value={status.incidentStatusID}>{status.activeStatus}</MenuItem>
                            ))
                        }
                        </TextField>
                    </Grid>
                    {/* <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Appointment"
                        name="appointmentID"
                        value={values.appointmentID}
                        onChange={handleChange}
                        error={
                            touched.appointmentID &&
                            Boolean(errors.appointmentID)
                        }
                        helperText={
                            touched.appointmentID && errors.appointmentID
                        }
                        >
                        <MenuItem value="">Select care plan</MenuItem>
                        <MenuItem value="1">Status 1</MenuItem>
                        <MenuItem value="2">Status 2</MenuItem>
                        </TextField>
                    </Grid> */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        onLoad={(autocompleteInstance) =>
                          setAutocomplete(autocompleteInstance)
                        }
                        onPlaceChanged={() => {
                          if (autocomplete) {
                            const place = autocomplete.getPlace();
                            console.log("Selected Place:", place); // Check the place object
                            handleAddressSelect(place); // Pass the place data to the handler
                          }
                        }}
                      >
                        <TextField
                          label="Search Address"
                          variant="outlined"
                          fullWidth
                          InputProps={{ readOnly: !isEditMode }}
                          name="search"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                        />
                      </Autocomplete>
                    </Grid>

                    {/* Address */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Address"
                        variant="outlined"
                        fullWidth
                        required
                        onBlur={handleBlur}
                        name="address.address"
                        InputProps={{ readOnly: !isEditMode }}
                        value={values.address.address}
                        onChange={handleChange}
                        error={
                          touched.address?.address &&
                          Boolean(errors.address?.address)
                        }
                        helperText={
                          touched.address?.address &&
                          errors.address?.address
                        }
                      />
                    </Grid>

                  {/* City, State, PostalCode */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        onBlur={handleBlur}
                        name="address.city"
                        value={values.address.city}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={handleChange}
                        error={
                          touched.address?.city &&
                          Boolean(errors.address?.city)
                        }
                        helperText={
                          touched.address?.city &&
                          errors.address?.city
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="State"
                        variant="outlined"
                        fullWidth
                        name="appointmentAddress.state"
                        onBlur={handleBlur}
                        value={values.address.state}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={handleChange}
                        error={
                          touched.address?.state &&
                          Boolean(errors.address?.state)
                        }
                        helperText={
                          touched.address?.state &&
                          errors.address?.state
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Postal Code"
                        variant="outlined"
                        fullWidth
                        onBlur={handleBlur}
                        name="address.postalCode"
                        value={values.address.postalCode}
                        onChange={handleChange}
                        InputProps={{ readOnly: !isEditMode }}
                        error={
                          touched.address?.postalCode &&
                          Boolean(errors.address?.postalCode)
                        }
                        helperText={
                          touched.address?.postalCode &&
                          errors.address?.postalCode
                        }
                      />
                    </Grid>
                    </>
            )}
            {activeStep === 1 && (
                <>
                <Grid item xs={12}>
                        <TextField
                        fullWidth
                        label="Issue"
                        name="issue"
                        value={values.issue}
                        onChange={handleChange}
                        error={touched.issue && Boolean(errors.issue)}
                        helperText={touched.issue && errors.issue}
                        InputProps={{ readOnly: !isEditMode }}
                        rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                        InputProps={{ readOnly: !isEditMode }}
                        rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        fullWidth
                        label="Follow Up"
                        name="followUp"
                        value={values.followUp}
                        onChange={handleChange}
                        error={touched.followUp && Boolean(errors.followUp)}
                        helperText={touched.followUp && errors.followUp}
                        InputProps={{ readOnly: !isEditMode }}
                        rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        fullWidth
                        label="Notes"
                        name="notes"
                        value={values.notes}
                        onChange={handleChange}
                        error={touched.notes && Boolean(errors.notes)}
                        helperText={touched.notes && errors.notes}
                        InputProps={{ readOnly: !isEditMode }}
                        rows={3}
                        />
                    </Grid>
                    </>
              )}
              {
                 activeStep=== 2 && (<DynamicQuestionsForm answers={answers} setAnswers={setAnswers} incidentID="ABC" key={"dynamic questions"}/>)
              }
              {
                activeStep === 3 && (
                    <Stack width="100%" border="1px solid #ccc" bgcolor={theme.palette.background.default} borderRadius={1}  sx={{p:1,my:1}}>
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
                )
              }
              {
                activeStep === 4 && (
                    <IncidentInvolvedPartiesComponent rows={involvedPartiesRows} setRows={setInvolvedPartiesRows}/>
                )
              }
              {/* Submit Button */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <button
                    id="incident-submit-btn"
                    type="submit"
                    disabled={!isEditMode}
                    style={{ display: "none" }}
                  >
                    {isEditMode ? "Save Changes" : "View Appointment"}
                  </button>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export default IncidentForm;
