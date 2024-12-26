import React, { useEffect, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import * as Yup from "yup";
import {
  Button,
  Grid,
  Avatar,
  Typography,
  MenuItem,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Employee } from "../../../slices/employeeSlice/employee";
import { useAppSelector } from "../../../slices/store";
import { State } from "../../../types/types";
import { FILE_DOWNLOAD_BASE_URL } from "../../../config/config";
import { Autocomplete } from "@react-google-maps/api";
import { set } from "date-fns";

// Validation schema using Yup
const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  joinDate: Yup.date().required("Join date is required"),
  // profilePhoto: Yup.mixed().required("Profile photo is required"),
  employeePhoneNo: Yup.array()
    .of(Yup.string().required("Phone number is required"))
    .min(2, "Both phone numbers are required")
    .test(
      "unique-phone-numbers",
      "Phone numbers must be unique",
      (phoneNumbers) => {
        if (!phoneNumbers) return true;
        const uniquePhoneNumbers = new Set(phoneNumbers);
        return uniquePhoneNumbers.size === phoneNumbers.length;
      }
    ),
  employeeAddresses: Yup.array().of(
    Yup.object().shape({
      // longitude: Yup.string().required("Longitude is required"),
      // latitude: Yup.string().required("Latitude is required"),
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      // country: Yup.string().required("Country is required"),
      postal_code: Yup.string().required("Postal code is required"),
    })
  ),
});

// Styled components
const UploadInput = styled("input")({
  display: "none",
});

interface EmployeeBasicInfoFormProps {
  employeeBasicInformation: Employee;
  setEmployeeBasicInformation: (value: Employee) => void;
  profilePic: File | null;
  setProfilePic: (value: File | null) => void;
  errorState: "Pending" | "Validated";
  setErrorState: (value: "Pending" | "Validated") => void;
  modalOpenState: boolean;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
}

const EmployeeBasicInfoForm: React.FC<EmployeeBasicInfoFormProps> = ({
  isEditMode,
  setIsEditMode,
  modalOpenState,
  employeeBasicInformation,
  setEmployeeBasicInformation,
  profilePic,
  setProfilePic,
  setErrorState,
  errorState,
}) => {
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const employeeSlice = useAppSelector((state) => state.employees);
  const careGiverSlice = useAppSelector((state) => state.careGivers);
  const [searchInput, setSearchInput] = useState("");
  const [addressDetails, setAddressDetails] = useState<any>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [initialValues, setInitialValues] = useState<
    Omit<Employee, "employeeID" | "password">
  >({
    firstName: "",
    lastName: "",
    email: "",
    accessRole: "",
    joinDate: "",
    profile_photo: "",
    employeeAddresses: [
      {
        longitude: "asd",
        latitude: "asd",
        address: "",
        city: "asd",
        state: "",
        country: "",
        postal_code: "",
      },
    ],
    status: "",
    employeeJobRoles: [],
    employeePhoneNo: ["", ""],
  });

  useEffect(() => {
    if (employeeSlice?.selectedEmployee) {
      console.log("Selected Employee: ", employeeSlice.selectedEmployee);

      setInitialValues({
        ...employeeSlice.selectedEmployee,
      });
      if (employeeSlice.selectedEmployee.profile_photo) {
        setProfilePhotoPreview(
          `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
            employeeSlice.selectedEmployee.profile_photo
          )}`
        );
      }
    } else {
      setProfilePhotoPreview(null);
      setInitialValues({
        firstName: "",
        lastName: "",
        email: "",
        accessRole: "",
        joinDate: "",
        profile_photo: "",
        employeeAddresses: [
          {
            longitude: "",
            latitude: "",
            address: "",
            city: "",
            state: "",
            country: "",
            postal_code: "",
          },
        ],
        status: "",
        employeeJobRoles: [],
        employeePhoneNo: ["", ""],
      });
    }
  }, [employeeSlice?.selectedEmployee]);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // setFieldValue("profilePhoto", file);
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values: typeof initialValues) => {
    console.log("Form Submitted:", values);
    setEmployeeBasicInformation({
      ...values,
      employeeID: employeeSlice?.selectedEmployee
        ? employeeSlice?.selectedEmployee?.employeeID
        : "",
      password: "",
    });
    setErrorState("Validated");
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={true}
      enableReinitialize={true}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        resetForm,
      }: FormikProps<typeof initialValues>) => {
        useEffect(() => {
          console.log("Errors: ", errors);
        }, [employeeBasicInformation]);

        useEffect(() => {
          if (
            employeeSlice.submitState === State.success ||
            careGiverSlice?.submitState === State.success ||
            employeeSlice?.updateState === State.success ||
            careGiverSlice?.updateState === State.success
          ) {
            resetForm();
            setProfilePhotoPreview(null);
            setProfilePic(null);
          }
        }, [employeeSlice.submitState]);

        useEffect(() => {
          if (!modalOpenState) {
            console.log("resetting form");
            resetForm();
            setProfilePhotoPreview(null);
            setProfilePic(null);
          }
        }, [modalOpenState]);

        const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
          if (!autocomplete) return;
          // const place = autocomplete.getPlace();
          const addressComponents = place?.address_components;
          const address = place?.formatted_address;

          let city = "";
          let state = "";
          let postalCode = "";
          let latitude = 0;
          let longitude = 0;

          // Get the latitude and longitude
          const location = place?.geometry?.location;
          if (location) {
            latitude = location.lat();
            longitude = location.lng();
          }

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
            latitude,
            longitude,
          });
        };

        useEffect(() => {
          if (addressDetails) {
            // Update the form values with the selected address details
            setFieldValue(
              "employeeAddresses[0].address",
              addressDetails.address
            );
            setFieldValue("employeeAddresses[0].state", addressDetails.state);
            setFieldValue("employeeAddresses[0].city", addressDetails.city);
            setFieldValue(
              "employeeAddresses[0].longitude",
              addressDetails.longitude
            );
            setFieldValue(
              "employeeAddresses[0].latitude",
              addressDetails.latitude
            );
            setFieldValue(
              "employeeAddresses[0].postal_code",
              addressDetails.postalCode
            );
          }
        }, [addressDetails]);

        //  useEffect(()=>{
        //   console.log("triggered modal open ",modalOpenState);
        //   if(!modalOpenState){
        //     resetForm();
        //     setProfilePhotoPreview(null);
        //     setProfilePic(null);
        //   }
        //  },[modalOpenState])

        return (
          <Form>
            <Grid container spacing={2}>
              {/* Profile Picture */}
              <Grid item xs={12} md={4} sx={{ mt: 3 }}>
                <label htmlFor="upload-photo">
                  <Avatar
                    sx={{
                      width: 150,
                      height: 150,
                      margin: "auto",
                      bgcolor: "grey.300",
                      cursor: "pointer",
                    }}
                    src={profilePhotoPreview || undefined}
                  />
                </label>
                <UploadInput
                  accept="image/*"
                  id="upload-photo"
                  type="file"
                  // disabled={!isEditMode}
                  onChange={(e) => handleFileUpload(e, setFieldValue)}
                />
                <Typography variant="h6" sx={{ my: 1 }} textAlign="center">
                  Profile Photo
                </Typography>
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="textDisabled"
                >
                  Click on the avatar to upload a photo
                </Typography>
              </Grid>

              {/* Form Fields */}
              <Grid item xs={12} md={8}>
                <Grid spacing={2} container>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="First Name"
                      name="firstName"
                      fullWidth
                      readOnly={!isEditMode}
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="Last Name"
                      name="lastName"
                      fullWidth
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label="Email"
                      name="email"
                      fullWidth
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="Phone No"
                      name="employeePhoneNo[0]"
                      fullWidth
                      error={
                        touched.employeePhoneNo &&
                        Boolean(errors.employeePhoneNo?.[0])
                      }
                      helperText={
                        touched.employeePhoneNo && errors.employeePhoneNo?.[0]
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="Emergency Phone No"
                      name="employeePhoneNo[1]"
                      fullWidth
                      error={
                        touched.employeePhoneNo &&
                        Boolean(errors.employeePhoneNo?.[1])
                      }
                      helperText={
                        touched.employeePhoneNo && errors.employeePhoneNo?.[1]
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="Join Date"
                      type="date"
                      name="joinDate"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={touched.joinDate && Boolean(errors.joinDate)}
                      helperText={touched.joinDate && errors.joinDate}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    {/* <Field
                    as={TextField}
                    select
                    label="Gender"
                    name="gender"
                    fullWidth
                    error={touched.gender && Boolean(errors.gender)}
                    helperText={touched.gender && errors.gender}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Field> */}
                  </Grid>
                </Grid>
              </Grid>

              {/* Address Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Employee Address
                </Typography>
                <Grid container spacing={2}>
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
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      label="Address"
                      name="employeeAddresses[0].address"
                      fullWidth
                      error={
                        touched.employeeAddresses?.[0]?.address &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        Boolean(errors.employeeAddresses?.[0]?.address)
                      }
                      helperText={
                        touched.employeeAddresses?.[0]?.address &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        errors.employeeAddresses?.[0]?.address
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="City"
                      name="employeeAddresses[0].city"
                      fullWidth
                      error={
                        touched.employeeAddresses?.[0]?.city &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        Boolean(errors.employeeAddresses?.[0]?.city)
                      }
                      helperText={
                        touched.employeeAddresses?.[0]?.city &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        errors.employeeAddresses?.[0]?.city
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="State"
                      name="employeeAddresses[0].state"
                      fullWidth
                      error={
                        touched.employeeAddresses?.[0]?.state &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        Boolean(errors.employeeAddresses?.[0]?.state)
                      }
                      helperText={
                        touched.employeeAddresses?.[0]?.state &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        errors.employeeAddresses?.[0]?.state
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      label="Postal Code"
                      name="employeeAddresses[0].postal_code"
                      fullWidth
                      error={
                        touched.employeeAddresses?.[0]?.postal_code &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        Boolean(errors.employeeAddresses?.[0]?.postal_code)
                      }
                      helperText={
                        touched.employeeAddresses?.[0]?.postal_code &&
                        typeof errors.employeeAddresses?.[0] === "object" &&
                        errors.employeeAddresses?.[0]?.postal_code
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  sx={{ display: "none" }}
                  id="employeeMainData"
                  type="submit"
                  fullWidth
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export default EmployeeBasicInfoForm;
