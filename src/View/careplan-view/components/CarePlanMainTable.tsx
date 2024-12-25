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
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { CarePlan, fetchSingleCarePlan } from "../../../slices/carePlanSlice/carePlan";
import { State } from "../../../types/types";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Employee } from "@slices/EmployeeSlice/employee";
import { Client } from "@slices/clientSlice/client";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton/>
      <GridToolbarFilterButton/>
      <GridToolbarQuickFilter placeholder="Search" />
    </GridToolbarContainer>
  );
}
 

interface ClientTableProps {
  isCarePlanModalVisible: boolean; 
  setIsCarePlanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const CarePlanMainTable = ({isCarePlanModalVisible,setIsCarePlanModalVisible}: ClientTableProps) => {
  const carePlanDetails  = useAppSelector((state)=>state.carePlans);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const employees = useAppSelector((state)=>state?.employees?.metaAllEmployees);
  const clients = useAppSelector((state)=>state?.clients?.clients);
  const [employeeArray,setEmployeeArray] = useState<Employee[]>([]);
  const [clientArray,setClientArray] = useState<Client[]>([]);
  

  useEffect(()=>{
        setClientArray(clients);
  },[clients])


  useEffect(()=>{
    setCarePlans(carePlanDetails.carePlans);
  },[carePlanDetails.state])

  const findCorrespondingClientDetails = (clientID:string):Client|null=>{
    const employee = clientArray.find((client)=>client?.clientID === clientID);
    return employee?employee:null;
  }

  const initialColumns: GridColDef[] = [
    { field: "careplanID", headerName: "Care Plan ID", width: 100, align: "left" },
    { field: "clientID", headerName: "CLient ID", width: 100, align: "left" },
    {
        field:"clientIDd",
        headerName:"Client",
        flex:2,
        renderCell:(params)=>{
            const client = findCorrespondingClientDetails(params.row.clientID);
            return <Chip
            avatar={
              <Avatar
                alt={params.row.clientID}
              >
                {params.row?.email?.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={`${client?.firstName} ${client?.lastName}`}
            variant="outlined"
          />
        }
    },
    { field: "startDate", headerName: "Start Date" },
    { field: "endDate", headerName: "End Date" },
  
    {
      field: "title",
      headerName: "Title",
      flex: 2,
      headerAlign: "center",
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
        const navigate = useNavigate();
        return (
          <Stack flexDirection="row">
  
            <IconButton
              aria-label="view"
              onClick={() => {setIsCarePlanModalVisible(true); dispatch(fetchSingleCarePlan(params.row.careplanID))}}
            >
              <RemoveRedEyeOutlinedIcon />
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

export default CarePlanMainTable
