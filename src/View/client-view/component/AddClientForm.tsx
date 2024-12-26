import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormHelperText,
  Chip,
  Box,
  Stack,
  Typography,
  Checkbox,
  ListItemText,
  FormControlLabel,
} from "@mui/material";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import { Upload, message } from "antd";
import dayjs from "dayjs";
import {
  Client,
  saveClient,
  updateClient,
} from "../../../slices/clientSlice/client";
import CustomRichTextField from "../../../component/common/CustomRichTextField";
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import SupportAddings from "./SupportAddings";
import {
  fetchClassifications,
  fetchClientStatus,
  fetchClientTypes,
  fetchLanguages,
} from "@slices/selectorSlice/selector";
import { State } from "../../../types/types";

const AddClientForm = ({ activeStepper }: { activeStepper: number }) => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputPostal, setSearchInputPostal] = useState("");
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [addressDetailsPostal, setAddressDetailsPostal] = useState<any>(null);
  const dispatch = useAppDispatch();
  const [checked, setChecked] = useState(false);
  const selector = useAppSelector((state) => state.selector);
  const client = useAppSelector((state) => state.clients);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [initialValue, setInitialValues] = useState({
    clientID: "",
    firstName: "",
    lastName: "",
    preferredName: "",
    email: "",
    gender: "Male",
    birthday: dayjs().format("YYYY-MM-DD"),
    clientLanguages: [] as string[],
    phoneNumbers: ["", ""],
    clientType: "",
    clientStatus: "",
    profilePhoto: "",
    joinDate: dayjs().format("YYYY-MM-DD"),
    aboutMe: "",
    physicalAddress: {
      id: 0,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      longitude: "",
      latitude: "",
    },
    postalAddress: {
      id: 0,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      longitude: "",
      latitude: "",
    },
    interests: "",
    dislikes: "",
    clientClassifications: [] as string[],
  });
  const [classifications, setClassifications] = useState<
    { label: string; value: string }[]
  >([]);
  const [clientTypes, setClientTypes] = useState<
    { label: string; value: string }[]
  >([]);
  const [languages, setLanguages] = useState<
    { label: string; value: string }[]
  >([]);
  const [clientStatuses, setClientStatuses] = useState<
    { label: string; value: string }[]
  >([]);
  const [supportTypeCreater, setSupportTypeCreater] = useState<{
    supportType: "language" | "classification" | "clientType" | "clientStatus";
    isOpen: boolean;
  }>({ supportType: "language", isOpen: false });

  useEffect(() => {
    fetchSupportDetails();
  }, [selector.submitState]);

  useEffect(() => {
    console.log("Selected Client", client?.selectedClient);

    if (client?.selectedClient) {
      setInitialValues({
        ...client?.selectedClient,
        clientLanguages: client?.selectedClient?.clientLanguages?.map(
          (lan) => languages?.filter((lang) => lang?.label == lan)[0]?.value
        ),
        clientClassifications:
          client?.selectedClient?.clientClassifications?.map(
            (cls) =>
              classifications?.filter(
                (classification) => classification?.label == cls
              )[0]?.value
          ),
        clientType: client?.selectedClient?.clientType
          ? clientTypes?.filter(
              (cType) => cType?.label == client?.selectedClient?.clientType
            )[0]?.value
          : "",
        clientStatus: client?.selectedClient?.clientStatus
          ? clientStatuses?.filter(
              (status) => status?.label == client?.selectedClient?.clientStatus
            )[0]?.value
          : "",
        postalAddress: { ...client?.selectedClient?.postalAddress },
      });
      console.log("postalAddress", client?.selectedClient?.postalAddress);

      if (
        client?.selectedClient?.physicalAddress?.address ===
          client?.selectedClient?.postalAddress?.address &&
        client?.selectedClient?.physicalAddress?.city ===
          client?.selectedClient?.postalAddress?.city &&
        client?.selectedClient?.physicalAddress?.state ===
          client?.selectedClient?.postalAddress?.state &&
        client?.selectedClient?.physicalAddress?.postalCode ===
          client?.selectedClient?.postalAddress?.postalCode
      ) {
        // setChecked(true);
      }
    } else {
      setInitialValues({
        clientID: "",
        firstName: "",
        lastName: "",
        preferredName: "",
        email: "",
        gender: "Male",
        birthday: dayjs().format("YYYY-MM-DD"),
        clientLanguages: [] as string[],
        phoneNumbers: ["", ""],
        clientType: "",
        clientStatus: "",
        profilePhoto: "",
        joinDate: dayjs().format("YYYY-MM-DD"),
        aboutMe: "",
        physicalAddress: {
          id: 0,
          address: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          longitude: "",
          latitude: "",
        },
        postalAddress: {
          id: 0,
          address: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          longitude: "",
          latitude: "",
        },
        interests: "",
        dislikes: "",
        clientClassifications: [] as string[],
      });
    }
  }, [
    client?.selectedClient,
    languages,
    clientTypes,
    classifications,
    clientStatuses,
  ]);

  // Update useState after data is loaded
  useEffect(() => {
    if (selector.classifications.length > 0) {
      const formattedClassifications = selector.classifications.map(
        (classi) => ({
          label: classi.classificationName,
          value: classi.classificationID,
        })
      );
      setClassifications(formattedClassifications);
    }

    if (selector.clientTypes.length > 0) {
      const formattedClientTypes = selector.clientTypes.map((cType) => ({
        label: cType.name,
        value: cType.clientTypeID,
      }));
      setClientTypes(formattedClientTypes);
    }

    if (selector.languages.length > 0) {
      const formattedLanguages = selector.languages.map((lang) => ({
        label: lang.language,
        value: lang.languageID,
      }));
      setLanguages(formattedLanguages);
    }

    if (selector.clientStatus.length > 0) {
      const formattedClientStatuses = selector.clientStatus.map((status) => ({
        label: status.status,
        value: status.clientStatusID,
      }));
      setClientStatuses(formattedClientStatuses);
    }
  }, [selector.State]);

  const fetchSupportDetails = async () => {
    await dispatch(fetchClassifications());
    await dispatch(fetchLanguages());
    await dispatch(fetchClientTypes());
    await dispatch(fetchClientStatus());
  };

  const checkBoxHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    gender: Yup.string().required("Gender is required"),
    birthday: Yup.date().required("Birthday is required"),
    clientLanguages: Yup.array()
      .min(1, "Select at least one language")
      .required("Languages are required"),
    phoneNumbers: Yup.array()
      .of(
        Yup.string()
          .required("Phone number is required")
          .matches(
            /^\+?[1-9]\d{1,14}$/,
            "Invalid phone number format. Use international format like +1234567890."
          )
      )
      .min(2, "Both phone numbers are required"),
    clientType: Yup.string().required("Client Type is required"),
    clientStatus: Yup.string().required("Client Status is required"),
    aboutMe: Yup.string().required("About Me is required"),
    physicalAddress: Yup.object().shape({
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      postalCode: Yup.string().required("Postal Code is required"),
    }),
    postalAddress: Yup.object().shape({
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      postalCode: Yup.string().required("Postal Code is required"),
    }),
    interests: Yup.string().required("Interests are required"),
    dislikes: Yup.string().required("Dislikes are required"),
    clientClassifications: Yup.array()
      .min(1, "Select at least one classification")
      .required("Classifications are required"),
  });

  return (
    <Formik
      initialValues={initialValue}
      validationSchema={validationSchema}
      validateOnBlur={true}
      validateOnChange={true}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        if (client?.selectedClient) {
          dispatch(updateClient({ clientData: values }));
        } else {
          dispatch(saveClient({ clientData: values, profilePhoto: null }));
        }
        console.log("Submitting values", values);
        setSubmitting(false);
      }}
    >
      {(formikProps: FormikProps<Client>) => {
        const handleAddressSelect = (
          place: google.maps.places.PlaceResult,
          type: string
        ) => {
          if (!autocomplete) return;
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

          if (type === "physical") {
            setAddressDetails({
              address,
              city,
              state,
              postalCode,
            });
          } else {
            setAddressDetailsPostal({
              address,
              city,
              state,
              postalCode,
            });
          }
        };

        useEffect(() => {
          console.log("Address Details", addressDetails);

          if (addressDetails) {
            // Update the form values with the selected address details
            formikProps.setFieldValue(
              "physicalAddress.address",
              addressDetails.address
            );
            formikProps.setFieldValue(
              "physicalAddress.city",
              addressDetails.city
            );
            formikProps.setFieldValue(
              "physicalAddress.state",
              addressDetails.state
            );
            formikProps.setFieldValue(
              "physicalAddress.postalCode",
              addressDetails.postalCode
            );
          }
        }, [addressDetails]);

        useEffect(() => {
          console.log("Address Details", addressDetails);

          if (addressDetailsPostal) {
            // Update the form values with the selected address details
            formikProps.setFieldValue(
              "postalAddress.address",
              addressDetailsPostal.address
            );
            formikProps.setFieldValue(
              "postalAddress.city",
              addressDetailsPostal.city
            );
            formikProps.setFieldValue(
              "postalAddress.state",
              addressDetailsPostal.state
            );
            formikProps.setFieldValue(
              "postalAddress.postalCode",
              addressDetailsPostal.postalCode
            );
          }
        }, [addressDetailsPostal]);

        useEffect(() => {
          if (checked) {
            formikProps.setFieldValue(
              "postalAddress.address",
              formikProps.values.physicalAddress.address
            );
            formikProps.setFieldValue(
              "postalAddress.city",
              formikProps.values.physicalAddress.city
            );
            formikProps.setFieldValue(
              "postalAddress.state",
              formikProps.values.physicalAddress.state
            );
            formikProps.setFieldValue(
              "postalAddress.postalCode",
              formikProps.values.physicalAddress.postalCode
            );
          } else {
            // formikProps.setFieldValue("postalAddress.address", "");
            // formikProps.setFieldValue("postalAddress.city", "");
            // formikProps.setFieldValue("postalAddress.state", "");
            // formikProps.setFieldValue("postalAddress.postalCode", "");
          }
        }, [checked]);

        useEffect(() => {
          if (client.submitState === State.success) {
            formikProps.resetForm();
          }
        }, [client.submitState]);
        return (
          <Form onSubmit={formikProps.handleSubmit}>
            {activeStepper === 0 && (
              <Stack width={"100%"} flexDirection="column">
                <Grid container columnSpacing={2} rowSpacing={3}>
                  {/* First Name */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      required
                      name="firstName"
                      value={formikProps.values.firstName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={
                        formikProps.touched.firstName &&
                        Boolean(formikProps.errors.firstName)
                      }
                      helperText={
                        formikProps.touched.firstName &&
                        typeof formikProps.errors.firstName === "string"
                          ? formikProps.errors.firstName
                          : undefined
                      }
                    />
                  </Grid>

                  {/* Last Name */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      required
                      name="lastName"
                      value={formikProps.values.lastName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={
                        formikProps.touched.lastName &&
                        Boolean(formikProps.errors.lastName)
                      }
                      helperText={
                        formikProps.touched.lastName &&
                        typeof formikProps.errors.lastName === "string"
                          ? formikProps.errors.lastName
                          : undefined
                      }
                    />
                  </Grid>

                  {/* Last Name */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Preferred Name"
                      variant="outlined"
                      fullWidth
                      required
                      name="preferredName"
                      value={formikProps.values.preferredName}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={
                        formikProps.touched.preferredName &&
                        Boolean(formikProps.errors.preferredName)
                      }
                      helperText={
                        formikProps.touched.preferredName &&
                        typeof formikProps.errors.preferredName === "string"
                          ? formikProps.errors.preferredName
                          : undefined
                      }
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      fullWidth
                      required
                      type="email"
                      name="email"
                      value={formikProps.values.email}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={
                        formikProps.touched.email &&
                        Boolean(formikProps.errors.email)
                      }
                      helperText={
                        formikProps.touched.email &&
                        typeof formikProps.errors.email === "string"
                          ? formikProps.errors.email
                          : undefined
                      }
                    />
                  </Grid>

                  {/* Gender */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        label="Gender"
                        name="gender"
                        value={formikProps.values.gender}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.gender &&
                          Boolean(formikProps.errors.gender)
                        }
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                      {formikProps.errors.gender && (
                        <FormHelperText error>
                          {typeof formikProps.errors.gender === "string"
                            ? formikProps.errors.gender
                            : ""}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Birthday */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Birthday"
                      type="date"
                      variant="outlined"
                      fullWidth
                      required
                      name="birthday"
                      value={formikProps.values.birthday}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      error={
                        formikProps.touched.birthday &&
                        Boolean(formikProps.errors.birthday)
                      }
                      helperText={
                        formikProps.touched.birthday &&
                        typeof formikProps.errors.birthday === "string"
                          ? formikProps.errors.birthday
                          : undefined
                      }
                    />
                  </Grid>

                  {/* Languages */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Languages</InputLabel>
                      <Select
                        multiple
                        value={formikProps.values.clientLanguages}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        name="clientLanguages"
                        renderValue={(selected) => (
                          <div>
                            {selected.map((value: string) => (
                              <Chip
                                key={value}
                                label={
                                  languages.find((lang) => lang.value == value)
                                    ?.label
                                }
                              />
                            ))}
                          </div>
                        )}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            <Checkbox
                              checked={formikProps.values.clientLanguages.includes(
                                lang.value
                              )}
                            />
                            <ListItemText>{lang.label}</ListItemText>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography
                        onClick={() =>
                          setSupportTypeCreater({
                            isOpen: true,
                            supportType: "language",
                          })
                        }
                        align="right"
                        variant="body2"
                        color="primary"
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        New Language
                      </Typography>
                      {formikProps.touched.clientLanguages &&
                        formikProps.errors.clientLanguages && (
                          <FormHelperText error>
                            {typeof formikProps.errors.clientLanguages ===
                            "string"
                              ? formikProps.errors.clientLanguages
                              : ""}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  {/* Client Type */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Client Type</InputLabel>
                      <Select
                        label="Client Type"
                        name="clientType"
                        value={formikProps.values.clientType}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        error={
                          formikProps.touched.clientType &&
                          Boolean(formikProps.errors.clientType)
                        }
                      >
                        {clientTypes.map((cType) => (
                          <MenuItem key={cType.value} value={cType.value}>
                            {cType.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography
                        onClick={() =>
                          setSupportTypeCreater({
                            isOpen: true,
                            supportType: "clientType",
                          })
                        }
                        align="right"
                        variant="body2"
                        color="primary"
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        New Client Type
                      </Typography>
                      {formikProps.touched.clientType &&
                        formikProps.errors.clientType && (
                          <FormHelperText error>
                            {typeof formikProps.errors.clientType === "string"
                              ? formikProps.errors.clientType
                              : ""}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  {/* Client Status */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Client Status</InputLabel>
                      <Select
                        label="Client Status"
                        name="clientStatus"
                        value={formikProps.values.clientStatus}
                        onChange={formikProps.handleChange}
                        onBlur={formikProps.handleBlur}
                        error={
                          formikProps.touched.clientStatus &&
                          Boolean(formikProps.errors.clientStatus)
                        }
                      >
                        {clientStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography
                        onClick={() =>
                          setSupportTypeCreater({
                            isOpen: true,
                            supportType: "clientStatus",
                          })
                        }
                        align="right"
                        variant="body2"
                        color="primary"
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        New Status
                      </Typography>
                      {formikProps.touched.clientStatus &&
                        formikProps.errors.clientStatus && (
                          <FormHelperText error>
                            {typeof formikProps.errors.clientStatus === "string"
                              ? formikProps.errors.clientStatus
                              : ""}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required>
                      <InputLabel>Client Classification</InputLabel>
                      <Select
                        multiple
                        value={formikProps.values.clientClassifications}
                        onChange={formikProps.handleChange}
                        name="clientClassifications"
                        onBlur={formikProps.handleBlur}
                        renderValue={(selected) => (
                          <div>
                            {selected.map((value: string) => (
                              <Chip
                                key={value}
                                label={
                                  classifications.find(
                                    (cls) => cls.value == value
                                  )?.label
                                }
                              />
                            ))}
                          </div>
                        )}
                      >
                        {classifications.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            <Checkbox
                              checked={formikProps.values.clientClassifications.includes(
                                lang.value
                              )}
                            />
                            <ListItemText>{lang.label}</ListItemText>
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography
                        onClick={() =>
                          setSupportTypeCreater({
                            isOpen: true,
                            supportType: "classification",
                          })
                        }
                        align="right"
                        variant="body2"
                        color="primary"
                        sx={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        New Classification
                      </Typography>
                      {formikProps.touched.clientLanguages &&
                        formikProps.errors.clientLanguages && (
                          <FormHelperText error>
                            {typeof formikProps.errors.clientLanguages ===
                            "string"
                              ? formikProps.errors.clientLanguages
                              : ""}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  {/* Phone Numbers */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      fullWidth
                      required
                      name="phoneNumbers[0]"
                      onBlur={formikProps.handleBlur}
                      value={formikProps.values.phoneNumbers[0]}
                      onChange={formikProps.handleChange}
                      error={
                        formikProps.touched.phoneNumbers &&
                        Boolean(formikProps.errors.phoneNumbers?.[0])
                      }
                      helperText={
                        formikProps.touched.phoneNumbers &&
                        formikProps.errors.phoneNumbers?.[0]
                      }
                    />
                  </Grid>
                  {/* Phone Numbers */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Emeregncy Contact"
                      variant="outlined"
                      fullWidth
                      required
                      name="phoneNumbers[1]"
                      value={formikProps.values.phoneNumbers[1]}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      error={
                        formikProps.touched.phoneNumbers &&
                        Boolean(formikProps.errors.phoneNumbers?.[1])
                      }
                      helperText={
                        formikProps.touched.phoneNumbers &&
                        formikProps.errors.phoneNumbers?.[1]
                      }
                    />
                  </Grid>
                </Grid>
                <SupportAddings
                  supportTypeCreater={supportTypeCreater}
                  setSupportTypeCreater={setSupportTypeCreater}
                />
              </Stack>
            )}
            {activeStepper === 1 && (
              <Stack width="100%">
                <Stack flexDirection="column">
                  <CustomRichTextField
                    id="client info"
                    label="Client Info"
                    required
                    height="150px"
                    name="aboutMe"
                    onChange={(value) => {
                      formikProps.setFieldValue("aboutMe", value);
                    }}
                    value={formikProps.values.aboutMe}
                    error={
                      formikProps.touched.aboutMe &&
                      Boolean(formikProps.errors.aboutMe)
                    }
                    touched={formikProps.touched.aboutMe}
                    helperText={
                      formikProps.touched.aboutMe &&
                      typeof formikProps.errors.aboutMe === "string"
                        ? formikProps.errors.aboutMe
                        : undefined
                    }
                    setFieldTouched={formikProps.setFieldTouched}
                  />
                </Stack>
                <Stack flexDirection="row" justifyContent="space-between">
                  <Stack width={"47%"}>
                    <CustomRichTextField
                      id="Interest"
                      label="Interest"
                      required
                      height="150px"
                      name="interests"
                      touched={formikProps.touched.interests}
                      onChange={(value) => {
                        formikProps.setFieldValue("interests", value);
                      }}
                      value={formikProps.values.interests}
                      error={
                        formikProps.touched.interests &&
                        Boolean(formikProps.errors.interests)
                      }
                      helperText={
                        formikProps.touched.interests &&
                        typeof formikProps.errors.interests === "string"
                          ? formikProps.errors.interests
                          : undefined
                      }
                      setFieldTouched={formikProps.setFieldTouched}
                    />
                  </Stack>
                  <Stack width="47%">
                    <CustomRichTextField
                      id="dislikes"
                      label="Dislikes"
                      required
                      height="150px"
                      name="dislikes"
                      touched={formikProps.touched.dislikes}
                      onChange={(value) => {
                        formikProps.setFieldValue("dislikes", value);
                      }}
                      value={formikProps.values.dislikes}
                      error={
                        formikProps.touched.dislikes &&
                        Boolean(formikProps.errors.dislikes)
                      }
                      helperText={
                        formikProps.touched.dislikes &&
                        typeof formikProps.errors.dislikes === "string"
                          ? formikProps.errors.dislikes
                          : undefined
                      }
                      setFieldTouched={formikProps.setFieldTouched}
                    />
                  </Stack>
                </Stack>
              </Stack>
            )}
            {activeStepper === 2 && (
              <Stack>
                <Stack>
                  <Typography>Physical Address</Typography>
                  <Grid container spacing={3}>
                    {/* Address Search */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={{
                          componentRestrictions: { country: "au" },
                        }}
                        onLoad={(autocompleteInstance) =>
                          setAutocomplete(autocompleteInstance)
                        }
                        onPlaceChanged={() => {
                          if (autocomplete) {
                            const place = autocomplete.getPlace();
                            console.log("Selected Place:", place); // Check the place object
                            handleAddressSelect(place, "physical"); // Pass the place data to the handler
                          }
                        }}
                      >
                        <TextField
                          label="Search Address"
                          variant="outlined"
                          fullWidth
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
                        onBlur={formikProps.handleBlur}
                        name="physicalAddress.address"
                        value={formikProps.values.physicalAddress.address}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.physicalAddress?.address &&
                          Boolean(formikProps.errors.physicalAddress?.address)
                        }
                        helperText={
                          formikProps.touched.physicalAddress?.address &&
                          formikProps.errors.physicalAddress?.address
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* City, State, PostalCode */}
                  <Grid container spacing={3} mt={0.5}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        onBlur={formikProps.handleBlur}
                        name="physicalAddress.city"
                        value={formikProps.values.physicalAddress.city}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.physicalAddress?.city &&
                          Boolean(formikProps.errors.physicalAddress?.city)
                        }
                        helperText={
                          formikProps.touched.physicalAddress?.city &&
                          formikProps.errors.physicalAddress?.city
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="State"
                        variant="outlined"
                        fullWidth
                        name="physicalAddress.state"
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.physicalAddress.state}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.physicalAddress?.state &&
                          Boolean(formikProps.errors.physicalAddress?.state)
                        }
                        helperText={
                          formikProps.touched.physicalAddress?.state &&
                          formikProps.errors.physicalAddress?.state
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Postal Code"
                        variant="outlined"
                        fullWidth
                        onBlur={formikProps.handleBlur}
                        name="physicalAddress.postalCode"
                        value={formikProps.values.physicalAddress.postalCode}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.physicalAddress?.postalCode &&
                          Boolean(
                            formikProps.errors.physicalAddress?.postalCode
                          )
                        }
                        helperText={
                          formikProps.touched.physicalAddress?.postalCode &&
                          formikProps.errors.physicalAddress?.postalCode
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
                <Stack mt={1}>
                  <Typography variant="h6" color="primary">
                    Postal Address
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox onChange={checkBoxHandle} />}
                    label="Same as physical address"
                  />

                  <Grid container columnSpacing={3}>
                    {/* Address Search */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={{
                          componentRestrictions: { country: "au" },
                        }}
                        onLoad={(autocomplete) => {
                          const place = autocomplete.getPlace();
                          handleAddressSelect(place, "postal");
                        }}
                      >
                        <TextField
                          label="Search Address"
                          variant="outlined"
                          fullWidth
                          name="search"
                          value={searchInputPostal}
                          onChange={(e) => setSearchInputPostal(e.target.value)}
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
                        name="postalAddress.address"
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.postalAddress.address}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.postalAddress?.address &&
                          Boolean(formikProps.errors.postalAddress?.address)
                        }
                        helperText={
                          formikProps.touched.postalAddress?.address &&
                          formikProps.errors.postalAddress?.address
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* City, State, PostalCode */}
                  <Grid container columnSpacing={3} rowSpacing={3} mt={0.1}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        name="postalAddress.city"
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.postalAddress.city}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.postalAddress?.city &&
                          Boolean(formikProps.errors.postalAddress?.city)
                        }
                        helperText={
                          formikProps.touched.postalAddress?.city &&
                          formikProps.errors.postalAddress?.city
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="State"
                        variant="outlined"
                        fullWidth
                        name="postalAddress.state"
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.postalAddress.state}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.postalAddress?.state &&
                          Boolean(formikProps.errors.postalAddress?.state)
                        }
                        helperText={
                          formikProps.touched.postalAddress?.state &&
                          formikProps.errors.postalAddress?.state
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Postal Code"
                        variant="outlined"
                        fullWidth
                        name="postalAddress.postalCode"
                        onBlur={formikProps.handleBlur}
                        value={formikProps.values.postalAddress.postalCode}
                        onChange={formikProps.handleChange}
                        error={
                          formikProps.touched.postalAddress?.postalCode &&
                          Boolean(formikProps.errors.postalAddress?.postalCode)
                        }
                        helperText={
                          formikProps.touched.postalAddress?.postalCode &&
                          formikProps.errors.postalAddress?.postalCode
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Stack>
            )}

            <Box mt={3} textAlign="center" display="none">
              <button style={{ display: "none" }} type="submit" id="submit-btn">
                Submit
              </button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddClientForm;
