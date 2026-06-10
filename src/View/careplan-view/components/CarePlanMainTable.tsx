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
  Tooltip,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  CarePlan,
  fetchSingleCarePlan,
} from "../../../slices/carePlanSlice/carePlan";
import { State } from "../../../types/types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Employee } from "../../../slices/employeeSlice/employee";
import { Client } from "../../../slices/clientSlice/client";
import { AppConfig } from "../../../config/config";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}

interface ClientTableProps {
  isCarePlanModalVisible: boolean;
  setIsCarePlanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const CarePlanMainTable = ({
  isCarePlanModalVisible,
  setIsCarePlanModalVisible,
}: ClientTableProps) => {
  const carePlanDetails = useAppSelector((state) => state.carePlans);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const employees = useAppSelector(
    (state) => state?.employees?.metaAllEmployees
  );
  const clients = useAppSelector((state) => state?.clients?.clients);
  const [employeeArray, setEmployeeArray] = useState<Employee[]>([]);
  const [clientArray, setClientArray] = useState<Client[]>([]);

  const downloadPdf = async (careplanID: string) => {
    const response = await fetch(
      `${AppConfig.serviceUrls.carePlans}/${careplanID}/ndis-support-plan.pdf`,
      { method: "GET" }
    );
    if (!response.ok) {
      throw new Error("Failed to download PDF");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NDIS-Support-Plan-${careplanID}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setClientArray(clients);
  }, [clients]);

  useEffect(() => {
    setCarePlans(carePlanDetails.carePlans);
  }, [carePlanDetails.state,carePlanDetails?.fetchState]);

  const findCorrespondingClientDetails = (clientID: string): Client | null => {
    const employee = clientArray.find(
      (client) => client?.clientID === clientID
    );
    return employee ? employee : null;
  };

  const initialColumns: GridColDef[] = [
    // {
    //   field: "careplanID",
    //   headerName: "Care Plan ID",
    //   width: 100,
    //   align: "left",
    // },
    {
      field: "clientIDd",
      headerName: "Client",
      flex: 2,
      renderCell: (params) => {
        const client = findCorrespondingClientDetails(params.row.clientID);
        return (
          <Chip
            avatar={
              <Avatar alt={params.row.clientID}>
                {params.row?.email?.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={`${client?.firstName} ${client?.lastName}`}
            variant="outlined"
          />
        );
      },
    },
    { field: "startDate", headerName: "Start Date" },
    { field: "endDate", headerName: "End Date" },

    {
      field: "title",
      headerName: "Title",
      flex: 2,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "carePlanStatusID",
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
        return (
          <Stack flexDirection="row">
            <Tooltip title="View Care Plan">
              <IconButton
                aria-label="view"
                onClick={() => {
                  setIsCarePlanModalVisible(true);
                  dispatch(fetchSingleCarePlan(params.row.careplanID));
                }}
              >
                <RemoveRedEyeOutlinedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download Plan PDF">
              <IconButton
                aria-label="download-pdf"
                onClick={async () => {
                  await downloadPdf(params.row.careplanID);
                }}
              >
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

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
        pageSizeOptions={[10, 20, 30]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          height: "100%",
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

export default CarePlanMainTable;
