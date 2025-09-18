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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import {
  deleteResource,
  fetchSingleResource,
  Resource,
} from "../../../slices/resourceSlice/resource";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useConfirmationModalContext } from "../../../context/DialogContext";
import { ConfirmationType } from "../../../types/types";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
  FILE_DOWNLOAD_BASE_URL,
} from "../../../config/config";
import { Employee } from "@slices/employeeSlice/employee";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const resourceSlice = useAppSelector((state) => state.resource);
  const [resources, setResources] = useState<Resource[]>([]);
  const authRole = useAppSelector((State) => State?.auth?.roles);
  const employeeSlice = useAppSelector((state) => state?.employees);
  const [employee, setEmployee] = useState<Employee[]>([]);
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();

  useEffect(() => {
    if (authRole?.includes(APPLICATION_CARE_GIVER)) {
      setResources(
        resourceSlice?.resources.filter(
          (resource) => resource.shareType === "Share With Care Givers"
        )
      );
    } else {
      setResources(resourceSlice.resources);
    }
  }, [resourceSlice?.state]);

  useEffect(() => {
    setEmployee(employeeSlice?.metaAllEmployees);
  }, [employeeSlice?.metaAllEmployees]);

  const handleDelete = (resourceId: string) => {
    dispatch(deleteResource({ resourceID: resourceId }));
  };

  const initialColumns: GridColDef[] = [
    // {
    //   field: "resourceId",
    //   headerName: "Resource ID",
    //   width: 100,
    //   align: "center",
    // },
    { field: "resourceName", headerName: "Resource Name", flex: 1 },
    {
      field: "validFrom",
      headerName: "Valid From",
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "validTo",
      headerName: "Valid To",
      width: 130,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
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
              params.value === "Internal Only" ? "#123580" : "#6b9eb3",
            color: "#fff",
          }}
        />
      ),
    },
    {
      field: "creatorId",
      headerName: "Created By",
      flex: 1,
      renderCell: (params) => {
        const employeeInfo = employee?.find(
          (emp) => emp?.employeeID === params?.value
        );

        return (
          <Chip
            size="small"
            avatar={
              <Avatar
                src={
                  employeeInfo?.profile_photo
                    ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                        employeeInfo?.profile_photo
                      )}`
                    : ""
                }
              >
                {employeeInfo
                  ? employeeInfo.firstName.charAt(0).toUpperCase()
                  : ""}
              </Avatar>
            }
            label={
              employeeInfo
                ? `${employeeInfo.firstName} ${employeeInfo.lastName}`
                : params?.value
            }
            variant="outlined"
          />
        );
      },
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
                dispatch(
                  fetchSingleResource({ resourceID: params.row.resourceId })
                );
              }}
            >
              <RemoveRedEyeOutlinedIcon />
            </IconButton>
            {(authRole?.includes(APPLICATION_ADMIN) ||
              (authRole?.includes(APPLICATION_SUPER_ADMIN)) ? (
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
              ):<></>)}
          </Stack>
        );
      },
    },
  ];

  const initialColumnsMobile: GridColDef[] = [
    { field: "resourceName", headerName: "Name", flex: 1 },
    {
      field: "action",
      headerName: "",
      width: 80,
      renderCell: (params) => {
        return (
          <Stack width={"100%"} flexDirection={"row"}>
            <IconButton
              aria-label="view"
              onClick={() => {
                dispatch(
                  fetchSingleResource({ resourceID: params.row.resourceId })
                );
              }}
            >
              <RemoveRedEyeOutlinedIcon />
            </IconButton>
            {/* {!isMobile && (
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
            )} */}
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
        columns={isMobile ? initialColumnsMobile : initialColumns}
        getRowId={(row) => row.resourceId}
        density="compact"
        // loading={clientInfo.State === State.loading}
        pagination
        paginationMode="client"
        pageSizeOptions={[10, 15,25]}
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

export default ResourceTable;
