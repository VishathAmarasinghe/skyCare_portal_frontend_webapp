// App imports
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import { State } from "../../types/types";
import { APIService } from "../../utils/apiService";
import {
  AppConfig,
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "../../configName/config";
import { Password } from "@mui/icons-material";
import axios, { HttpStatusCode } from "axios";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../configName/constant";
import { jwtDecode } from "jwt-decode";

export interface UserData {
  userEmail: string;
  userID: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  status: State;
  passwordResetState: State;
  mode: "active" | "inactive" | "locked" | "maintenance";
  statusMessage: string | null;
  userInfo: UserData | null;
  decodedIdToken: any;
  roles: string[];
  exp: number;
  iat: number;
}

const initialState: AuthState = {
  isAuthenticated: false,
  status: State.idle,
  mode: "active",
  passwordResetState: State.idle,
  statusMessage: null,
  userInfo: null,
  decodedIdToken: null,
  roles: [],
  exp: 0,
  iat: 0,
};

// Fetch a single caregiver
export const login = createAsyncThunk(
  "login/user",
  async (
    payload: { email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    console.log("login payload", payload);

    return new Promise<string>(async (resolve, reject) => {
      try {
        const response = await APIService.getInstance().post(
          `${AppConfig.serviceUrls.authenticaion}/login`,
          {
            email: payload.email,
            password: payload.password,
          }
        );

        // Dispatch a success message on login
        dispatch(
          enqueueSnackbarMessage({
            message:
              response?.status === HttpStatusCode.Ok
                ? SnackMessage.success.login
                : "",
            type: "success",
          })
        );

        resolve(response.data); // Resolve the promise with the response data
      } catch (error: any) {
        if (axios.isCancel(error)) {
          reject("Request canceled"); // Reject the promise if the request was canceled
        }
        console.log("error", error);

        // Dispatch an error message
        dispatch(
          enqueueSnackbarMessage({
            message:
              error?.response?.status === HttpStatusCode.InternalServerError
                ? SnackMessage.error.fetchSingleCareGiver
                : String(error?.response?.data),
            type: "error",
          })
        );

        reject(error?.response?.data || "An unknown error occurred"); // Reject the promise with an error message
      }
    });
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    payload: { email: string; password: string; employeeID: string },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const response = await APIService.getInstance().post(
          `${AppConfig.serviceUrls.authenticaion}/reset`,
          payload
        );

        // Dispatch a success message on login
        dispatch(
          enqueueSnackbarMessage({
            message:
              response?.status === HttpStatusCode.Ok
                ? SnackMessage.success.passwordReset
                : "",
            type: "success",
          })
        );

        resolve(response.data); // Resolve the promise with the response data
      } catch (error: any) {
        if (axios.isCancel(error)) {
          reject("Request canceled"); // Reject the promise if the request was canceled
        }
        console.log("error", error);

        // Dispatch an error message
        dispatch(
          enqueueSnackbarMessage({
            message:
              error?.response?.status === HttpStatusCode.InternalServerError
                ? SnackMessage.error.passwordReset
                : String(error?.response?.data?.message),
            type: "error",
          })
        );

        reject(error?.response?.data?.message || "An unknown error occurred"); // Reject the promise with an error message
      }
    });
  }
);

export const checkAuthToken = (dispatch: AppDispatch) => {
  const token = localStorage.getItem("token");
  if (!token) {
    dispatch(logout());

    return;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000; // Convert to seconds

    if (decodedToken.exp && decodedToken.exp > currentTime) {
      var userRoles: string[] = [];
      var decodedAccessRoles: string[] = decodedToken?.accessRole;
      if (decodedAccessRoles.includes(APPLICATION_ADMIN)) {
        userRoles.push(APPLICATION_ADMIN);
      }
      if (decodedAccessRoles.includes(APPLICATION_SUPER_ADMIN)) {
        userRoles.push(APPLICATION_SUPER_ADMIN);
      }
      if (decodedAccessRoles.includes(APPLICATION_CARE_GIVER)) {
        userRoles.push(APPLICATION_CARE_GIVER);
      }
      // Token is valid
      dispatch(
        authSlice.actions.loginSuccess({
          userInfo: {
            userEmail: decodedToken.email,
            userID: decodedToken.userId,
          },
          roles: userRoles,
          exp: decodedToken.exp,
          iat: decodedToken.iat,
        })
      );
    } else {
      // Token expired
      dispatch(
        enqueueSnackbarMessage({
          message: "Session expired. Please log in again.",
          type: "error",
        })
      );
      dispatch(logout());
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    dispatch(logout());
  }
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<Partial<AuthState>>) => {
      state.isAuthenticated = true;
      state.userInfo = {
        userEmail: action.payload.userInfo?.userEmail || "",
        userID: action.payload.userInfo?.userID || "",
      };
      state.roles = action.payload.roles || [];
      state.exp = action.payload.exp || 0;
      state.iat = action.payload.iat || 0;
      state.status = State.success;
    },
    logout: (state) => {
      localStorage.removeItem("token");
      state.isAuthenticated = false;
      state.status = State.idle;
      state.mode = "inactive";
      state.statusMessage = null;
      state.userInfo = null;
      state.decodedIdToken = null;
      state.roles = [];
      state.exp = 0;
      state.iat = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = State.loading;
        state.statusMessage = "Authentication processing...";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = State.success;
        state.statusMessage = "Successfully authenticated!";
        state.isAuthenticated = true;
        state.mode = "active";

        localStorage.setItem("token", action.payload);

        try {
          const decodedToken: any = jwtDecode(action.payload);
          console.log("Decoded Token:", decodedToken);

          state.userInfo = {
            userEmail: decodedToken?.email,
            userID: decodedToken?.userId,
          };
          var decodedAccessRoles: string[] = decodedToken?.accessRole;
          if (decodedAccessRoles.includes(APPLICATION_ADMIN)) {
            state.roles.push(APPLICATION_ADMIN);
          }
          if (decodedAccessRoles.includes(APPLICATION_SUPER_ADMIN)) {
            state.roles.push(APPLICATION_SUPER_ADMIN);
          }
          if (decodedAccessRoles.includes(APPLICATION_CARE_GIVER)) {
            state.roles.push(APPLICATION_CARE_GIVER);
          }
          state.exp = decodedToken?.exp;
          state.iat = decodedToken?.iat;
        } catch (error) {
          state.status = State.failed;
          console.error("Error decoding token:", error);
          state.statusMessage = "Failed to decode token!";
        }
      })
      .addCase(login.rejected, (state) => {
        state.status = State.failed;
        state.statusMessage = "Failed to authenticate!";
        state.isAuthenticated = false;
        state.userInfo = null;
        state.roles = [];
        state.exp = 0;
        state.iat = 0;
      })
      .addCase(resetPassword.pending, (state) => {
        state.passwordResetState = State.loading;
        state.statusMessage = "Resetting Password...";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.passwordResetState = State.success;
        state.statusMessage = "Successfully reset password!";
      })
      .addCase(resetPassword.rejected, (state) => {
        state.passwordResetState = State.failed;
        state.statusMessage = "Failed to reset password!";
      });
  },
});

export const { logout } = authSlice.actions;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const selectRoles = (state: RootState) => state.auth.roles;
export default authSlice.reducer;
