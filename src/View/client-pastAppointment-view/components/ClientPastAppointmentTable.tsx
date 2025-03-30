import React, { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { Box, IconButton, Stack, Button, useTheme, Chip, Select, MenuItem, Tooltip } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import EditIcon from "@mui/icons-material/Edit";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import * as XLSX from "xlsx";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { getSingleShiftNoteByShiftID, updateShiftNotesPaymentStatus } from "@slices/shiftNoteSlice/shiftNote";

function CustomToolbar({ onExportPDF, onExportExcel }: any) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
      <Chip
        size="small"
        variant="outlined"
        color="secondary"
        onClick={onExportExcel}
        sx={{ ml: 1 }}
        label="Export EXCEL"
      ></Chip>
    </GridToolbarContainer>
  );
}


const ClientPastAppointmentTable = ({
}) => {
  const [columns] = useState<GridColDef[]>([
    {
      field: "recurrentAppointmentID",
      headerName: "ID",
      width: 80,
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      flex: 1,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 180,
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 180,
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 180,
    },
    {
      field: "endTime",
      headerName: "End Time",
      width: 180,
    },
  ]);
  const [rows, setRows] = useState<any[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const appointmentSlice = useAppSelector((state) => state?.appointments);

  useEffect(() => {
    // Mapping and transforming the data before setting the rows state
    const mappedRows = appointmentSlice?.pastAppointmentToClient?.map((appointment) => ({
      employeeName: appointment?.careGiverNames?.map((careGiver) => careGiver).join(", ") || "N/A",
      startDate: appointment?.startDate || "",
      startTime: appointment?.startTime || "",
      endDate: appointment?.endDate || "",
      endTime: appointment?.endTime || "",
      recurrentAppointmentID:
        appointment?.recurrentAppointmentID || "N/A",
    }));
    
    setRows(mappedRows || []);
  }, [appointmentSlice?.state,appointmentSlice?.pastAppointmentToClient]);


  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) =>
          row?.shiftNoteDTO?.noteID ?? Math.random().toString(36).substr(2, 9)
        }
        density="compact"
        pagination
        pageSizeOptions={[5, 10, 15]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        slots={{
          
        }}
        sx={{
          height: "100%",
          flexGrow: 1,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.grey[200],
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-scrollArea": {
            scrollbarWidth: "thin", // For Firefox
            "&::-webkit-scrollbar": {
              width: "16px", // Adjust the width for the vertical scrollbar
              height: "12px", // Adjust the height for the horizontal scrollbar
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.primary.main, // Thumb color
              borderRadius: "10px", // Optional: to give a rounded effect to the scrollbar thumb
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.palette.grey[300], // Track color
              borderRadius: "10px", // Optional: to give a rounded effect to the scrollbar track
            },
          },
        }}        
        disableColumnMenu
      />
    </Box>
  );
};


export default ClientPastAppointmentTable
