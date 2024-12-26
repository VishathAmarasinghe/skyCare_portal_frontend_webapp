import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./clientSlice/client";
import SelectorReducer from "./selectorSlice/selector";
import CommonReducer from "./commonSlice/common";
import NoteReducer from "./notesSlice/notes";
import CarePlanReducer from "./carePlanSlice/carePlan";
import AppointmentReducer from "./appointmentSlice/appointment";
import EmployeeReducer from "./employeeSlice/employee";
import CareGiverReducer from "./careGiverSlice/careGiver";
import authReducer from "./authSlice/auth";
import ResourceReducer from "./resourceSlice/resource";
import ShiftNoteReducer from "./shiftNoteSlice/shiftNote";
import OTPReducer from "./oTPSlice/oTP";
import IncidentReducer from "./incidentSlice/incident";
import DashboardReducer from "./dashboardSlice/dashboard";

export const store = configureStore({
  reducer: {
    clients: clientReducer,
    selector: SelectorReducer,
    common: CommonReducer,
    notes: NoteReducer,
    carePlans: CarePlanReducer,
    appointments: AppointmentReducer,
    employees: EmployeeReducer,
    careGivers: CareGiverReducer,
    auth: authReducer,
    resource: ResourceReducer,
    shiftNotes: ShiftNoteReducer,
    otp: OTPReducer,
    incident: IncidentReducer,
    dashboard: DashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: undefined,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
