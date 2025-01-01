import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Box,
  Stack,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import {
  ClientClassification,
  ClientType,
  Language,
  saveClassification,
  saveClientStatus,
  saveClientType,
  SaveLanguage,
} from "../../../slices/selectorSlice/selector";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { enqueueSnackbar } from "notistack";
import { State } from "../../../types/types";
import { LoadingButton } from "@mui/lab";
import {
  enqueueSnackbarMessage,
  ShowSnackBarMessage,
} from "../../../slices/commonSlice/common";

// Define the types for the props
interface SupportAddingsProps {
  supportTypeCreater: {
    supportType: "language" | "classification" | "clientType" | "clientStatus";
    isOpen: boolean;
  };
  setSupportTypeCreater: React.Dispatch<
    React.SetStateAction<{
      supportType:
        | "language"
        | "classification"
        | "clientType"
        | "clientStatus";
      isOpen: boolean;
    }>
  >;
}

const SupportAddings: React.FC<SupportAddingsProps> = ({
  supportTypeCreater,
  setSupportTypeCreater,
}) => {
  const dispatch = useAppDispatch();
  const supporter = useAppSelector((state) => state.selector);
  const [formData, setFormData] = useState<any>({
    name: "",
    languageNotes: "",
    classificationName: "",
    clientType: "",
    state: "Inactive", // Default state
  });

  useEffect(() => {

    if (supporter.submitState === State.success) {
      setSupportTypeCreater({ ...supportTypeCreater, isOpen: false });
    }
  }, [supporter.submitState]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle toggle button change
  const handleStateChange = (
    event: React.MouseEvent<HTMLElement>,
    newState: string
  ) => {
    if (newState !== null) {
      setFormData({ ...formData, state: newState });
    }
  };

  // Handle form submission (API call)
  const handleCreate = () => {
    if (supportTypeCreater.supportType === "classification") {
      const payload: ClientClassification = {
        classificationID: "0",
        classificationName: formData.classificationName,
        state: formData.state,
      };
      if (payload.classificationName.trim() != "") {
        dispatch(saveClassification(payload));
      } else {
        enqueueSnackbar({
          message: "Funding Name is required",
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
      }
    } else if (supportTypeCreater.supportType === "clientType") {
      const payload: ClientType = {
        clientTypeID: "0",
        name: formData.clientType,
        status: formData.state,
      };
      if (payload.name.trim() != "") {
        dispatch(saveClientType(payload));
      } else {
        enqueueSnackbar({
          message: "Client Type is required",
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
      }
    } else if (supportTypeCreater.supportType === "language") {
      const payload: Language = {
        languageID: "0",
        language: formData.name,
        languageNotes: formData.languageNotes,
      };
      if (payload.language.trim() != "") {
        dispatch(SaveLanguage(payload));
      } else {
        enqueueSnackbar({
          message: "Language is required",
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
      }
    } else if (supportTypeCreater.supportType === "clientStatus") {
      const payload = {
        status: formData.name,
      };
      if (payload.status.trim() != "") {
        dispatch(saveClientStatus(payload));
      } else {
        enqueueSnackbar({
          message: "Client Status is required",
          variant: "error",
          anchorOrigin: { vertical: "bottom", horizontal: "right" },
        });
      }
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    setFormData({
      name: "",
      languageNotes: "",
      classificationName: "",
      clientType: "",
      state: "Inactive",
    });
    setSupportTypeCreater({ ...supportTypeCreater, isOpen: false }); // Close the form
  };

  // Reset form data if modal is closed
  useEffect(() => {
    if (!supportTypeCreater.isOpen) {
      setFormData({
        name: "",
        languageNotes: "",
        classificationName: "",
        clientType: "",
        state: "Inactive",
      });
    }
  }, [supportTypeCreater.isOpen]);

  return (
    <Stack
      display={supportTypeCreater.isOpen ? "flex" : "none"}
      p={2}
      flexDirection="column"
      justifyContent={"center"}
      justifyItems={"center"}
      sx={{ border: "1px solid #ccc", borderRadius: 1, mt: 2 }}
    >
      <Typography align="left" variant="h6" fontWeight={600} color="primary">
        Add New {supportTypeCreater.supportType==="classification"? "Funding": supportTypeCreater.supportType}
      </Typography>
      <Stack flexDirection={"row"} alignItems="center">
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          {supportTypeCreater.supportType === "language" && (
            <>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Language"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Language Notes"
                  name="languageNotes"
                  value={formData.languageNotes}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </>
          )}

          {supportTypeCreater.supportType === "classification" && (
            <>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Funding Name"
                  name="classificationName"
                  value={formData.classificationName}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <ToggleButtonGroup
                  value={formData.state}
                  exclusive
                  onChange={handleStateChange}
                  aria-label="classification state"
                >
                  <ToggleButton value="Active" aria-label="active">
                    Active
                  </ToggleButton>
                  <ToggleButton value="Inactive" aria-label="inactive">
                    Inactive
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </>
          )}

          {supportTypeCreater.supportType === "clientType" && (
            <>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Client Type"
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <ToggleButtonGroup
                  value={formData.state}
                  exclusive
                  onChange={handleStateChange}
                  aria-label="client state"
                >
                  <ToggleButton value="Active" aria-label="active">
                    Active
                  </ToggleButton>
                  <ToggleButton value="Inactive" aria-label="inactive">
                    Inactive
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </>
          )}

          {supportTypeCreater.supportType === "clientStatus" && (
            <Grid item xs={12} sm={5}>
              <TextField
                label="Client Status"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          )}
        </Grid>

        <Stack flexDirection="row">
          <LoadingButton
            variant="contained"
            color="primary"
            loading={supporter.submitState === State.loading}
            onClick={handleCreate}
            sx={{ marginRight: 2 }}
          >
            Create
          </LoadingButton>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SupportAddings;
