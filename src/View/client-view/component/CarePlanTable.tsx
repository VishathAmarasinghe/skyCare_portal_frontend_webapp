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
  deactivateCarePlan,
  fetchSingleCarePlan,
} from "../../../slices/carePlanSlice/carePlan";
import { ConfirmationType, State } from "../../../types/types";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useConfirmationModalContext } from "@context/DialogContext";
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

const CarePlanTable = ({
  isCarePlanModalVisible,
  setIsCarePlanModalVisible,
}: ClientTableProps) => {
  const carePlanDetails = useAppSelector((state) => state.carePlans);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();
  const navigate = useNavigate();

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
    setCarePlans(carePlanDetails.carePlans);
  }, [
    carePlanDetails.state,
    carePlanDetails?.submitState,
    carePlanDetails?.updateState,
    carePlanDetails?.fetchState
  ]);

  const initialColumns: GridColDef[] = [
    {
      field: "careplanID",
      headerName: "Care Plan ID",
      width: 100,
      align: "left",
    },
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
      field: "carePlanStatusID",
      headerName: "Status",
      width: 170,
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
            <IconButton
              onClick={() => {
                showConfirmation(
                  "Delete CarePlan",
                  "Are you sure you want to delete this Care Plan? This action cannot be undone.",
                  "accept" as ConfirmationType,
                  () => dispatch(deactivateCarePlan(params?.row?.careplanID)),
                  "Delete Now",
                  "Cancel"
                );
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
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
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
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

export default CarePlanTable;
