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
import ChatReducer from './chatSlice/chat';
import SignatureReducer from './signatureSlice/signature';
import AppSettingsReducer from "./appSettingsSlice/appSettings";
import AgreementTemplateReducer from "./agreementTemplateSlice/agreementTemplate";
import OrganizationReducer from "./organizationSlice/organization";
import EmailTemplateReducer from "./emailTemplateSlice/emailTemplate";
import AgreementInstanceReducer from "./agreementInstanceSlice/agreementInstance";
import AgreementReferenceMaterialReducer from "./agreementReferenceMaterialSlice/agreementReferenceMaterial";
import ComplianceLookupReducer from "./complianceLookupSlice/complianceLookup";
import StaffTrainingReducer from "./staffTrainingSlice/staffTraining";
import BehaviorSupportReducer from "./behaviorSupportSlice/behaviorSupport";

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
    chat: ChatReducer,
    signature: SignatureReducer,
    appSettings: AppSettingsReducer,
    agreementTemplates: AgreementTemplateReducer,
    organization: OrganizationReducer,
    emailTemplates: EmailTemplateReducer,
    agreementInstances: AgreementInstanceReducer,
    agreementReferenceMaterials: AgreementReferenceMaterialReducer,
    complianceLookup: ComplianceLookupReducer,
    staffTraining: StaffTrainingReducer,
    behaviorSupport: BehaviorSupportReducer,
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
