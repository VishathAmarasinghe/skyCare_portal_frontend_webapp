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
import {
  getSingleShiftNoteByShiftID,
  updateShiftNotesPaymentStatus,
} from "@slices/shiftNoteSlice/shiftNote";
import { useConfirmationModalContext } from "@context/DialogContext";
import { ConfirmationType } from "../../../types/types";
import RejectModal from "./RejectModal";

function CustomToolbar({ onExportPDF, onExportExcel, showExportButton }: any) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
      {showExportButton && (
        <Chip
          size="small"
          variant="outlined"
          color="secondary"
          onClick={onExportExcel}
          sx={{ ml: 1 }}
          label="Export EXCEL"
        />
      )}
    </GridToolbarContainer>
  );
}

interface TimeSheetTableProps {
  isNoteModalVisible: boolean;
  setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showExportButton?: boolean;
}

const ClientTimeSheetTable = ({
  isNoteModalVisible,
  setIsNoteModalVisible,
  showExportButton = false,
}: TimeSheetTableProps) => {
  const [columns] = useState<GridColDef[]>([
    {
      field: "shiftNoteID",
      headerName: "Shift Note ID",
      flex: 1
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      width: 250,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 180,
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 80,
    },
    {
      field: "endTime",
      headerName: "End Time",
      width: 80,
    },
    {
      field: "totalWorkHrs",
      headerName: "Total Work Hrs",
      align: "left",
      width: 200,
      renderCell: (params) => {
        const totalWorkHrs = params.value || 0; // Handle undefined/null values
        const hours = Math.floor(totalWorkHrs); // Extract hours
        const minutes = Math.round((totalWorkHrs % 1) * 60); // Extract minutes
        return `${hours} hrs ${minutes} mins`; // Format as "HH hrs MM mins"
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 170,
      renderCell: (params) => {
        const { showConfirmation } = useConfirmationModalContext();
        const [status, setStatus] = useState(params.value);
        const [isRejectModalOpen, setRejectModalOpen] = useState(false);

        const handleStatusChange = (newStatus: string) => {
          if (newStatus === "Approve") {
            setStatus("Approved");
            showConfirmation(
              "Approve Time Sheet",
              "Are you sure you want to approve this time sheet?",
              ConfirmationType.update,
              () =>
                dispatch(
                  updateShiftNotesPaymentStatus({
                    id: params?.row?.shiftNoteID,
                    paymentState: "Approved",
                    comment:params?.row?.comments
                  })
                ),
              "Yes",
              "Cancel"
            );
          } else if (newStatus === "Reject") {
            setRejectModalOpen(true); // Open the rejection modal
          }
        };
      
        const handleRejectConfirm = (comment: string) => {
          setStatus("Rejected");
          setRejectModalOpen(false);
      
          showConfirmation(
            "Reject Time Sheet",
            "Are you sure you want to reject this time sheet?",
            ConfirmationType.update,
            () =>
              dispatch(
                updateShiftNotesPaymentStatus({
                  id: params?.row?.shiftNoteID,
                  paymentState: "Rejected",
                  comment: params?.row?.comments!="N/A"?params?.row?.comments+" "+comment:comment,
                })
              ),
            "Yes",
            "Cancel"
          );
        };

        return (
          <Stack direction="row" spacing={1} height="100%" alignItems="center">
            <RejectModal
              open={isRejectModalOpen}
              onClose={() => setRejectModalOpen(false)}
              onConfirm={handleRejectConfirm}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {status === "Paid" ? (
                <Chip label="Paid" size="small" color="success" />
              ) : status === "Pending" ? (
                <>
                  <Chip
                    label="Approve"
                    size="small"
                    color="primary"
                    clickable
                    onClick={() => handleStatusChange("Approve")}
                  />
                  <Chip
                    label="Reject"
                    size="small"
                    color="warning"
                    clickable
                    onClick={() => handleStatusChange("Reject")}
                  />
                </>
              ) : (
                <Chip
                  label={status}
                  size="small"
                  color={status === "Approved" ? "success" : "error"}
                />
              )}
            </Box>
          </Stack>
        );
      },
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
      totalWorkHrs: shiftNote?.shiftNoteDTO?.totalWorkHrs || 0,
      status: shiftNote?.shiftNoteDTO?.paymentState || "N/A",
    }))?.sort((a, b) => {
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();
      return aDate - bDate;
    });
    setRows(mappedRows || []);
  }, [
    shiftNoteSlice?.timeSheets,
    shiftNoteSlice?.submitState,
    shiftNoteSlice?.updateState,
  ]);

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
    const processedRows = rows.map((row) => ({
      appointmentType: row.shiftTitle || "N/A",
      totalhours_system: row.totalHours || 0,
      employeeName: row.employeeName || "N/A",
      createdAt: row.createdAt || "N/A",
      startDate: row.startDate || "N/A",
      dayOfWeek: (() => {
        if (!row.startDate) return "N/A";
        const date = new Date(row.startDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
      })(),
      startTime: row.startTime || "N/A",
      endTime: row.endTime || "N/A",
      clientName: row.clientName || "N/A",
      shiftNotes: row.shiftNotes || "N/A",
      comments: row.comments || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(processedRows);
    worksheet['!cols'] = [
      { wch: 20 }, // appointmentType
      { wch: 18 }, // totalhours_system
      { wch: 25 }, // employeeName
      { wch: 20 }, // createdAt
      { wch: 15 }, // startDate
      { wch: 12 }, // dayOfWeek
      { wch: 12 }, // startTime
      { wch: 12 }, // endTime
      { wch: 20 }, // clientName
      { wch: 30 }, // shiftNotes
      { wch: 30 }, // comments
    ];

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
        getRowId={(row) => row?.shiftNoteID ?? Math.random().toString(36).substr(2, 9)}
        density="compact"
        pagination
        pageSizeOptions={[5, 10, 15]}
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
              showExportButton={showExportButton}
            />
          ),
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

export default ClientTimeSheetTable;
