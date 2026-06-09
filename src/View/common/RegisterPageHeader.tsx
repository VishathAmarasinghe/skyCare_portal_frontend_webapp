import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

interface RegisterPageHeaderProps {
  title: string;
  subtitle: string;
  onAdd?: () => void;
  addLabel?: string;
  showAdd?: boolean;
}

const RegisterPageHeader: React.FC<RegisterPageHeaderProps> = ({
  title,
  subtitle,
  onAdd,
  addLabel = "Add record",
  showAdd = true,
}) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
    <Stack spacing={0.5}>
      <Typography variant="h5" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
    {showAdd && onAdd && (
      <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={onAdd}>
        {addLabel}
      </Button>
    )}
  </Stack>
);

export default RegisterPageHeader;
