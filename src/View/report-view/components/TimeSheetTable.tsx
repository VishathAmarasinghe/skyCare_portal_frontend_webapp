import React, { useState, useEffect, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { Box, IconButton, Stack, Button, useTheme, Chip, Select, MenuItem, Tooltip, Menu } from "@mui/material";
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
    // {
    //   field: "shiftNoteID",
    //   headerName: "Shift Note ID",
    //   width: 150,
    // },
    {
      field: "shiftTitle",
      headerName: "Shift Type",
      width: 150,
      renderCell: (params) => {
        const title = params.value || "N/A";
        return (
          <Tooltip title={title} placement="top">
            <Box
              sx={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      width: 200,
    },
    {
      field: "createdAt",
      headerName: "Submitted At",
      width: 200,
      renderCell: (params) => {
        const date = new Date(params.value);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 180,
      renderCell: (params) => {
        const startDate = params.value;
        const submittedDate = params.row.createdAt;
        
        // Check if submission is late (submitted date is in range but start date is not)
        const isLateSubmission = () => {
          if (!startDate || !submittedDate) return false;
          
          const start = new Date(startDate);
          const submitted = new Date(submittedDate);
          
          // This is a simplified check - you might need to adjust based on your date range logic
          // For now, checking if submitted date is after start date by more than 1 day
          const diffInDays = Math.floor((submitted.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffInDays > 1;
        };
        
        return (
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box>{startDate}</Box>
            {/* {isLateSubmission() && (
              <Chip
                label="Late"
                size="small"
                color="warning"
                variant="filled"
              />
            )} */}
          </Stack>
        );
      },
    },
    {
      field: "dayOfWeek",
      headerName: "Day",
      width: 80,
      renderCell: (params) => {
        const startDate = params.value;
        if (!startDate) return "N/A";
        
        const date = new Date(startDate);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
      },
    },
    {
      field: "startTime",
      headerName: "Start Time",
      width: 80,
    },
    // {
    //   field: "endDate",
    //   headerName: "End Date",
    //   width: 180,
    // },
    {
      field: "endTime",
      headerName: "End Time",
      width: 80,
    },
    {
      field: "totalWorkHrs",
      headerName: "Total Work Hrs (Manual)",
      align: "left",
      width:200,
      renderCell: (params) => {
        const totalWorkHrs = params.value || 0; // Handle undefined/null values
        const hours = Math.floor(totalWorkHrs); // Extract hours
        const minutes = Math.round((totalWorkHrs % 1) * 60); // Extract minutes
        return `${hours} hrs ${minutes} mins`; // Format as "HH hrs MM mins"
      },
    },
    
    {
      field: "clientName",
      headerName: "Client Name",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 170,
      renderCell: (params) => {
        const [status, setStatus] = useState(params.value);
        const dropdownRef = useRef<HTMLDivElement>(null);
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const dispatch = useAppDispatch();
    
        // useEffect to update the status
        useEffect(() => {
          setStatus(params.value);
        }, [params.value]);
    
        const handleChange = (event: string) => {
          let newStatus = event
          if (newStatus === "Approve") newStatus = "Approved";
          if (newStatus === "Reject") newStatus = "Rejected";
    
          setStatus(newStatus);
    
          dispatch(updateShiftNotesPaymentStatus({
            id: params?.row?.shiftNoteID,
            paymentState: newStatus,
            comment: params?.row?.comments
          }));
        };
    
        let options: string[] = [];
        if (status === "Pending") {
          options = ["Pending", "Approve", "Reject", "Paid"];
        } else if (status === "Approved") {
          options = ["Approved", "Reject", "Paid"];
        } else if (status === "Rejected") {
          options = ["Rejected", "Paid"];
        } else if (status === "Paid") {
          options = ["Paid"];
        }
    
        const findColor = (status: string) => {
          if (status === "Approved") {
            return "primary";
          } else if (status === "Rejected") {
            return "error";
          } else if (status === "Paid") {
            return "success";
          } else {
            return "warning";
          }
        };

        const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
          setAnchorEl(event.currentTarget);
        };
    
        const handleMenuClose = () => {
          setAnchorEl(null);
        };
    
    
        if (status === "Paid") {
          return (
            <Tooltip title="Paid" placement="top">
              <Chip label={status} size="small" sx={{ml:1}} color={findColor(status)} />
            </Tooltip>
          );
        } else {
          return ( 
            <div>
            {/* Chip with Edit Icon */}
            <Stack flexDirection="row" width="100%" justifyContent="space-between" alignItems={"center"}>
            <Chip
              label={status}
              size="small"
              color={findColor(status)}
              onClick={handleMenuOpen}
              sx={{ cursor: 'pointer',mx:1 }}
            />
            <IconButton onClick={handleMenuOpen} size="small">
              <EditIcon />
            </IconButton>
            </Stack>
           
    
            {/* Menu for options */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option} onClick={()=>handleChange(option)} disabled={option === status}>
                  <Chip
                    label={option}
                    size="small"
                    color={findColor(option === "Approve" ? "Approved" : option === "Reject" ? "Rejected" : option)}
                  />
                </MenuItem>
              ))}
            </Menu>
          </div>
          );
        }
      }
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
      dayOfWeek: shiftNote?.shiftNoteDTO?.shiftStartDate || "",
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
      totalWorkHrs:shiftNote?.shiftNoteDTO?.totalWorkHrs || 0,
      status:shiftNote?.shiftNoteDTO?.paymentState || "N/A",
      createdAt: shiftNote?.shiftNoteDTO?.createdAt || "N/A",
    }));
    console.log("mappedRows",mappedRows);
    
    setRows(mappedRows || []);
  }, [shiftNoteSlice?.timeSheets,shiftNoteSlice?.submitState, shiftNoteSlice?.updateState]);

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
    // Process rows to include additional columns for Excel export
    const processedRows = rows.map((row) => {
      // Calculate day of week
      const getDayOfWeek = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
      };

      // Check if submission is late
      const isLateSubmission = () => {
        if (!row.startDate || !row.createdAt) return "No";
        
        const start = new Date(row.startDate);
        const submitted = new Date(row.createdAt);
        
        // Check if submitted date is after start date by more than 1 day
        const diffInDays = Math.floor((submitted.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays > 1 ? "Yes" : "No";
      };

      // Format total work hours for better readability
      const formatWorkHours = (totalWorkHrs: number) => {
        if (!totalWorkHrs) return "0 hrs 0 mins";
        const hours = Math.floor(totalWorkHrs);
        const minutes = Math.round((totalWorkHrs % 1) * 60);
        return `${hours} hrs ${minutes} mins`;
      };

      return {
        ...row,
        dayOfWeek: getDayOfWeek(row.startDate),
        isLateSubmission: isLateSubmission(),
        totalWorkHrsFormatted: formatWorkHours(row.totalWorkHrs),
        // Include all API data that might not be visible in the table
        employeeEmail: row.employeeEmail || "N/A",
        appointmentTitle: row.appointmentTitle || "N/A",
        recurrentAppointmentID: row.recurrentAppointmentID || "N/A",
        endDate: row.endDate || "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(processedRows);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 15 }, // shiftNoteID
      { wch: 20 }, // shiftTitle
      { wch: 25 }, // employeeName
      { wch: 20 }, // createdAt
      { wch: 15 }, // startDate
      { wch: 12 }, // dayOfWeek
      { wch: 12 }, // startTime
      { wch: 12 }, // endTime
      { wch: 25 }, // totalWorkHrsFormatted
      { wch: 20 }, // clientName
      { wch: 15 }, // status
      { wch: 30 }, // shiftNotes
      { wch: 30 }, // comments
      { wch: 15 }, // isLateSubmission
      { wch: 25 }, // employeeEmail
      { wch: 20 }, // appointmentTitle
      { wch: 20 }, // recurrentAppointmentID
      { wch: 15 }, // endDate
    ];
    worksheet['!cols'] = columnWidths;

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

export default TimeSheetTable;
