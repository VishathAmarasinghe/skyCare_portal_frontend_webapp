import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { HttpStatusCode } from "axios";
import { string } from "yup/lib/locale";

// Define types for Employee and Address
export interface EmployeeAddress {
  longitude: string;
  latitude: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface Employee {
  employeeID: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accessRole: string;
  joinDate: string;
  profile_photo: string;
  status: string;
  employeeAddresses: EmployeeAddress[];
  employeeJobRoles: string[];
  employeePhoneNo: string[];
}

export interface EmployeeBasicInfoUpdater {
  employeeID: string;
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface EmployeeMapping {
  [employeeID: string]: string;
}

// Define a type for the slice state
interface EmployeeState {
  state: State;
  submitState: State;
  updateState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  selectedEmployee: Employee | null;
  metaAllEmployees: Employee[];
  metaAllEmployeeMapping: EmployeeMapping;
  employees: Employee[];
  logedEMployee: Employee | null;
  totalEmployeeCount: number;
  [key: string]: any; // Index signature
}

// Define the initial state
const initialState: EmployeeState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: "",
  errorMessage: "",
  metaAllEmployees: [],
  metaAllEmployeeMapping: {},
  logedEMployee: null,
  selectedEmployee: null,
  employees: [],
  totalEmployeeCount: 0,
};

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  employeeID: string;
}

// Fetch all employees
export const fetchMetaEmployees = createAsyncThunk(
  "employee/fetchMetaAllEmployees",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.employees + `/meta/allemployees`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchMetaEmployees
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

export const fetchMetaEmployeesMapping = createAsyncThunk(
  "employee/fetchAllEmployeesMapping",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.employees + `/meta/careGiverMapping`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchMetaEmployees
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Save an employee
export const updateUserPassword = createAsyncThunk(
  "employee/updateUserPassword",
  async (payload: ChangePasswordDTO, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.employees + `/update-password`,
        payload
      );

      dispatch(
        enqueueSnackbarMessage({
          message: response.data,
          type: "success",
        })
      );

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.updatePassword
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Save an employee
export const updateEmployeeBasicInfo = createAsyncThunk(
  "employee/updateEmployeeBasicInfo",
  async (
    payload: {
      employeeData: EmployeeBasicInfoUpdater;
      profilePhoto: File | null;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append(
        "employeeBasicInfo",
        JSON.stringify(payload.employeeData)
      );
      if (payload.profilePhoto) {
        formData.append("profilePic", payload.profilePhoto);
      }

      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.employees + `/update-basic-info`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        enqueueSnackbarMessage({
          message: response.data,
          type: "success",
        })
      );

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveEmployee
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Fetch all employees
export const fetchEmployeesByRole = createAsyncThunk(
  "employee/fetchEmployeesByRole",
  async (role: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.employees + `/role/` + role
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchEmployees
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Fetch all employees
export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        AppConfig.serviceUrls.employees
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchEmployees
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

export const fetchCurrnetEmployee = createAsyncThunk(
  "employee/fetchCurrentEmployee",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.employees}/${employeeID}`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchSingleEmployee
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Fetch a single employee
export const fetchSingleEmployee = createAsyncThunk(
  "employee/fetchSingleEmployee",
  async (employeeID: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await APIService.getInstance().get(
        `${AppConfig.serviceUrls.employees}/${employeeID}`
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.fetchSingleEmployee
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Save an employee
export const saveEmployee = createAsyncThunk(
  "employee/saveEmployee",
  async (
    payload: { employeeData: Employee; profilePhoto: File | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("employeeData", JSON.stringify(payload.employeeData));
      if (payload.profilePhoto) {
        formData.append("profile_photo", payload.profilePhoto);
      }

      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.employees,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.saveEmployee,
          type: "success",
        })
      );

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error);
        enqueueSnackbarMessage({
          message: "Requsest Canceled",
          type: "error",
        });
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveEmployee
              : String(error.response?.data?.message),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Save an employee
export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async (
    payload: { employeeData: Employee; profilePhoto: File | null },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("employeeData", JSON.stringify(payload.employeeData));
      if (payload.profilePhoto) {
        formData.append("profile_photo", payload.profilePhoto);
      }

      const response = await APIService.getInstance().patch(
        AppConfig.serviceUrls.employees +
          `/${payload?.employeeData?.employeeID}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      dispatch(
        enqueueSnackbarMessage({
          message: SnackMessage.success.updateEmployee,
          type: "success",
        })
      );

      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.updateEmployee
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

// Create Employee Slice
const EmployeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
    },
    resetSelectedEmployee(state) {
      state.selectedEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Employees...";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched employees!";
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch employees!";
      })
      .addCase(saveEmployee.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving Employee...";
      })
      .addCase(saveEmployee.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved employee!";
      })
      .addCase(saveEmployee.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save employee!";
      })
      .addCase(fetchSingleEmployee.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Employee...";
      })
      .addCase(fetchSingleEmployee.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched employee!";
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchSingleEmployee.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch employee!";
      })
      .addCase(fetchEmployeesByRole.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Employees...";
      })
      .addCase(fetchEmployeesByRole.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched employees!";
        state.employees = action.payload;
      })
      .addCase(fetchEmployeesByRole.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch employees!";
      })
      .addCase(updateEmployee.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating Employee...";
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated employee!";
      })
      .addCase(updateEmployee.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update employees!";
      })
      .addCase(fetchMetaEmployees.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching meta Employee...";
      })
      .addCase(fetchMetaEmployees.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Fetching all meta Employees!";
        state.metaAllEmployees = action.payload;
      })
      .addCase(fetchMetaEmployees.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch meta employees!";
      })
      .addCase(fetchMetaEmployeesMapping.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching meta Employee...";
      })
      .addCase(fetchMetaEmployeesMapping.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Fetching all meta Employees!";
        state.metaAllEmployeeMapping = action.payload;
      })
      .addCase(fetchMetaEmployeesMapping.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch meta employees!";
      })
      .addCase(fetchCurrnetEmployee.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching meta Employee...";
      })
      .addCase(fetchCurrnetEmployee.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Fetching all meta Employees!";
        state.logedEMployee = action.payload;
      })
      .addCase(fetchCurrnetEmployee.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch meta employees!";
      });
  },
});

export const { resetSubmitState, resetSelectedEmployee } =
  EmployeeSlice.actions;
export default EmployeeSlice.reducer;
