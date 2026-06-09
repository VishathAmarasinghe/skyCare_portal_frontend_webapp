import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  DataGrid,
  GridColDef,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useAppDispatch } from "../../../slices/store";
import {
  ComplianceLookupItem,
  deleteLookupItem,
  resetComplianceLookupSubmitState,
  saveLookupItem,
} from "../../../slices/complianceLookupSlice/complianceLookup";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import { ConfirmationType, State } from "../../../types/types";

interface ComplianceLookupPanelProps {
  title: string;
  items: ComplianceLookupItem[];
  apiUrl: string;
  onRefresh: () => void;
  submitState: State;
}

const ComplianceLookupPanel: React.FC<ComplianceLookupPanelProps> = ({
  title,
  items,
  apiUrl,
  onRefresh,
  submitState,
}) => {
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const saving = submitState === State.loading;

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormStatus("Active");
    setSelectedId(null);
    dispatch(resetComplianceLookupSubmitState());
  };

  const loadRow = (row: ComplianceLookupItem) => {
    setSelectedId(row.lookupID);
    setFormTitle(row.title);
    setFormDescription(row.description || "");
    setFormStatus(row.status || "Active");
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    await dispatch(
      saveLookupItem({
        url: apiUrl,
        item: {
          lookupID: selectedId || "",
          title: formTitle.trim(),
          description: formDescription,
          status: formStatus,
        },
        isUpdate: !!selectedId,
      })
    );
    resetForm();
    onRefresh();
  };

  const handleDelete = (row: ComplianceLookupItem) => {
    showConfirmation(
      "Delete item",
      `Are you sure you want to delete "${row.title}"? This action cannot be undone.`,
      "accept" as ConfirmationType,
      async () => {
        await dispatch(deleteLookupItem({ url: apiUrl, lookupID: row.lookupID }));
        if (selectedId === row.lookupID) resetForm();
        onRefresh();
      },
      "Delete",
      "Cancel"
    );
  };

  const columns: GridColDef<ComplianceLookupItem>[] = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 180 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 200 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" justifyContent="center" width="100%">
          <IconButton size="small" onClick={() => loadRow(params.row)} aria-label="Edit">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row)} aria-label="Delete">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2} sx={{ height: "100%", minHeight: 0, flex: 1 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
        <TextField
          label="Title"
          size="small"
          fullWidth
          required
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />
        <TextField
          label="Description"
          size="small"
          fullWidth
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
        />
        <TextField
          label="Status"
          size="small"
          select
          sx={{ minWidth: 120 }}
          value={formStatus}
          onChange={(e) => setFormStatus(e.target.value)}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formTitle.trim()}>
            {selectedId ? "Update" : "Add"}
          </Button>
          {selectedId && (
            <Button variant="outlined" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          )}
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, width: "100%" }}>
        <DataGrid
          rows={items}
          columns={columns}
          getRowId={(row) => row.lookupID}
          density="compact"
          disableRowSelectionOnClick
          onRowClick={(params) => loadRow(params.row)}
          sx={{
            height: "100%",
            border: "none",
            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "action.selected",
            },
            "& .MuiDataGrid-row": {
              cursor: "pointer",
            },
          }}
          slots={{
            toolbar: () => (
              <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarQuickFilter />
              </GridToolbarContainer>
            ),
          }}
        />
      </Box>
    </Stack>
  );
};

export default ComplianceLookupPanel;
