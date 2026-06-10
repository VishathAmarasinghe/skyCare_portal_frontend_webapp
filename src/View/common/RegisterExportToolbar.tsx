import React from "react";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { Chip } from "@mui/material";

interface RegisterExportToolbarProps {
  onExportCsv: () => void;
  onExportPdf: () => void;
}

const RegisterExportToolbar: React.FC<RegisterExportToolbarProps> = ({
  onExportCsv,
  onExportPdf,
}) => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarQuickFilter placeholder="Search" />
    <Chip
      size="small"
      variant="outlined"
      color="primary"
      onClick={onExportCsv}
      sx={{ ml: 1 }}
      label="Export CSV"
    />
    <Chip
      size="small"
      variant="outlined"
      color="secondary"
      onClick={onExportPdf}
      sx={{ ml: 1 }}
      label="Export PDF"
    />
  </GridToolbarContainer>
);

export default RegisterExportToolbar;
