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
  Typography,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "@slices/store";
import { CarePlan } from "@slices/carePlanSlice/carePlan";
import { State } from "../../../types/types";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton/>
      <GridToolbarFilterButton/>
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

const initialColumns: GridColDef[] = [
  { field: "careplanID", headerName: "Care Plan ID", width: 100, align: "left" },
  { field: "startDate", headerName: "Start Date" },
  { field: "endDate", headerName: "End Date" },

  {
    field: "title",
    headerName: "Title",
    flex: 1,
    headerAlign: "center",
    align: "left",
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "action",
    headerName: "Action",
    width: 150,
    align: "center",
    renderCell: (params) => {
      const navigate = useNavigate();
      return (
        <Stack flexDirection="row">
          <IconButton>
            <EditIcon />
          </IconButton>

          <IconButton>
            <DeleteIcon />
          </IconButton>

          <IconButton
            aria-label="view"
            onClick={() => {
              navigate(`/Clients/clientInfo?clientID=${params.row.clientID}`);
            }}
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
        </Stack>
      );
    },
  },
];
 

interface ClientTableProps {}

const CarePlanTable = ({}: ClientTableProps) => {
  const carePlanDetails  = useAppSelector((state)=>state.carePlans);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const theme = useTheme();

  useEffect(()=>{
    setCarePlans(carePlanDetails.carePlans);
  },[carePlanDetails.state])


  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={carePlans}
        columns={initialColumns}
        getRowId={(row) => row.careplanID}
        density="compact"
        loading={carePlanDetails.state === State.loading}
        pagination
        paginationMode="client"
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
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

export default CarePlanTable
