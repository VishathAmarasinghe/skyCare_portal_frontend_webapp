import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { State } from "../../types/types";
import { AppConfig } from "../../configName/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../configName/constant";
import axios, { HttpStatusCode } from "axios";

export interface ShortTermGoal {
  shortTermGoalID: string;
  goalTitle: string;
  goalDescription: string;
  goalOutcomeTypeID: string;
  outcomeDetails: string;
  goalStrategy: string;
}

export interface LongTermGoal {
  longGoalID: string;
  longTermGoal: string;
  achieveWay: string;
  supportWay: string;
  notes: string;
  carePlanShortTermGoals: ShortTermGoal[];
}

export interface CarePlanBillable {
  billID: string;
  name: string;
  amount: number;
}

export interface CarePlan {
  title: string;
  careplanID: string;
  carePlanStatusID: string;
  startDate: string;
  endDate: string;
  clientID: string;
  carePlanLongTermGoals: LongTermGoal[];
  carePlanBillables: CarePlanBillable[];
}

export interface CarePlanState {
  state: State;
  submitState: State;
  updateState: State;
  carePlans: CarePlan[];
  carePlanStatusList: CarePlanStatus[];
  goalOutcomeList: GoalOutcome[];
  selectedCarePlan: CarePlan | null;
  errorMessage: string | null;
  stateMessage: string | null;
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
}

export interface CarePlanStatus {
  careplanStatusID: string;
  status: string;
}

export interface GoalOutcome {
  goalOutcomeID: string;
  status: string;
  description: string;
}

// Define the initial state for the NoteSlice
const initialState: CarePlanState = {
  state: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: "",
  errorMessage: "",
  carePlans: [],
  carePlanStatusList: [],
  goalOutcomeList: [],
  selectedCarePlan: null,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

// Fetch careplans by clientID
export const fetchGoalOutcomes = createAsyncThunk(
  "carePlans/fetchGoalOutcomes",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<GoalOutcome[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.goalOutcomes)
        .then((response) => {
          console.log("goal outcome response", response.data);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchGoalOutcomes
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch care plans by clientID
export const fetchCarePlansByClientID = createAsyncThunk(
  "carePlans/fetchCarePlansByClient",
  async (clientID: String, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlan[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.carePlans + `/client/${clientID}`)
        .then((response) => {
          console.log("care plan response", response.data);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCarePlans
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch care plans by clientID
export const fetchAllCarePlans = createAsyncThunk(
  "carePlans/fetchAllCarePlans",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlan[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.carePlans)
        .then((response) => {
          console.log("care plan response", response.data);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCarePlans
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch care plans by clientID
export const fetchSingleCarePlan = createAsyncThunk(
  "carePlans/fetchSingleCarePlan",
  async (carePlanID: String, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlan>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.carePlans + `/${carePlanID}`)
        .then((response) => {
          console.log("care plan response", response.data);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCarePlans
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch careplans by clientID
export const saveCarePlan = createAsyncThunk(
  "carePlans/saveCarePlan",
  async (payload: CarePlan, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlan>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.carePlans, payload)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveCarePlans,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.saveCarePlans
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch care plans by clientID
export const UpdateCarePlan = createAsyncThunk(
  "carePlans/UpdateCarePlan",
  async (payload: CarePlan, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlan>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.carePlans + `/${payload.careplanID}`,
          payload
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateCarePlan,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateCarePlan
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const saveCarePlanStatus = createAsyncThunk(
  "carePlans/saveCarePlanStatus",
  async (payload: CarePlanStatus, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlanStatus>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.carePlanStatus, payload)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.saveCarePlanStatus,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.saveCarePlanStatus
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

export const updateCarePlanStatus = createAsyncThunk(
  "carePlans/updateCarePlanStatus",
  async (payload: CarePlanStatus, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlanStatus>((resolve, reject) => {
      APIService.getInstance()
        .put(
          AppConfig.serviceUrls.carePlanStatus +
            `/${payload?.careplanStatusID}`,
          payload
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateCarePlanStatus,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateCarePlanStatus
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Fetch careplans by clientID
export const fetchCarePlanStatusList = createAsyncThunk(
  "carePlans/fetchCarePlanStatusList",
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<CarePlanStatus[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.carePlanStatus)
        .then((response) => {
          console.log("care plan status response", response.data);
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchCarePlanStatus
                  : String(error.response?.data?.message),
              type: "error",
            })
          );
          reject(error.response?.data?.message);
        });
    });
  }
);

// Define the slice with reducers and extraReducers
const CarePlanSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    resetSubmitState(state) {
      state.submitState = State.idle;
      state.updateState = State.idle;
    },
    resetSelectedCarePlan(state) {
      state.selectedCarePlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarePlansByClientID.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Care plans...";
      })
      .addCase(fetchCarePlansByClientID.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched careplans!";
        state.carePlans = action.payload;
      })
      .addCase(fetchCarePlansByClientID.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch carePlans!";
      })
      .addCase(fetchCarePlanStatusList.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Care plan status...";
      })
      .addCase(fetchCarePlanStatusList.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched care plan status!";
        state.carePlanStatusList = action.payload;
      })
      .addCase(fetchCarePlanStatusList.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch care plan status!";
      })
      .addCase(fetchGoalOutcomes.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "Fetching Goal outcomes...";
      })
      .addCase(fetchGoalOutcomes.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched goal outcomes!";
        state.goalOutcomeList = action.payload;
      })
      .addCase(fetchGoalOutcomes.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch goal outcomes!";
      })
      .addCase(saveCarePlan.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Saving care Plan...";
      })
      .addCase(saveCarePlan.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved care plan!";
      })
      .addCase(saveCarePlan.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save care plans!";
      })
      .addCase(fetchSingleCarePlan.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "fetching care Plan...";
      })
      .addCase(fetchSingleCarePlan.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched care plan!";
        state.selectedCarePlan = action.payload;
      })
      .addCase(fetchSingleCarePlan.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch care plan!";
      })
      .addCase(UpdateCarePlan.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "fetching care Plan...";
      })
      .addCase(UpdateCarePlan.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully fetched care plan!";
        state.selectedCarePlan = action.payload;
      })
      .addCase(UpdateCarePlan.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to fetch care plan!";
      })
      .addCase(fetchAllCarePlans.pending, (state) => {
        state.state = State.loading;
        state.stateMessage = "fetching care Plan...";
      })
      .addCase(fetchAllCarePlans.fulfilled, (state, action) => {
        state.state = State.success;
        state.stateMessage = "Successfully fetched care plan!";
        state.carePlans = action.payload;
      })
      .addCase(fetchAllCarePlans.rejected, (state) => {
        state.state = State.failed;
        state.stateMessage = "Failed to fetch care plan!";
      })
      .addCase(updateCarePlanStatus.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Updating care Plan...";
      })
      .addCase(updateCarePlanStatus.fulfilled, (state, action) => {
        state.updateState = State.success;
        state.stateMessage = "Successfully updated care plan!";
      })
      .addCase(updateCarePlanStatus.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update care plan!";
      })
      .addCase(saveCarePlanStatus.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "saving care Plan...";
      })
      .addCase(saveCarePlanStatus.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Successfully saved care plan!";
      })
      .addCase(saveCarePlanStatus.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to save care plan!";
      });
  },
});

export const { resetSubmitState, resetSelectedCarePlan } =
  CarePlanSlice.actions;
export default CarePlanSlice.reducer;
