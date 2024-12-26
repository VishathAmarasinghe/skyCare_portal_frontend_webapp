import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import clientReducer from "./clientSlice/client";
import SelectorReducer from "./selectorSlice/selector";
import CommonReducer from "./commonSlice/common";
import NoteReducer from "./notesSliceName/notes";
import CarePlanReducer from "./carePlanSlice/carePlan";
import AppointmentReducer from "./appointmentSliceName/appointment";
import EmployeeReducer from "./employeeSliceName/employee";
import CareGiverReducer from "./careGiverSliceName/careGiver";
import authReducer from "./authSliceName/authName";
import ResourceReducer from "./resourceSliceName/resource";
import ShiftNoteReducer from "./shiftNoteSliceName/shiftNote";
import OTPReducer from "./oTPSliceName/oTPName";
import IncidentReducer from "./incidentSliceName/incident";
import DashboardReducer from "./dashboardSliceName/dashboard";

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
