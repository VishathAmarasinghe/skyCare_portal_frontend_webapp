import React, { useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  fetchOrganizationSetting,
  updateOrganizationSetting,
  uploadOrganizationLogo,
} from "../../../slices/organizationSlice/organization";

const OrganizationDetailsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { organization } = useAppSelector((state) => state.organization);
  const [form, setForm] = useState({
    name: "",
    abn: "",
    address: "",
    phone: "",
    email: "",
    directorName: "",
  });

  useEffect(() => {
    dispatch(fetchOrganizationSetting());
  }, [dispatch]);

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name || "",
        abn: organization.abn || "",
        address: organization.address || "",
        phone: organization.phone || "",
        email: organization.email || "",
        directorName: organization.directorName || "",
      });
    }
  }, [organization]);

  const handleSave = () => {
    dispatch(updateOrganizationSetting(form));
  };

  const handleLogoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) dispatch(uploadOrganizationLogo(file));
    };
    input.click();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Organization Details
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Used for {"{{org.*}}"} placeholders in agreement templates.
      </Typography>
      <TextField
        label="Organization Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <TextField
        label="ABN"
        value={form.abn}
        onChange={(e) => setForm({ ...form, abn: e.target.value })}
      />
      <TextField
        label="Address"
        multiline
        minRows={2}
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <TextField
        label="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <TextField
        label="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <TextField
        label="Director Name"
        value={form.directorName}
        onChange={(e) => setForm({ ...form, directorName: e.target.value })}
      />
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="outlined" onClick={handleLogoUpload}>
          Upload Logo
        </Button>
        {organization?.logoUrl && (
          <Box
            component="img"
            src={organization.logoUrl}
            alt="Organization logo"
            sx={{ maxHeight: 60, maxWidth: 180 }}
          />
        )}
      </Stack>
      <Button variant="contained" onClick={handleSave}>
        Save Organization Details
      </Button>
    </Stack>
  );
};

export default OrganizationDetailsPanel;
