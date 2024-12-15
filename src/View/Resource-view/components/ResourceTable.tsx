import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { deleteResource, fetchSingleResource, Resource } from "@slices/ResourceSlice/resource";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useConfirmationModalContext } from "@context/DialogContext";
import { ConfirmationType } from "../../../types/types";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

interface ResourceTableProps {}

const ResourceTable = ({}: ResourceTableProps) => {
  const theme = useTheme();
  const resourceSlice = useAppSelector((state) => state.resource);
  const [resources, setResources] = useState<Resource[]>([]);
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();

  useEffect(()=>{
    setResources(resourceSlice.resources);
  },[resourceSlice?.state])

  const handleDelete = (resourceId: string) => {
    dispatch(deleteResource({resourceID:resourceId}));
  };

  const initialColumns: GridColDef[] = [
    { field: "resourceId", headerName: "Resource ID", width: 100, align: "center" },
    { field: "resourceName", headerName: "Resource Name", flex: 1 },
    { field: "validFrom", headerName: "Valid From", width: 130,renderCell:(params)=>new Date(params.value).toLocaleDateString()},
    { field: "validTo", headerName: "Valid To", width: 130,renderCell:(params)=>new Date(params.value).toLocaleDateString()},
    {
      field: "shareType",
      headerName: "Share Type",
      width: 250,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Chip
        size="small"
          label={params.value}
          style={{
            backgroundColor:
              params.value === "Internal Only" ? "#FFD700" : "#87CEEB",
            color: "#fff",
          }}
        />
      ),
    },
    {
      field: "creatorId",
      headerName: "Created By",
      flex: 1,
      renderCell: (params) => (
        <Chip
        size="small"
          avatar={<Avatar>{params.row.creatorId.charAt(0).toUpperCase()}</Avatar>}
          label={params.value}
          variant="outlined"
        />
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: (params) => {
        return (
          <Stack width={"100%"} flexDirection={"row"}>
          <IconButton
            aria-label="view"
            onClick={() => {
              dispatch(fetchSingleResource({resourceID:params.row.resourceId}));
            }}
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => {
              showConfirmation(
                "Delete Resource",
                `Are you sure you want to delete resource "${params.row.resourceName}"?`,
                ConfirmationType.update,
                () => handleDelete(params.row.resourceId),
                "Delete",
                "Cancel"
              );
            }}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
          </Stack>
        );
      },
    },
  ];

  const handlePageChange = (newPage: number) => {
    // Handle pagination if needed
  };

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={resources}
        columns={initialColumns}
        getRowId={(row) => row.resourceId}
        density="compact"
        // loading={clientInfo.State === State.loading}
        pagination
        paginationMode="client"
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
        }}
      />
    </Box>
  );
};

export default ResourceTable;
