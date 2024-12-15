import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import clientReducer from './clientSlice/client';
import SelectorReducer from './selectorSlice/selector';
import CommonReducer from './commonSlice/common';
import NoteReducer from './NotesSlice/notes';
import CarePlanReducer from './carePlanSlice/carePlan';
import AppointmentReducer from './AppointmentSlice/appointment';
import EmployeeReducer from './EmployeeSlice/employee';
import CareGiverReducer from './CareGiverSlice/careGiver';
import authReducer from './authSlice/Auth';
import ResourceReducer from './ResourceSlice/resource';
import ShiftNoteReducer from './ShiftNoteSlice/ShiftNote';
import OTPReducer from './OTPSlice/OTP';
import IncidentReducer from './IncidentSlice/incident';
import DashboardReducer from './DashboardSlice/dashboard';

export const store = configureStore({
  reducer: {
    clients:clientReducer,
    selector:SelectorReducer,
    common:CommonReducer,
    notes:NoteReducer,
    carePlans:CarePlanReducer,
    appointments:AppointmentReducer,
    employees:EmployeeReducer,
    careGivers:CareGiverReducer,
    auth:authReducer,
    resource:ResourceReducer,
    shiftNotes:ShiftNoteReducer,
    otp:OTPReducer,
    incident:IncidentReducer,
    dashboard:DashboardReducer,
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
