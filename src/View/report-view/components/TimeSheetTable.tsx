import React, { useState, useEffect, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  useGridApiRef,
} from "@mui/x-data-grid";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { Box, IconButton, Stack, Button, useTheme, Chip, Select, MenuItem, Tooltip, Menu } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
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

function CustomToolbar({ onExportPDF, onExportExcel, showExportButton, onSelectAll, selectedCount, totalCount }: any) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const buttonText = isAllSelected ? "Deselect All" : "Select All";
  
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter placeholder="Search" />
      <Chip
        size="small"
        variant="outlined"
        color={isAllSelected ? "error" : "primary"}
        onClick={onSelectAll}
        sx={{ ml: 1 }}
        label={`${buttonText} (${selectedCount}/${totalCount})`}
      />
      <Chip
        size="small"
        variant="outlined"
        color="secondary"
        onClick={onExportExcel}
        sx={{ ml: 1 }}
        label="Export EXCEL"
      />
    </GridToolbarContainer>
  );
}

interface TimeSheetTableProps {
  isNoteModalVisible: boolean;
  setIsNoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setPureNew: React.Dispatch<React.SetStateAction<boolean>>;
  showExportButton?: boolean;
  onSelectionChange?: (selectedRows: string[]) => void;
  externalSelectedRows?: string[];
}

const TimeSheetTable = ({
  isNoteModalVisible,
  setIsNoteModalVisible,
  setPureNew,
  showExportButton = false,
  onSelectionChange,
  externalSelectedRows,
}: TimeSheetTableProps) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const apiRef = useGridApiRef();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic page size based on available screen height
  useEffect(() => {
    const calculatePageSize = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // Subtract toolbar (~56px), header (~56px), and pagination footer (~52px)
        const availableHeight = containerHeight - 164;
        
        // Compact density row height is approximately 36-38px
        const rowHeight = 38;
        const calculatedRows = Math.floor(availableHeight / rowHeight);
        
        // Set minimum of 5 rows and maximum of 100 rows
        const optimalPageSize = Math.max(5, Math.min(calculatedRows, 100));
        setPageSize(optimalPageSize);
      }
    };

    // Calculate on mount
    calculatePageSize();

    // Recalculate on window resize
    const handleResize = () => {
      calculatePageSize();
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      calculatePageSize();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  // Reset to first page when page size changes due to resize
  useEffect(() => {
    setPage(0);
  }, [pageSize]);

  // Sync with external selected rows
  useEffect(() => {
    if (externalSelectedRows) {
      setSelectedRows(externalSelectedRows);
    }
  }, [externalSelectedRows]);
  
  const handleSelectAll = () => {
    const allRowIds = rows.map(row => row?.shiftNoteDTO?.noteID ?? Math.random().toString(36).substr(2, 9));
    
    // If all rows are selected, deselect all. Otherwise, select all.
    if (selectedRows.length === allRowIds.length && allRowIds.every(id => selectedRows.includes(id))) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allRowIds);
    }
  };

  const [columns] = useState<GridColDef[]>([
    // {
    //   field: "shiftNoteID",
    //   headerName: "Shift Note ID",
    //   width: 150,
    // },
    {
      field: "exportStatus",
      headerName: "Exported",
      width: 100,
       renderCell: (params) => {
         const exportCount = params.row.shiftNoteDTO?.exportCount || 0;
         return exportCount > 0 ? (
           <Tooltip title={`Exported ${exportCount} time(s)`}>
             <CheckCircleIcon color="success" fontSize="small" />
           </Tooltip>
         ) : (
           <Tooltip title="Pending export">
             <HourglassBottomIcon color="primary" fontSize="small" />
           </Tooltip>
         );
       },
    },
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
          options = ["Rejected", "Approve", "Paid"];
        } else if (status === "Paid") {
          options = ["Paid", "Pending", "Approve", "Reject"];
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
      shiftNoteDTO: shiftNote?.shiftNoteDTO, // Add the full shiftNoteDTO object
    }))?.sort((a, b) => {
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();
      return aDate - bDate;
    });
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
    // Calculate day of week helper function
    const getDayOfWeek = (dateString: string) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    };

    // Process rows to include additional columns for Excel export
    const processedRows = rows.map((row) => {
      // Build the exact set of fields for export
      const exportRow: any = {
        // renamed fields
        appointmentType: row.shiftTitle || "N/A", // shiftTitle -> appointment type
        totalhours_system: row.totalHours || 0, // totalHours -> totalhours(system)
        // kept fields
        employeeName: row.employeeName || "N/A",
        createdAt: row.createdAt || "N/A",
        startDate: row.startDate || "N/A",
        dayOfWeek: getDayOfWeek(row.startDate),
        startTime: row.startTime || "N/A",
        endTime: row.endTime || "N/A",
        clientName: row.clientName || "N/A",
        shiftNotes: row.shiftNotes || "N/A",
        comments: row.comments || "N/A",
      };

      return exportRow;
    });

    // Group by employee name
    const groupedByEmployee = processedRows.reduce((acc: any, row: any) => {
      const employeeName = row.employeeName;
      if (!acc[employeeName]) {
        acc[employeeName] = [];
      }
      acc[employeeName].push(row);
      return acc;
    }, {});

    // Sort each employee's timesheets by startDate and flatten the result
    const sortedAndGroupedRows = Object.keys(groupedByEmployee)
      .sort() // Sort employee names alphabetically
      .flatMap((employeeName) => {
        // Sort timesheets by startDate within each employee group
        return groupedByEmployee[employeeName].sort((a: any, b: any) => {
          const dateA = new Date(a.startDate).getTime();
          const dateB = new Date(b.startDate).getTime();
          return dateA - dateB;
        });
      });

    const worksheet = XLSX.utils.json_to_sheet(sortedAndGroupedRows);
    
    // Set column widths for better readability
    const columnWidths = [
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
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TimeSheets");
    XLSX.writeFile(workbook, "timesheet_report.xlsx");
  };

  return (
    <Box
      ref={containerRef}
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
        pageSizeOptions={[5, 10, 15, 25, 50, 100]}
        checkboxSelection
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={(newSelection) => {
          const newSelectedRows = newSelection as string[];
          console.log("TimeSheetTable selection changed:", newSelectedRows);
          setSelectedRows(newSelectedRows);
          onSelectionChange?.(newSelectedRows);
        }}
        apiRef={apiRef}
        initialState={{
          pagination: {
            paginationModel: { pageSize: pageSize, page: 0 },
          },
        }}
        paginationModel={{
          pageSize: pageSize,
          page: page,
        }}
        onPaginationModelChange={(model) => {
          setPageSize(model.pageSize);
          setPage(model.page);
        }}
        slots={{
          toolbar: () => (
            <CustomToolbar
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              showExportButton={showExportButton}
              onSelectAll={handleSelectAll}
              selectedCount={selectedRows.length}
              totalCount={rows.length}
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
