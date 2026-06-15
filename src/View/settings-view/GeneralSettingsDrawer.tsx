import React, { useEffect, useState } from "react";
import { Drawer } from "antd";
import {
  Button,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { SettingsCardTitle } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  fetchGeneralSettings,
  GeneralSettings,
  updateGeneralSettings,
} from "../../slices/appSettingsSlice/appSettings";
import { State } from "../../types/types";

interface GeneralSettingsDrawerProps {
  open: boolean;
  title: SettingsCardTitle | null;
  onClose: () => void;
}

export const isGeneralSetting = (title: SettingsCardTitle | null): boolean =>
  title === "General Settings";

const GeneralSettingsDrawer: React.FC<GeneralSettingsDrawerProps> = ({
  open,
  title,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { generalSettings, updateState } = useAppSelector((state) => state.appSettings);
  const [blockTimesheetOnDocumentNonCompliance, setBlockTimesheetOnDocumentNonCompliance] =
    useState(false);

  useEffect(() => {
    if (open && isGeneralSetting(title)) {
      dispatch(fetchGeneralSettings());
    }
  }, [open, title, dispatch]);

  useEffect(() => {
    if (generalSettings) {
      setBlockTimesheetOnDocumentNonCompliance(
        generalSettings.blockTimesheetOnDocumentNonCompliance
      );
    }
  }, [generalSettings]);

  const handleSave = () => {
    const payload: GeneralSettings = {
      blockTimesheetOnDocumentNonCompliance,
    };
    dispatch(updateGeneralSettings(payload));
  };

  return (
    <Drawer
      title={
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          General Settings
        </Typography>
      }
      placement="right"
      closable
      onClose={onClose}
      open={open && isGeneralSetting(title)}
      maskClosable={false}
      width={520}
    >
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          Control portal-wide behavior for caregivers and staff.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={blockTimesheetOnDocumentNonCompliance}
              onChange={(event) =>
                setBlockTimesheetOnDocumentNonCompliance(event.target.checked)
              }
            />
          }
          label="Block timesheet submission when required documents are missing or expired"
        />

        <Typography variant="body2" color="text.secondary">
          When enabled, caregivers cannot submit timesheets until all required
          compliance documents are uploaded and not expired. The mobile app will
          show the backend error message without requiring an app update.
        </Typography>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={updateState === State.loading}
          >
            {updateState === State.loading ? "Saving..." : "Save settings"}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default GeneralSettingsDrawer;
