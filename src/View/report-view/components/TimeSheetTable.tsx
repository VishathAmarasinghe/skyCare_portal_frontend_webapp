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
import { Box, IconButton, Stack, Button, useTheme, Chip } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import * as XLSX from "xlsx";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { getSingleShiftNoteByShiftID } from "@slices/shiftNoteSlice/shiftNote";

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

interface TimeSheetTableProps {
  isNoteModalVisible: boolean;
  setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setPureNew: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimeSheetTable = ({
  isNoteModalVisible,
  setIsNoteModalVisible,
  setPureNew,
}: TimeSheetTableProps) => {
  const [columns] = useState<GridColDef[]>([
    {
      field: "shiftNoteID",
      headerName: "Shift Note ID",
      flex: 1,
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      width: 200,
    },
    {
      field: "employeeEmail",
      headerName: "Employee Email",
      width: 250,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 100,
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 80,
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 100,
    },
    {
      field: "endTime",
      headerName: "End Time",
      width: 80,
    },
    {
      field: "clientName",
      headerName: "Client Name",
      width: 250,
    },
    {
      field: "appointmentTitle",
      headerName: "Appointment Title",
      width: 250,
    },
    {
      field: "shiftTitle",
      headerName: "Shift Title",
      width: 250,
    },
    {
      field: "totalHours",
      headerName: "Total Hours",
      width: 150,
    },
    {
      field: "recurrentAppointmentID",
      headerName: "Recurrent Appointment ID",
      width: 150,
    },
    {
      field: "shiftNotes",
      headerName: "ShiftNotes",
      width: 250,
    },
    {
      field: "comments",
      headerName: "Comments",
      width: 250,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      headerAlign: "left",
      renderCell: (params) => (
        <Stack
          width={"100%"}
          flexDirection={"row"}
          justifyContent="space-between"
        >
          <IconButton
            aria-label="view"
            onClick={() => {
              dispatch(getSingleShiftNoteByShiftID(params.row.shiftNoteID));
              setIsNoteModalVisible(true);
              setPureNew(false);
            }}
          >
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]);
  const [rows, setRows] = useState<any[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const shiftNoteSlice = useAppSelector((state) => state?.shiftNotes);

  useEffect(() => {
    // Mapping and transforming the data before setting the rows state
    const mappedRows = shiftNoteSlice?.timeSheets?.map((shiftNote) => ({
      shiftNoteID: shiftNote?.shiftNoteDTO?.noteID || "",
      employeeName: `${shiftNote?.employeeDTO?.firstName || "N/A"} ${
        shiftNote?.employeeDTO?.lastName
      }`,
      employeeEmail: shiftNote?.employeeDTO?.email || "",
      startDate: shiftNote?.shiftNoteDTO?.shiftStartDate || "",
      startTime: shiftNote?.shiftNoteDTO?.shiftStartTime || "",
      endDate: shiftNote?.shiftNoteDTO?.shiftEndDate || "",
      endTime: shiftNote?.shiftNoteDTO?.shiftEndTime || "",
      clientName: `${shiftNote?.client?.firstName || "N/A"} ${
        shiftNote?.client?.lastName || "N/A"
      }`,
      appointmentTitle: shiftNote?.appointment?.title || "",
      shiftTitle: shiftNote?.shiftNoteDTO?.title || "N/A",
      totalHours: shiftNote?.totalHours || 0,
      recurrentAppointmentID:
        shiftNote?.recurrentAppointment?.recurrentAppointmentID || "N/A",
      shiftNotes: shiftNote?.shiftNoteDTO?.notes || "N/A",
      comments: shiftNote?.shiftNoteDTO?.comments || "N/A",
    }));
    setRows(mappedRows || []);
  }, [shiftNoteSlice?.timeSheets]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = columns.map((col) => col.headerName);
    const tableRows = rows.map((row) =>
      columns.map((col) => row[col.field] || "")
    );
    doc.text("TimeSheet Report", 14, 16);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("timesheet_report.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TimeSheets");
    XLSX.writeFile(workbook, "timesheet_report.xlsx");
  };

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
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
        slots={{
          toolbar: () => (
            <CustomToolbar
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
            />
          ),
        }}
        sx={{
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
              width: "20px",
              height: "10px", // For Chrome/Safari
            },
          },
        }}
        disableColumnMenu
      />
    </Box>
  );
};

export default TimeSheetTable;
