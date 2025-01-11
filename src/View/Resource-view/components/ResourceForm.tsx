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
  useMediaQuery,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Formik, Field, Form, FormikProps, validateYupSchema } from "formik";
import * as Yup from "yup";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { State } from "../../../types/types";
import { Card, Upload } from "antd";
import FileListTable from "../../../component/common/FileListTable";
import FileViewerWithModal from "../../../component/common/FileViewerWithModal";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  Resource,
  ResourceDocument,
  saveResource,
  updateResource,
} from "../../../slices/resourceSlice/resource";

// Validation schema using Yup
const validationSchema = Yup.object({
  resourceName: Yup.string().required("Note Type is required"),
});

interface AddResourceFormProps {
  isResourceModalVisible: boolean;
  isEditMode: boolean;
}

export interface UIShowingFile {
  name: string;
  docID: string;
  status: "New" | "Old";
}

const ResourceForm: React.FC<AddResourceFormProps> = ({
  isResourceModalVisible: isNoteModalVisible,
  isEditMode,
}) => {
  const [uploadedFils, setUploadedFiles] = useState<File[]>([]);
  const [previouslyUploadedFiles, setPreviouslyUploadedFiles] = useState<
    ResourceDocument[]
  >([]);
  const [UIShowingFile, setUIShowingFile] = useState<UIShowingFile[]>([]);
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const authInfo = useAppSelector((state) => state.auth.userInfo);
  const [psdImageShowerModalOpen, setPsdImageShowerModalOpen] =
    useState<boolean>(false);
  const [imageViewerImageURl, setImageViewerImageURl] = useState<File | string>(
    ""
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const resourceSlice = useAppSelector((state) => state.resource);
  const [initialValues, setInitialValues] = useState<Resource>({
    resourceId: "",
    resourceName: "",
    validFrom: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
    validTo: dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm:ss"),
    notes: "",
    shareType: "Internal Only",
    creatorId: authInfo?.userID || "",
    resourceDocuments: [],
  });

  const [clientAppointmentAndTask, setClientAppointmentAndTask] = useState<{
    appointments: string[];
    tasks: string[];
  }>({ appointments: [], tasks: [] });


  useEffect(() => {
    if (resourceSlice.selectedResource != null) {
      setInitialValues({
        ...resourceSlice.selectedResource,
        validFrom: dayjs(resourceSlice.selectedResource.validFrom).format(
          "YYYY-MM-DD"
        ),
        validTo: dayjs(resourceSlice.selectedResource.validTo).format(
          "YYYY-MM-DD"
        ),
      });
      setUIShowingFile([
        ...(resourceSlice.selectedResource?.resourceDocuments?.map((doc) => ({
          name: doc.documentName?.split(".")[0] || "",
          docID: doc.documentId || "",
          status: "Old" as "Old",
        })) || []),
      ]);
    } else {
      setInitialValues({
        resourceId: "",
        resourceName: "",
        validFrom: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        validTo: dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm:ss"),
        notes: "",
        shareType: "Internal Only",
        creatorId: authInfo?.userID || "",
        resourceDocuments: [],
      });
      setUploadedFiles([]);
    }
  }, [resourceSlice?.selectedResource, isNoteModalVisible]);


  const handleClosePDFViewer = () => {
    setPsdImageShowerModalOpen(false);
    setImageViewerImageURl("");
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
      const viewingFile =
        resourceSlice?.selectedResource?.resourceDocuments?.find(
          (f) => f.documentId == file.docID
        );
      if (viewingFile?.documentId) {
        setImageViewerImageURl(viewingFile?.documentLocation || "");
        setPsdImageShowerModalOpen(true);
      }
    } else if (file.status === "New") {
      console.log("file kos ", file);

      const viewingFile = uploadedFils.find((f) => f.name == file.docID);
      if (viewingFile) {
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
        resourceSlice?.selectedResource?.resourceDocuments?.find(
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
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values, { setSubmitting }) => {
        if (values.validFrom) {
          values.validFrom = dayjs(values.validFrom).format(
            "YYYY-MM-DDTHH:mm:ss"
          );
        }
        if (values.validTo) {
          values.validTo = dayjs(values.validTo).format("YYYY-MM-DDTHH:mm:ss");
        }
        console.log("values", values);
        if (resourceSlice.selectedResource) {
          dispatch(
            updateResource({
              resource: values,
              files: uploadedFils,
              resourceId: values.resourceId,
            })
          );
        } else {
          dispatch(saveResource({ resource: values, files: uploadedFils }));
        }
        setSubmitting(false);
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
      }: FormikProps<Resource>) => {
        useEffect(() => {
          if (
            resourceSlice.submitState == State.success ||
            resourceSlice?.updateState == State.success
          ) {
            resetForm();
            setUploadedFiles([]);
            setUIShowingFile([]);
            setPreviouslyUploadedFiles([]);
          }
        }, [resourceSlice?.submitState, resourceSlice?.updateState]);

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
                  name="resourceName"
                  label="Resource Name"
                  value={values.resourceName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.resourceName && Boolean(errors.resourceName)}
                  helperText={touched.resourceName && errors.resourceName}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              {
                !isMobile &&  <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Share Type</InputLabel>
                  <Select
                    name="shareType"
                    readOnly={!isEditMode}
                    value={values.shareType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Share Type"
                  >
                    <MenuItem value="Share With Care Givers">
                      Share With Care Givers
                    </MenuItem>
                    <MenuItem value="Internal Only">Internal Only</MenuItem>
                  </Select>
                  {touched.shareType && errors.shareType && (
                    <FormHelperText error>{errors.shareType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              }
              {
                !isMobile && <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="validFrom"
                  label="Valid From"
                  InputProps={{ readOnly: !isEditMode }}
                  value={values.validFrom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.validFrom && Boolean(errors.validFrom)}
                  helperText={touched.validFrom && errors.validFrom}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              }
              
              {/* Effective Date */}

              {
                !isMobile && <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="validTo"
                  label="Valid To"
                  InputProps={{ readOnly: !isEditMode }}
                  value={values.validTo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.validTo && Boolean(errors.validTo)}
                  helperText={touched.validTo && errors.validTo}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              }
              
              {/* Description */}
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
                  rows={4}
                />
              </Grid>
              <button
                id="resource-submit-button"
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
                Upload Resources
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
                    Upload Files
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
          </Form>
        );
      }}
    </Formik>
  );
};
export default ResourceForm;
