import React, { useEffect, useState } from "react";
import { Formik, Field, Form, FormikProps, FormikHelpers } from "formik";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import * as Yup from "yup";
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
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Appointment,
  AppointmentAttachment,
  AppointmentType,
  fetchAppointmentTypes,
  RecurrentAppointmentValues,
  saveAppointment,
  updateAppointment,
  updateRecurrentAppointment,
} from "@slices/appointmentSlice/appointment";
import AppointmentParticipantTable from "../../../component/common/AppointmentParticipantTable";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { AppointmentTimeFrame, State } from "../../../types/types";
import { Client } from "../../../slices/clientSlice/client";
import { useSearchParams } from "react-router-dom";
import { FILE_DOWNLOAD_BASE_URL } from "../../../config/config";
import {
  CarePlan,
  fetchCarePlansByClientID,
} from "../../../slices/carePlanSlice/carePlan";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { CareGiver } from "../../../slices/careGiverSlice/careGiver";
import { set } from "date-fns";
import { UIShowingFile } from "./AddNoteForm";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import FileListTable from "../../../component/common/FileListTable";
import { parseDateTime } from "../../../utils/utils";
import { enqueueSnackbarMessage } from "../../../slices/commonSlice/common";
import { enqueueSnackbar } from "notistack";

dayjs.extend(isSameOrAfter);

interface CaregiverInfo {
  careGiverID: string;
  name: string;
  status: string;
}

interface AppointmentFormProps {
  isEditMode: boolean;
  activeStep: number;
  selectedRecurrentAppointment: RecurrentAppointmentValues | null;
  selectedTimeFram: AppointmentTimeFrame;
  setSelectedTimeFrame: React.Dispatch<
    React.SetStateAction<AppointmentTimeFrame>
  >;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isEditMode,
  activeStep,
  selectedRecurrentAppointment,
  selectedTimeFram,
  setSelectedTimeFrame,
}) => {
  const [appointmentParticipants, setAppointmentsParticipants] = useState<
    CaregiverInfo[]
  >([]);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    []
  );
  const [clientList, setClientList] = useState<Client[]>([]);
  const appointmentSlice = useAppSelector((state) => state.appointments);
  const clientSlice = useAppSelector((state) => state.clients);
  const carePlanSlice = useAppSelector((state) => state.carePlans);
  const careGiverSlice = useAppSelector((state) => state.careGivers);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [careGivers, setCareGivers] = useState<CareGiver[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const authUser = useAppSelector((state)=>state?.auth?.userInfo);
  const [selectedClient, setSelectedClient] = useState("");
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [uploadedFils, setUploadedFiles] = useState<File[]>([]);
  const [previouslyUploadedFiles, setPreviouslyUploadedFiles] = useState<
    AppointmentAttachment[]
  >([]);
  const [UIShowingFile, setUIShowingFile] = useState<UIShowingFile[]>([]);
  const [psdImageShowerModalOpen, setPsdImageShowerModalOpen] =
    useState<boolean>(false);
  const [imageViewerImageURl, setImageViewerImageURl] = useState<File | string>(
    ""
  );
  const [initialValues, setInitialValues] = useState<Appointment>({
    appointmentID: "",
    title: "",
    appointmentTypeID: "",
    clientID: "",
    caregiverCount: 0,
    startDate: selectedTimeFram?.startDate,
    startTime: selectedTimeFram?.startTime,
    endDate: selectedTimeFram?.endDate,
    endTime: selectedTimeFram?.endTime,
    duration: 0,
    comment: "",
    carePlanID: "",
    taskID: "",
    broadcastType: "",
    appointmentAddress: {
      appointmentAddressID: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
    },
    attachments: [],
    recurrenceState: false,
    recurrentWork: {
      recurrentWorkID: "",
      appointmentID: "",
      taskID: "",
      recurrenceType: "",
      startDate: "",
      endDate: "",
      frequencyCount: 0,
      day: "",
      occurrenceLimit: 0,
    },
    jobAssigns: {
      careGiverIDs: [],
      taskID: "",
      appointmentID: "",
      assignType: "",
      assigner: authUser?.userID || "EM1",
    },
  });

  // Validation schema using Yup
  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    appointmentTypeID: Yup.string().required("Appointment Type is required"),
    // clientID: Yup.string().required("Client ID is required"),
    caregiverCount: Yup.number()
      .required("Caregiver Count is required")
      .positive()
      .integer(),
    startDate: Yup.date()
      .required("Start Date is required")
      .test(
        "is-valid-start-date",
        "Start Date cannot be in the past.",
        (value) => {
          if (!value) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today's date
          const selectedDate = new Date(value);
          return selectedDate >= today; // Check if the selected date is today or later
        }
      ),

    startTime: Yup.string()
      .required("Start Time is required")
      .test(
        "is-valid-start-time",
        "Start Time cannot be in the past.",
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true; // Skip validation if date or time is missing
          const selectedDateTime = parseDateTime(startDate, value);
          return selectedDateTime ? selectedDateTime >= new Date() : true; // Ensure date-time is now or later
        }
      ),

    endDate: Yup.date()
      .required("End Date is required")
      .test(
        "is-valid-end-date",
        "End Date cannot be before Start Date.",
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true; // Skip validation if date is missing
          const startDateTime = new Date(startDate);
          const endDateTime = new Date(value);
          return endDateTime >= startDateTime; // Ensure end date is same or after start date
        }
      ),

    endTime: Yup.string()
      .required("End Time is required")
      .test(
        "is-valid-end-time",
        "End Time cannot be before Start Time.",
        function (value) {
          const { startDate, startTime, endDate } = this.parent;
          if (!startDate || !startTime || !endDate || !value) return true; // Skip validation if any field is missing
          const startDateTime = parseDateTime(startDate, startTime);
          const endDateTime = parseDateTime(endDate, value);
          return startDateTime && endDateTime
            ? endDateTime >= startDateTime
            : true; // Ensure end time is same or after start time
        }
      ),
    // duration: Yup.number().required("Duration is required").positive(),
    // comment: Yup.string().required("Comment is required"),
    // carePlanID: Yup.string().required("Care Plan ID is required"),
    // taskID: Yup.string().required("Task ID is required"),
    broadcastType: Yup.string().required("Broadcast Type is required"),
    recurrenceState: Yup.boolean().required("Recurrence State is required"),
    recurrentWork: Yup.object().shape({
      recurrenceType: Yup.string().when("recurrenceState", {
        is: true,
        then: Yup.string().required("Recurrence Type is required"),
      }),
      startDate: Yup.string().when("recurrenceState", {
        is: true,
        then: Yup.string().required("Recurrence Start Date is required"),
      }),
      endDate: Yup.string().when("recurrenceState", {
        is: true,
        then: Yup.string().required("Recurrence End Date is required"),
      }),
      frequencyCount: Yup.number().when("recurrenceState", {
        is: true,
        then: Yup.number()
          .required("Frequency Count is required")
          .positive()
          .integer(),
      }),
      day: Yup.string().when("recurrenceState", {
        is: true,
        then: Yup.string().required("Day is required"),
      }),
      occurrenceLimit: Yup.number().when("recurrenceState", {
        is: true,
        then: Yup.number()
          .required("Occurrence Limit is required")
          .positive()
          .integer(),
      }),
    }),
  });

  useEffect(() => {
    if (appointmentSlice?.selectedAppointment) {
      setInitialValues({
        ...appointmentSlice.selectedAppointment,
        jobAssigns: {
          assigner:
            appointmentSlice?.selectedAppointment?.jobAssigns?.assigner ??
            "EM00001",
          careGiverIDs:
            appointmentSlice?.selectedAppointment?.jobAssigns?.careGiverIDs ??
            [],
          appointmentID:
            appointmentSlice?.selectedAppointment?.appointmentID ?? "",
          taskID:
            appointmentSlice?.selectedAppointment?.jobAssigns?.taskID ?? "",
          assignType:
            appointmentSlice?.selectedAppointment?.jobAssigns?.assignType ?? "",
        },
      });
      if (selectedRecurrentAppointment != null) {
        setInitialValues({
          ...appointmentSlice.selectedAppointment,
          startDate: selectedRecurrentAppointment.startDate,
          endDate: selectedRecurrentAppointment.endDate,
          startTime: selectedRecurrentAppointment.startTime,
          endTime: selectedRecurrentAppointment.endTime,
          comment: selectedRecurrentAppointment.comment,
        });
      }

      if (appointmentSlice.selectedAppointment?.attachments) {
        setUIShowingFile(
          appointmentSlice.selectedAppointment.attachments.map((f) => ({
            name: f.documentID,
            docID: f.documentID,
            status: "Old",
          }))
        );
      }
    } else {
      setAppointmentsParticipants([]);
      setInitialValues({
        appointmentID: "",
        title: "",
        appointmentTypeID: "",
        clientID: "",
        caregiverCount: 0,
        startDate: selectedTimeFram?.startDate,
        startTime: selectedTimeFram?.startTime,
        endDate: selectedTimeFram?.endDate,
        endTime: selectedTimeFram?.endTime,
        duration: 0,
        comment: "",
        carePlanID: "",
        taskID: "",
        broadcastType: "",
        appointmentAddress: {
          appointmentAddressID: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
        },
        attachments: [],
        recurrenceState: false,
        recurrentWork: {
          recurrentWorkID: "",
          appointmentID: "",
          taskID: "",
          recurrenceType: "",
          startDate: "",
          endDate: "",
          frequencyCount: 0,
          day: "",
          occurrenceLimit: 0,
        },
        jobAssigns: {
          careGiverIDs: [],
          taskID: "",
          appointmentID: "",
          assignType: "",
          assigner: authUser?.userID || "EM1",
        },
      });
    }
  }, [
    appointmentSlice?.selectedAppointment,
    selectedRecurrentAppointment,
    selectedTimeFram,
  ]);

  useEffect(() => {
    if (appointmentSlice.state === State.success) {
      setAppointmentTypes(appointmentSlice.appointmentTypes);
    }
  }, [appointmentSlice.state]);

  useEffect(() => {
    setClientList(clientSlice.clients);
    if (clientID) {
      setClientList(
        clientSlice?.clients.filter((c) => c.clientID === clientID)
      );
    }
  }, [clientSlice.state, clientID, clientSlice.clients]);

  useEffect(() => {
    setCarePlans(carePlanSlice.carePlans);
    setCareGivers(
      careGiverSlice.careGivers?.filter(
        (careGiver) => careGiver?.status === "Activated"
      )
    );
  }, [careGiverSlice.state, carePlanSlice?.carePlans]);

  useEffect(() => {
    setCareGivers(
      careGiverSlice.careGivers?.filter(
        (careGiver) => careGiver?.status === "Activated"
      )
    );
  }, [careGiverSlice.state]);

  useEffect(() => {
    if (selectedClient && selectedClient != "") {
      dispatch(fetchCarePlansByClientID(selectedClient));
    }
  }, [selectedClient]);

  const handleSelectedClient = (clientID: string) => {
    setSelectedClient(clientID);
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

  const handleClosePDFViewer = () => {
    setPsdImageShowerModalOpen(false);
    setImageViewerImageURl("");
  };

  const handleView = (file: UIShowingFile) => {
    console.log("Viewing file", file);
    if (file.status === "Old") {
      const viewingFile =
        appointmentSlice?.selectedAppointment?.attachments?.find(
          (f) => f.documentID == file.docID
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
        appointmentSlice?.selectedAppointment?.attachments?.find(
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

  const handleAddressSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      console.log("Selected Place:", place); // Log the place details
    }
  };

  const handleSubmit = async (
    values: Appointment,
    formikHelpers: FormikHelpers<Appointment>
  ) => {
    const errors = await formikHelpers.validateForm();

    if (selectedRecurrentAppointment != null) {
      const recurrentWorkValues: RecurrentAppointmentValues = {
        recurrentAppointmentID:
          selectedRecurrentAppointment.recurrentAppointmentID,
        startDate: values.startDate,
        endDate: values.endDate,
        startTime: values.startTime,
        endTime: values.endTime,
        comment: values.comment,
      };
      console.log("updating recurrnet task ", recurrentWorkValues);
      dispatch(updateRecurrentAppointment(recurrentWorkValues));
    } else {
      if (Object.keys(errors).length > 0) {
        console.log("Validation Errors:", errors); // Log errors for debugging
        alert("Please fix the validation errors before submitting."); // Optional: Alert user
        return; // Prevent submission
      }
      // Handle form submission (save or update)
      console.log("Form Submitted", values);
      values.recurrentWork.startDate = values.startDate;
      if (
        values.jobAssigns.careGiverIDs?.length > 0 ||
        values?.broadcastType == "All Caregivers"
      ) {
        if (appointmentSlice.selectedAppointment) {
          console.log("value is of ", values.appointmentID);
          dispatch(
            updateAppointment({ appointmentData: values, files: uploadedFils })
          );
        } else {
          dispatch(
            saveAppointment({ appointmentData: values, files: uploadedFils })
          );
        }
      }
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
      }: FormikProps<Appointment>) => {
        useEffect(() => {
          if (values?.jobAssigns?.careGiverIDs?.length > 0) {
            setAppointmentsParticipants(
              careGivers
                .filter((c) =>
                  values.jobAssigns.careGiverIDs.includes(c.careGiverID)
                )
                .map((c) => ({
                  careGiverID: c.careGiverID,
                  name: `${c.employee?.firstName} ${c.employee?.lastName}`,
                  status: "Assigned",
                }))
            );
          }
        }, [values?.jobAssigns?.careGiverIDs]);

        const handleDeleteOfParticipant = (careGiverID: string) => {
          setFieldValue(
            "jobAssigns.careGiverIDs",
            values?.jobAssigns?.careGiverIDs?.filter((id) => id !== careGiverID)
          );
          setAppointmentsParticipants(
            appointmentParticipants.filter((c) => c.careGiverID !== careGiverID)
          );
        };

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
            setFieldValue("appointmentAddress.address", addressDetails.address);
            setFieldValue("appointmentAddress.city", addressDetails.city);
            setFieldValue("appointmentAddress.state", addressDetails.state);
            setFieldValue(
              "appointmentAddress.postalCode",
              addressDetails.postalCode
            );
          }
        }, [addressDetails]);

        useEffect(() => {
          if (appointmentSlice.selectedAppointment) {
            validationSchema
              .validate(appointmentSlice.selectedAppointment)
              .then((valid) => {
                console.log("Validation is ", valid);
              })
              .catch((err) => {
                console.log("Error is ", err);

                // enqueueSnackbar({message:err.message,variant:"error",anchorOrigin:{horizontal:"right",vertical:"bottom"}});
              });
          }
        }, [appointmentSlice.selectedAppointment]);

        useEffect(() => {
          if (values?.recurrentWork?.recurrenceType) {
            if (
              values?.recurrentWork?.recurrenceType === "Biweekly" ||
              values?.recurrentWork?.recurrenceType === "Bimonthly"
            ) {
              setFieldValue("recurrentWork.frequencyCount", "2");
            } else {
              setFieldValue("recurrentWork.frequencyCount", "1");
            }
          }
        }, [values?.recurrentWork?.recurrenceType]);

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

                  {/* Appointment Type */}
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Appointment Type</InputLabel>
                      <Select
                        name="appointmentTypeID"
                        value={values.appointmentTypeID}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Appointment Type"
                        readOnly={!isEditMode}
                      >
                        {appointmentTypes?.map((type) => (
                          <MenuItem
                            key={type.appointmentTypeID}
                            value={type.appointmentTypeID}
                          >
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.appointmentTypeID &&
                        errors.appointmentTypeID && (
                          <FormHelperText error>
                            {errors.appointmentTypeID}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  {/* Client ID */}
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Client</InputLabel>
                      <Select
                        name="clientID"
                        value={values.clientID}
                        onChange={(e) => {
                          handleChange(e);
                          handleSelectedClient(e.target.value);
                        }}
                        onBlur={handleBlur}
                        label="Client"
                        readOnly={!isEditMode}
                      >
                        {clientList?.map((client) => (
                          <MenuItem
                            key={client.clientID}
                            value={client.clientID}
                          >
                            <Chip
                              size="small"
                              avatar={
                                <Avatar
                                  src={
                                    client.profilePhoto
                                      ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                                          client.profilePhoto
                                        )}`
                                      : ""
                                  }
                                  alt={
                                    client.firstName ||
                                    client.lastName ||
                                    "Avatar"
                                  }
                                >
                                  {client.firstName?.charAt(0)}
                                </Avatar>
                              }
                              label={`${client.firstName} ${
                                client?.lastName
                              } (${client?.preferredName || ""})`}
                              variant="outlined"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.clientID && errors.clientID && (
                        <FormHelperText error>{errors.clientID}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Care Plan</InputLabel>
                      <Select
                        name="carePlanID"
                        value={values.carePlanID}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Care Plan"
                        readOnly={!isEditMode}
                      >
                        {carePlans.map((carePlan) => (
                          <MenuItem
                            key={carePlan.careplanID}
                            value={carePlan.careplanID}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                              sx={{ width: "100%" }}
                            >
                              {/* Care Plan ID */}
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {carePlan.careplanID}
                              </Typography>

                              {/* Title */}
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {carePlan.title}
                              </Typography>

                              {/* Start and End Date */}
                              <Typography variant="body2">
                                {carePlan.startDate} - {carePlan.endDate}
                              </Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.carePlanID && errors.carePlanID && (
                        <FormHelperText error>
                          {errors.carePlanID}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Task ID */}
                  {/* <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Task</InputLabel>
                      <Select
                        name="taskID"
                        value={values.taskID}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Task"
                        readOnly={!isEditMode}
                      >
                        <MenuItem value="type1">Type 1</MenuItem>
                        <MenuItem value="type2">Type 2</MenuItem>
                      </Select>
                      {touched.taskID && errors.taskID && (
                        <FormHelperText error>{errors.taskID}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid> */}

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      name="startDate"
                      value={values.startDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        backgroundColor: selectedRecurrentAppointment
                          ? theme.palette.background.default
                          : "",
                      }}
                      error={touched.startDate && Boolean(errors.startDate)}
                      helperText={touched.startDate && errors.startDate}
                      InputProps={{
                        readOnly:
                          selectedRecurrentAppointment && isEditMode === true
                            ? false
                            : !isEditMode,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* Start Time */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      type="time"
                      name="startTime"
                      sx={{
                        backgroundColor: selectedRecurrentAppointment
                          ? theme.palette.background.default
                          : "",
                      }}
                      value={values.startTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.startTime && Boolean(errors.startTime)}
                      helperText={touched.startTime && errors.startTime}
                      InputProps={{
                        readOnly:
                          selectedRecurrentAppointment && isEditMode === true
                            ? false
                            : !isEditMode,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* End Date */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      name="endDate"
                      sx={{
                        backgroundColor: selectedRecurrentAppointment
                          ? theme.palette.background.default
                          : "",
                      }}
                      value={values.endDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.endDate && Boolean(errors.endDate)}
                      helperText={touched.endDate && errors.endDate}
                      InputProps={{
                        readOnly:
                          selectedRecurrentAppointment && isEditMode === true
                            ? false
                            : !isEditMode,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  {/* End Time */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="End Time"
                      type="time"
                      name="endTime"
                      sx={{
                        backgroundColor: selectedRecurrentAppointment
                          ? theme.palette.background.default
                          : "",
                      }}
                      value={values.endTime}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.endTime && Boolean(errors.endTime)}
                      helperText={touched.endTime && errors.endTime}
                      InputProps={{
                        readOnly:
                          selectedRecurrentAppointment && isEditMode === true
                            ? false
                            : !isEditMode,
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {/* Duration */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Duration(hrs)"
                      name="duration"
                      type="number"
                      value={values.duration}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.duration && Boolean(errors.duration)}
                      helperText={touched.duration && errors.duration}
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>

                  {/* Caregiver Count */}
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Caregiver Count"
                      name="caregiverCount"
                      type="number"
                      value={values.caregiverCount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.caregiverCount && Boolean(errors.caregiverCount)
                      }
                      helperText={
                        touched.caregiverCount && errors.caregiverCount
                      }
                      InputProps={{ readOnly: !isEditMode }}
                    />
                  </Grid>

                  {/* Recurrence State */}
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth>
                      <InputLabel>Recurrence State</InputLabel>
                      <Select
                        name="recurrenceState"
                        value={values?.recurrenceState?.toString()}
                        onChange={(e: SelectChangeEvent) => {
                          setFieldValue(
                            "recurrenceState",
                            e.target.value === "true"
                          );
                        }}
                        label="Recurrence State"
                        readOnly={!isEditMode}
                      >
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {values.recurrenceState && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <FormControl
                          fullWidth
                          error={
                            touched.recurrentWork?.recurrenceType &&
                            Boolean(errors.recurrentWork?.recurrenceType)
                          }
                        >
                          <InputLabel>Recurrence Type</InputLabel>
                          <Select
                            name="recurrentWork.recurrenceType"
                            value={values.recurrentWork.recurrenceType || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            readOnly={!isEditMode} // Disable if not in edit mode
                          >
                            {[
                              "Daily",
                              "Weekly",
                              "Biweekly",
                              "Monthly",
                              "Bimonthly",
                            ].map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.recurrentWork?.recurrenceType &&
                            errors.recurrentWork?.recurrenceType && (
                              <FormHelperText>
                                {errors.recurrentWork?.recurrenceType}
                              </FormHelperText>
                            )}
                        </FormControl>
                      </Grid>

                      {/* Start Date */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Recurrence Start Date"
                          type="date"
                          name="recurrentWork.startDate"
                          value={values.startDate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.recurrentWork?.startDate &&
                            Boolean(errors.recurrentWork?.startDate)
                          }
                          helperText={
                            touched.recurrentWork?.startDate &&
                            errors.recurrentWork?.startDate
                          }
                          disabled
                          InputProps={{ readOnly: !isEditMode }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      {/* End Date */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Recurrence End Date"
                          type="date"
                          name="recurrentWork.endDate"
                          value={values.recurrentWork.endDate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.recurrentWork?.endDate &&
                            Boolean(errors.recurrentWork?.endDate)
                          }
                          helperText={
                            touched.recurrentWork?.endDate &&
                            errors.recurrentWork?.endDate
                          }
                          InputProps={{ readOnly: !isEditMode }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>

                      {/* Frequency Count */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Frequency Count"
                          name="recurrentWork.frequencyCount"
                          type="number"
                          disabled={
                            ["Biweekly", "Bimonthly"].includes(
                              values.recurrentWork.recurrenceType
                            )
                              ? true
                              : false
                          }
                          value={values.recurrentWork.frequencyCount}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.recurrentWork?.frequencyCount &&
                            Boolean(errors.recurrentWork?.frequencyCount)
                          }
                          helperText={
                            touched.recurrentWork?.frequencyCount &&
                            errors.recurrentWork?.frequencyCount
                          }
                          InputProps={{ readOnly: !isEditMode }}
                        />
                      </Grid>

                      {/* Day */}
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Day</InputLabel>
                          <Select
                            readOnly={!isEditMode}
                            name="recurrentWork.day"
                            value={values.recurrentWork.day}
                            onChange={handleChange}
                            label="Day"
                          >
                            {[
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ].map((day) => (
                              <MenuItem key={day} value={day}>
                                {day}
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.recurrentWork?.day &&
                            errors.recurrentWork?.day && (
                              <FormHelperText error>
                                {errors.recurrentWork.day}
                              </FormHelperText>
                            )}
                        </FormControl>
                      </Grid>

                      {/* Occurrence Limit */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Occurrence Limit"
                          name="recurrentWork.occurrenceLimit"
                          type="number"
                          value={values.recurrentWork.occurrenceLimit}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.recurrentWork?.occurrenceLimit &&
                            Boolean(errors.recurrentWork?.occurrenceLimit)
                          }
                          helperText={
                            touched.recurrentWork?.occurrenceLimit &&
                            errors.recurrentWork?.occurrenceLimit
                          }
                          InputProps={{ readOnly: !isEditMode }}
                        />
                      </Grid>
                    </>
                  )}
                  {/* Comment */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Comment"
                      name="comment"
                      value={values.comment}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{
                        backgroundColor: selectedRecurrentAppointment
                          ? theme.palette.background.default
                          : "",
                      }}
                      error={touched.comment && Boolean(errors.comment)}
                      helperText={touched.comment && errors.comment}
                      multiline
                      rows={2}
                      InputProps={{
                        readOnly:
                          selectedRecurrentAppointment && isEditMode === true
                            ? false
                            : !isEditMode,
                      }}
                    />
                  </Grid>
                </>
              )}
              {activeStep === 1 && (
                <>
                  <Typography>Address Information</Typography>
                  <Grid container spacing={2}>
                    {/* Address Search */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        onLoad={(autocompleteInstance) =>
                          setAutocomplete(autocompleteInstance)
                        }
                        onPlaceChanged={() => {
                          if (autocomplete) {
                            const place = autocomplete.getPlace();
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
                        name="appointmentAddress.address"
                        InputProps={{ readOnly: !isEditMode }}
                        value={values?.appointmentAddress?.address}
                        onChange={handleChange}
                        error={
                          touched.appointmentAddress?.address &&
                          Boolean(errors.appointmentAddress?.address)
                        }
                        helperText={
                          touched.appointmentAddress?.address &&
                          errors.appointmentAddress?.address
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* City, State, PostalCode */}
                  <Grid container spacing={3} mt={0} mb={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        onBlur={handleBlur}
                        name="appointmentAddress.city"
                        value={values.appointmentAddress?.city}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={handleChange}
                        error={
                          touched.appointmentAddress?.city &&
                          Boolean(errors.appointmentAddress?.city)
                        }
                        helperText={
                          touched.appointmentAddress?.city &&
                          errors.appointmentAddress?.city
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
                        value={values.appointmentAddress?.state}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={handleChange}
                        error={
                          touched.appointmentAddress?.state &&
                          Boolean(errors.appointmentAddress?.state)
                        }
                        helperText={
                          touched.appointmentAddress?.state &&
                          errors.appointmentAddress?.state
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Postal Code"
                        variant="outlined"
                        fullWidth
                        onBlur={handleBlur}
                        name="appointmentAddress.postalCode"
                        value={values.appointmentAddress?.postalCode}
                        onChange={handleChange}
                        InputProps={{ readOnly: !isEditMode }}
                        error={
                          touched.appointmentAddress?.postalCode &&
                          Boolean(errors.appointmentAddress?.postalCode)
                        }
                        helperText={
                          touched.appointmentAddress?.postalCode &&
                          errors.appointmentAddress?.postalCode
                        }
                      />
                    </Grid>
                  </Grid>
                  {/* Broadcast Type */}
                  {appointmentSlice.selectedAppointment == null && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12}>
                        <FormControl fullWidth>
                          <InputLabel>Broadcast Type</InputLabel>
                          <Select
                            name="broadcastType"
                            value={values.broadcastType}
                            onChange={handleChange}
                            label="Broadcast Type"
                            readOnly={!isEditMode}
                          >
                            <MenuItem value="All Caregivers">
                              All Caregivers
                            </MenuItem>
                            <MenuItem value="Selected Caregivers">
                              Selected Caregivers
                            </MenuItem>
                          </Select>
                          {touched.broadcastType && errors.broadcastType && (
                            <FormHelperText error>
                              {errors.broadcastType}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      {values.broadcastType === "Selected Caregivers" && (
                        <>
                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel>Select Caregivers</InputLabel>
                              <Select
                                readOnly={!isEditMode}
                                multiple
                                value={values?.jobAssigns?.careGiverIDs}
                                onChange={(e) =>
                                  setFieldValue(
                                    "jobAssigns.careGiverIDs",
                                    e.target.value as string[]
                                  )
                                }
                                renderValue={(selected) => (
                                  <div>
                                    {(selected as string[]).map(
                                      (id: string) => {
                                        const caregiver = careGivers.find(
                                          (c) => c.careGiverID === id
                                        );
                                        return (
                                          caregiver && (
                                            <Chip
                                              key={caregiver?.careGiverID}
                                              label={`${caregiver.employee?.firstName} ${caregiver?.employee?.lastName}`}
                                              avatar={
                                                <Avatar
                                                  src={
                                                    caregiver.employee
                                                      ?.profile_photo
                                                      ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                                                          caregiver.employee
                                                            ?.profile_photo
                                                        )}`
                                                      : ""
                                                  }
                                                  alt={`${caregiver.employee?.firstName} ${caregiver.employee?.lastName}`}
                                                />
                                              }
                                            />
                                          )
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                              >
                                {careGivers.map((caregiver) => (
                                  <MenuItem
                                    key={caregiver.careGiverID}
                                    value={caregiver.careGiverID}
                                  >
                                    <Chip
                                      label={`${caregiver.employee?.firstName} ${caregiver.employee?.lastName}`}
                                      avatar={
                                        <Avatar
                                          src={
                                            caregiver.employee?.profile_photo
                                              ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                                                  caregiver.employee
                                                    ?.profile_photo
                                                )}`
                                              : ""
                                          }
                                          alt={`${caregiver.employee?.firstName} ${caregiver.employee?.lastName}`}
                                        />
                                      }
                                    />
                                  </MenuItem>
                                ))}
                              </Select>
                              {touched.jobAssigns?.careGiverIDs &&
                                errors.jobAssigns?.careGiverIDs && (
                                  <FormHelperText error>
                                    {errors.jobAssigns?.careGiverIDs}
                                  </FormHelperText>
                                )}
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <AppointmentParticipantTable
                              caregivers={appointmentParticipants}
                              key={"participants"}
                              onDelete={handleDeleteOfParticipant}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}
                </>
              )}
              {activeStep === 2 && (
                <Stack
                  width="100%"
                  border="1px solid #ccc"
                  bgcolor={theme.palette.background.default}
                  borderRadius={1}
                  sx={{ p: 1, my: 1 }}
                >
                  <Typography variant="h6" my={1}>
                    Upload Attachments
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
                        sx={{ width: "220px", my: 1 }}
                        variant="outlined"
                        component="label"
                        startIcon={<FileUploadIcon />}
                      >
                        Upload Attachments
                        <input
                          type="file"
                          hidden
                          accept="application/pdf, image/png, image/jpeg"
                          onChange={handleUploadChange}
                          multiple
                        />
                      </Button>
                    )}
                    <Typography variant="body2" color="textSecondary">Please upload images or PDF files size less than 5MB</Typography>
                  </Stack>
                </Stack>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <button
                    id="carePlan-submit-btn"
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

export default AppointmentForm;
