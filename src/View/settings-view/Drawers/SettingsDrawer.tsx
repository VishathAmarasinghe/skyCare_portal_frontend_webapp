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
} from "./DataGridColumns";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { SketchPicker } from "react-color";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { Language, SaveLanguage } from "@slices/selectorSlice/selector";

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

  const handleAdd = () => {
    console.log("Adding data for", settingType, formState);
    if (settingType === "Languages") {
        if (formState.language === "" || formState.languageNotes === "") {
            return;
            
        }
        const languagePayload:Language ={
            languageID:"",
            language:formState.language,
            languageNotes:formState.languageNotes
        } 
        dispatch(SaveLanguage(languagePayload));
        

    }
    // Add your logic here to save the new setting
  };


  const handleRowSelection = (selection: GridRowSelectionModel) => {
    console.log("Selected row:", selection);
    setSelectedRowData(selection[0] as string);
    const selectedRowId = selection[0];
    if (selection.length > 0) {
       // Get the ID of the selected row
  
      if (selectedRowId) {
        switch (settingType) {
            case "Languages":
              const selectedLanguage = selectorSlice?.languages.find(
                (row) => row.languageID === selectedRowId
              );
              setFormState((prevState) => ({
                ...prevState,
                language: selectedLanguage ? selectedLanguage.language : "",
                languageNotes: selectedLanguage ? selectedLanguage.languageNotes : "",
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
              }));
              break;
    
            case "Client Type":
              const selectedClientType = selectorSlice?.clientTypes.find(
                (row) => row.clientTypeID === selectedRowId
              );
              setFormState((prevState) => ({
                ...prevState,
                clientTypeName: selectedClientType ? selectedClientType.name : "",
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
              const selectedCarePlanStatus = carePlanSlice?.carePlanStatusList.find(
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
              const selectedDocument = careGiverSlice?.careGiverDocumentTypes.find(
                (row) => row.documentTypeID === selectedRowId
              );
              setFormState((prevState) => ({
                ...prevState,
                documentName: selectedDocument ? selectedDocument.documentName : "",
                expDateNeeded: selectedDocument ? selectedDocument.expDateNeeded : false,
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
              }));
              break;
    
            case "Appointment Types":
              const selectedAppointmentType = appointmentSlice?.appointmentTypes.find(
                (row) => row.appointmentTypeID === selectedRowId
              );
              setFormState((prevState) => ({
                ...prevState,
                appointmentName: selectedAppointmentType
                  ? selectedAppointmentType.name
                  : "",
                appointmentColor: selectedAppointmentType
                  ? selectedAppointmentType.color
                  : "#FFFFFF",
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
      });
    }
  }
}
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
      <Box sx={{ padding: 2 }}>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Language
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
                {selectedRowData!=null?"Update":"Add"} Classification
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Client Type
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Client Status
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Care Plan Status
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Document Type
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Incident Status
            </Button>
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
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Incident Type
            </Button>
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
            <InputLabel>Color</InputLabel>
            <SketchPicker
              color={formState.appointmentColor}
              onChangeComplete={handleColorChange}
            />
            <Button variant="contained" color="primary" onClick={handleAdd}>
            {selectedRowData!=null?"Update":"Add"} Appointment Type
            </Button>
          </Stack>
        )}

        <Stack width={"100%"}>
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
                : []
            }
            columns={columns}
            checkboxSelection
            disableMultipleRowSelection
            onRowSelectionModelChange={(selection)=>handleRowSelection(selection)}
          />
        </Stack>
      </Box>
    </Drawer>
  );
};
export default SettingsDrawer;
