import React, { useState } from "react";
import { Drawer } from "antd";
import {
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { SettingsCardTitle } from "../../../types/types";
import {
  appointmentTypeColumns,
  carePlanStatusColumns,
  clientClassificationColumns,
  clientStatusColumns,
  clientTypeColumns,
  documentTypeColumns,
  incidentStatusColumns,
  incidentTypeColumns,
  languageColumns,
  paymentType,
} from "./DataGridColumns";
import QuestionManager from '../components/QuestionManager';
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { SketchPicker } from "react-color";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {
  ClientType,
  Language,
  saveClassification,
  saveClientStatus,
  saveClientType,
  SaveLanguage,
  updateClassification,
  updateClientStatus,
  updateClientType,
  updateLanguage,
} from "@slices/selectorSlice/selector";
import { saveCarePlan, saveCarePlanStatus, updateCarePlanStatus } from "@slices/carePlanSlice/carePlan";
import { saveAppointmentTypes, updateAppointmentTypes } from "@slices/AppointmentSlice/appointment";
import { saveIncidentStatus, saveIncidentTypes, updateIncidentStatus, updateIncidentTypes } from "@slices/IncidentSlice/incident";
import { saveDocumentTypes, savePaymentTypes, updateDocumentTypes, updatePaymentTypes } from "@slices/CareGiverSlice/careGiver";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: SettingsCardTitle | null;
  settingType: SettingsCardTitle | null;
  setSettingType: React.Dispatch<
    React.SetStateAction<SettingsCardTitle | null>
  >;
}



type SettingRow =
  | { id: string; language: string; languageNotes: string }
  | { id: string; classificationName: string; state: string }
  | { id: string; clientTypeName: string; status: string }
  | { id: string; clientStatus: string }
  | { id: string; carePlanStatus: string }
  | { id: string; documentName: string; expDateNeeded: boolean }
  | { id: string; incidentStatus: string }
  | { id: string; incidentTypeTitle: string }
  | { id: string; appointmentName: string; appointmentColor: string };

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  open,
  onClose,
  title = "Settings",
  setSettingType,
  settingType,
}) => {
  const selectorSlice = useAppSelector((state) => state?.selector);
  const carePlanSlice = useAppSelector((state) => state?.carePlans);
  const appointmentSlice = useAppSelector((state) => state?.appointments);
  const incidentSlice = useAppSelector((state) => state?.incident);
  const careGiverSlice = useAppSelector((state) => state?.careGivers);
  const dispatch = useAppDispatch();
  const [selectedRowData, setSelectedRowData] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    language: "",
    languageNotes: "",
    classificationName: "",
    clientTypeName: "",
    clientStatus: "",
    carePlanStatus: "",
    documentName: "",
    expDateNeeded: false,
    incidentStatus: "",
    incidentTypeTitle: "",
    appointmentName: "",
    appointmentColor: "#FFFFFF",
    clientClassificationStatus:"Active",
    clientTypeStatus:"Active",
    docExpNeeded:false,
    incidentTypeStatus:"Active",
    incidentStatusStatus:"Active",
    appointmentTypeStatus:"Active",
    paymentName:"",
    paymentStatus:"Active",

  });

  let columns: GridColDef[];
  switch (settingType) {
    case "Languages":
      columns = languageColumns;
      break;
    case "Client Classification":
      columns = clientClassificationColumns;
      break;
    case "Client Type":
      columns = clientTypeColumns;
      break;
    case "Client Status":
      columns = clientStatusColumns;
      break;
    case "Care Plan Status":
      columns = carePlanStatusColumns;
      break;
    case "Care Giver File Uploads":
      columns = documentTypeColumns;
      break;
    case "Incident Status":
      columns = incidentStatusColumns;
      break;
    case "Incident Types":
      columns = incidentTypeColumns;
      break;
    case "Appointment Types":
      columns = appointmentTypeColumns;
      break;
    case "Care Giver Salary":
      columns = paymentType;
      break;
    default:
      columns = [];
  }

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleColorChange = (color: any) => {
    setFormState((prevState) => ({
      ...prevState,
      appointmentColor: color.hex,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormState({
      language: "",
      languageNotes: "",
      classificationName: "",
      clientTypeName: "",
      clientStatus: "",
      carePlanStatus: "",
      documentName: "",
      expDateNeeded: false,
      incidentStatus: "",
      incidentTypeTitle: "",
      appointmentName: "",
      appointmentColor: "#FFFFFF",
      clientClassificationStatus:"Active",
    clientTypeStatus:"Active",
    docExpNeeded:false,
    incidentTypeStatus:"Active",
    incidentStatusStatus:"Active",
    appointmentTypeStatus:"Active",
    paymentName:"",
    paymentStatus:"Active",
    })
  }

  const handleAdd = () => {
    console.log("Adding data for", settingType, formState);
    console.log("Selected Row Data", selectedRowData);

    if (settingType === "Languages") {
      if (formState.language === "" || formState.languageNotes === "") {
        return;
      }
      if (selectedRowData != null) {
        const languagePayload: Language = {
          languageID: selectedRowData,
          language: formState.language,
          languageNotes: formState.languageNotes,
        };
        dispatch(updateLanguage(languagePayload));
      } else {
        const languagePayload: Language = {
          languageID: "",
          language: formState.language,
          languageNotes: formState.languageNotes,
        };
        dispatch(SaveLanguage(languagePayload));
      }
      
    }else if (settingType === "Client Type") {
      if (formState.clientTypeName === "") {
        return;
      }
      if (selectedRowData != null) {
        const clientTypePayload:ClientType = {
          clientTypeID:selectedRowData,
          name:formState.clientTypeName,
          status:formState.clientTypeStatus
        }
        dispatch(updateClientType(clientTypePayload));
        
      } else {
          const clientTypePayload:ClientType = {
            clientTypeID:"",
            name:formState.clientTypeName,
            status:"Active"
          }
          dispatch(saveClientType(clientTypePayload))
      }
      
    }else if(settingType === "Client Status"){
      if (formState.clientStatus === "") {
        return;
      }
      if (selectedRowData != null) {
          dispatch(updateClientStatus({clientStatusID:selectedRowData,status:formState.clientStatus}))
      }else{
          dispatch(saveClientStatus({status:formState.clientStatus}))
      }
    }else if (settingType ==="Client Classification") {
      if (formState.classificationName === "") {
        return;
      }
      if (selectedRowData != null) {
        dispatch(updateClassification({classificationID:selectedRowData,classificationName:formState.classificationName,state:formState.clientClassificationStatus}))
      }else{
        dispatch(saveClassification({classificationID:"",classificationName:formState.classificationName,state:formState.clientClassificationStatus}))
      }
    }else if(settingType  === "Care Plan Status"){
      if (formState.carePlanStatus === "") {
        return;
      }
      if (selectedRowData != null) {
          dispatch(updateCarePlanStatus({careplanStatusID:selectedRowData,status:formState.carePlanStatus}))
      }else{
        dispatch(saveCarePlanStatus({careplanStatusID:"",status:formState.carePlanStatus}));
      }
    }else if(settingType === "Appointment Types"){
      if (formState?.appointmentColor === "" || formState?.appointmentName === "") {
        return;
      }

      if (selectedRowData != null) {
        dispatch(updateAppointmentTypes({
          appointmentTypeID:selectedRowData,
          name:formState.appointmentName,
          color:formState.appointmentColor,
          status:formState.appointmentTypeStatus
        }))
      }else{
        dispatch(saveAppointmentTypes({
          appointmentTypeID:"",
          name:formState.appointmentName,
          color:formState.appointmentColor,
          status:formState.appointmentTypeStatus
        }))
      }
    }else if(settingType === "Incident Status"){
      if (formState.incidentStatus === "") {
        return;
      }
      if (selectedRowData != null) {
        dispatch(updateIncidentStatus({incidentStatusID:selectedRowData,activeStatus:formState.incidentStatus, status:formState.incidentStatusStatus,description:""}))
      }else{
        dispatch(saveIncidentStatus({incidentStatusID:"",activeStatus:formState.incidentStatus, status:formState.incidentStatusStatus,description:""}));
      }
    }else if(settingType === "Incident Types"){
      if (formState.incidentTypeTitle === "") {
        return;
      }
      if (selectedRowData != null) {
        dispatch(updateIncidentTypes({incidentTypeID:selectedRowData,title:formState.incidentTypeTitle,status:formState.incidentTypeStatus,description:""}))
      }else{
        dispatch(saveIncidentTypes({incidentTypeID:"",title:formState.incidentTypeTitle,status:formState.incidentTypeStatus,description:""}));
      }
    }else if(settingType === "Care Giver File Uploads"){
      if (formState.documentName === "") {
        return;
      }
      if (selectedRowData != null) {
        dispatch(updateDocumentTypes({documentTypeID:selectedRowData,documentName:formState.documentName,expDateNeeded:formState.expDateNeeded}))
      }else{
        dispatch(saveDocumentTypes({documentTypeID:"",documentName:formState.documentName,expDateNeeded:formState.expDateNeeded}));
      }
    } else if (settingType === "Care Giver Salary"){
        if (formState.paymentName === "") {
          return;
        }
        if (selectedRowData != null) {
          dispatch(updatePaymentTypes({paymentTypeID:selectedRowData,paymentName:formState.paymentName,state:formState.paymentStatus}))
        }else{
          dispatch(savePaymentTypes({paymentTypeID:"",paymentName:formState.paymentName,state:formState.paymentStatus}));
        }
    }

    resetForm();
    // Add your logic here to save the new setting
  };

  const handleRowSelection = (selection: GridRowSelectionModel) => {
    console.log("Selected row:", selection);
    const selectedRowId = selection[0];
    if (selection.length > 0) {
      // Get the ID of the selected row

      if (selectedRowId) {
        setSelectedRowData(selection[0] as string);
        switch (settingType) {
          case "Languages":
            const selectedLanguage = selectorSlice?.languages.find(
              (row) => row.languageID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              language: selectedLanguage ? selectedLanguage.language : "",
              languageNotes: selectedLanguage
                ? selectedLanguage.languageNotes
                : "",
            }));
            break;

          case "Client Classification":
            const selectedClassification = selectorSlice?.classifications.find(
              (row) => row.classificationID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              classificationName: selectedClassification
                ? selectedClassification.classificationName
                : "",
                clientClassificationStatus:selectedClassification?.state || "Active"
            }));
            break;

          case "Client Type":
            const selectedClientType = selectorSlice?.clientTypes.find(
              (row) => row.clientTypeID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              clientTypeName: selectedClientType ? selectedClientType.name : "",
              clientTypeStatus:selectedClientType?.status || "Active"
            }));
            break;

          case "Client Status":
            const selectedClientStatus = selectorSlice?.clientStatus.find(
              (row) => row.clientStatusID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              clientStatus: selectedClientStatus
                ? selectedClientStatus.status
                : "",
            }));
            break;

          case "Care Plan Status":
            const selectedCarePlanStatus =
              carePlanSlice?.carePlanStatusList.find(
                (row) => row.careplanStatusID === selectedRowId
              );
            setFormState((prevState) => ({
              ...prevState,
              carePlanStatus: selectedCarePlanStatus
                ? selectedCarePlanStatus.status
                : "",
            }));
            break;

          case "Care Giver File Uploads":
            const selectedDocument =
              careGiverSlice?.careGiverDocumentTypes.find(
                (row) => row.documentTypeID === selectedRowId
              );
            setFormState((prevState) => ({
              ...prevState,
              documentName: selectedDocument
                ? selectedDocument.documentName
                : "",
              expDateNeeded: selectedDocument
                ? selectedDocument.expDateNeeded
                : false,
            }));
            break;

          case "Incident Status":
            const selectedIncidentStatus = incidentSlice?.incidentStatus.find(
              (row) => row.incidentStatusID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              incidentStatus: selectedIncidentStatus
                ? selectedIncidentStatus.activeStatus
                : "",
              incidentStatusStatus:selectedIncidentStatus?.status || "Active"
            }));
            break;

          case "Incident Types":
            const selectedIncidentType = incidentSlice?.incidentsTypes.find(
              (row) => row.incidentTypeID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              incidentTypeTitle: selectedIncidentType
                ? selectedIncidentType.title
                : "",
              incidentTypeStatus:selectedIncidentType?.status || "Active"
            }));
            break;

          case "Appointment Types":
            const selectedAppointmentType =
              appointmentSlice?.appointmentTypes.find(
                (row) => row.appointmentTypeID === selectedRowId
              );
            setFormState((prevState) => ({
              ...prevState,
              appointmentName: selectedAppointmentType
                ? selectedAppointmentType.name
                : "",
              appointmentColor: selectedAppointmentType
                ? selectedAppointmentType.color
                : "#000000",
              appointmentTypeStatus:selectedAppointmentType?.status || "Active"
            }));
            break;
          case "Care Giver Salary":
            const selectedPaymentType = careGiverSlice?.careGiverPaymentTypes.find(
              (row: { paymentTypeID: string }) => row.paymentTypeID === selectedRowId
            );
            setFormState((prevState) => ({
              ...prevState,
              paymentName: selectedPaymentType
                ? selectedPaymentType.paymentName
                : "",
              paymentStatus:selectedPaymentType?.state || "Active"
            }));
            break;

          default:
            break;
        }
      } else {
        // Reset formState if no row is selected
        setFormState({
          language: "",
          languageNotes: "",
          classificationName: "",
          clientTypeName: "",
          clientStatus: "",
          carePlanStatus: "",
          documentName: "",
          expDateNeeded: false,
          incidentStatus: "",
          incidentTypeTitle: "",
          appointmentName: "",
          appointmentColor: "#FFFFFF",
          clientClassificationStatus:"Active",
    clientTypeStatus:"Active",
    docExpNeeded:false,
    incidentTypeStatus:"Active",
    incidentStatusStatus:"Active",
    appointmentTypeStatus:"Active",
    paymentName:"",
    paymentStatus:"Active",
        });
      }
    } else {
      setSelectedRowData(null);
    }
  };
  return (
    <Drawer
      title={
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title} Settings
        </Typography>
      }
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      maskClosable={false}
      width={700}
    >
        {/* Render inputs based on the settingType */}
        {settingType === "Languages" && (
          <Stack spacing={2}>
            <TextField
              label="Language"
              name="language"
              value={formState.language}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Language Notes"
              name="languageNotes"
              value={formState.languageNotes}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Language
            </Button>
            </Stack>
           
          </Stack>
        )}

        {settingType === "Client Classification" && (
          <Stack spacing={2}>
            <TextField
              label="Classification Name"
              name="classificationName"
              value={formState.classificationName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Select
              label="State"
              name="clientClassificationStatus"
              value={formState.clientClassificationStatus}
              onChange={handleSelectChange}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>

            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Classification
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Client Type" && (
          <Stack spacing={2}>
            <TextField
              label="Client Type Name"
              name="clientTypeName"
              value={formState.clientTypeName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Select
              label="State"
              name="clientTypeStatus"
              value={formState.clientTypeStatus}
              onChange={handleSelectChange}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Client Type
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Client Status" && (
          <Stack spacing={2}>
            <TextField
              label="Status"
              name="clientStatus"
              value={formState.clientStatus}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Client Status
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Care Plan Status" && (
          <Stack spacing={2}>
            <TextField
              label="Status"
              name="carePlanStatus"
              value={formState.carePlanStatus}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
           <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Care Plan Status
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Care Giver File Uploads" && (
          <Stack spacing={2}>
            <TextField
              label="Document Name"
              name="documentName"
              value={formState.documentName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  name="expDateNeeded"
                  checked={formState.expDateNeeded}
                  onChange={handleInputChange}
                />
              }
              label="Expiration Date Needed"
            />
            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Document Type
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Incident Status" && (
          <Stack spacing={2}>
            <TextField
              label="Status"
              name="incidentStatus"
              value={formState.incidentStatus}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Select
              label="Status"
              name="incidentStatusStatus"
              value={formState.incidentStatusStatus}
              onChange={handleSelectChange}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Incident Status
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Incident Types" && (
          <Stack spacing={2}>
            <TextField
              label="Title"
              name="incidentTypeTitle"
              value={formState.incidentTypeTitle}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Select
              label="Status"
              name="incidentTypeStatus"
              value={formState.incidentTypeStatus}
              onChange={handleSelectChange}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Incident Type
            </Button>
            </Stack>
          </Stack>
        )}

        {settingType === "Appointment Types" && (
          <Stack spacing={2}>
            <TextField
              label="Name"
              name="appointmentName"
              value={formState.appointmentName}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
            />
            <Select
              label="Status"
              name="appointmentTypeStatus"
              value={formState.appointmentTypeStatus}
              onChange={handleSelectChange}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            <InputLabel>Color</InputLabel>
            <SketchPicker
              color={formState.appointmentColor}
              onChangeComplete={handleColorChange}
            />
             <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Appointment Type
            </Button>
            </Stack>
          </Stack>
        )}
        {
          settingType === "Care Giver Salary" && (
            <Stack spacing={2}>
              <TextField
                label="Payment Name"
                name="paymentName"
                value={formState.paymentName}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
              />
              <Select
                label="Status"
                name="paymentStatus"
                value={formState.paymentStatus}
                onChange={handleSelectChange}
                variant="outlined"
                fullWidth
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
              <Stack width={"100%"} direction="column" spacing={2} justifyItems={"flex-end"} alignItems={"flex-end"} mb={2}>
            <Button sx={{marginBottom:2}} variant="contained" color="primary" onClick={handleAdd}>
              {selectedRowData != null ? "Update" : "Add"} Payment Type
            </Button>
            </Stack>
            </Stack>
          )
        }

        <Stack width={"100%"} my={1}>
          {
            settingType !== "Incident Questions" && ( 
<DataGrid
            rows={
              settingType === "Languages"
                ? selectorSlice.languages?.map((language) => ({
                    id: language.languageID,
                    ...language,
                  }))
                : settingType === "Client Classification"
                ? selectorSlice.classifications?.map((classification) => ({
                    id: classification.classificationID,
                    ...classification,
                  }))
                : settingType === "Client Type"
                ? selectorSlice.clientTypes?.map((clientType) => ({
                    id: clientType.clientTypeID,
                    ...clientType,
                  }))
                : settingType === "Client Status"
                ? selectorSlice.clientStatus?.map((clientStatus) => ({
                    id: clientStatus.clientStatusID,
                    ...clientStatus,
                  }))
                : settingType === "Care Plan Status"
                ? carePlanSlice.carePlanStatusList?.map((carePlanStatus) => ({
                    id: carePlanStatus.careplanStatusID,
                    ...carePlanStatus,
                  }))
                : settingType === "Care Giver File Uploads"
                ? careGiverSlice.careGiverDocumentTypes?.map(
                    (documentType) => ({
                      id: documentType.documentTypeID,
                      ...documentType,
                    })
                  )
                : settingType === "Incident Status"
                ? incidentSlice.incidentStatus?.map((incidentStatus) => ({
                    id: incidentStatus.incidentStatusID,
                    ...incidentStatus,
                  }))
                : settingType === "Incident Types"
                ? incidentSlice.incidentsTypes?.map((incidentType) => ({
                    id: incidentType.incidentTypeID,
                    ...incidentType,
                  }))
                : settingType === "Appointment Types"
                ? appointmentSlice.appointmentTypes?.map((appointmentType) => ({
                    id: appointmentType.appointmentTypeID,
                    ...appointmentType,
                  }))
                : settingType === "Care Giver Salary"?
                careGiverSlice?.careGiverPaymentTypes?.map((paymentType) => ({
                  id: paymentType.paymentTypeID,
                  ...paymentType,
                }))
                : []
            }
            columns={columns}
            checkboxSelection
            disableMultipleRowSelection
            onRowSelectionModelChange={(selection) =>
              handleRowSelection(selection)
            }
          />
            )
          }
          {
            settingType === "Incident Questions" && (
              <QuestionManager/>
            )
          }
          
        </Stack>
      </Drawer>
  );
};
export default SettingsDrawer;
