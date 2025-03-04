export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "";
export const ServiceBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? "";
export const APPLICATION_ADMIN = import.meta.env.VITE_APPLICATION_ADMIN ?? "";
export const APPLICATION_SUPER_ADMIN =
  import.meta.env.VITE_APPLICATION_SUPER_ADMIN ?? "";
export const APPLICATION_CARE_GIVER =
  import.meta.env.VITE_APPLICATION_CARE_GIVER ?? "";
export const APPLICATION_CLIENT = import.meta.env.VITE_APPLICATION_CLIENT ?? "";
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY ?? "";
export const FILE_DOWNLOAD_BASE_URL = `${
  import.meta.env.VITE_BACKEND_BASE_URL
}${import.meta.env.VITE_FILE_DOWNLOAD_PATH}?filePath=`;

export const AppConfig = {
  serviceUrls: {
    clients: `${ServiceBaseUrl}/clients`,
    getUserInfo: `${ServiceBaseUrl}/user-info`,
    classifications: `${ServiceBaseUrl}/classifications`,
    languages: `${ServiceBaseUrl}/languages`,
    clientStatus: `${ServiceBaseUrl}/clients-status`,
    clientTypes: `${ServiceBaseUrl}/client-type`,
    notes: `${ServiceBaseUrl}/notes`,
    carePlans: `${ServiceBaseUrl}/careplans`,
    carePlanStatus: `${ServiceBaseUrl}/careplan-status`,
    goalOutcomes: `${ServiceBaseUrl}/goal-outcome`,
    appointments: `${ServiceBaseUrl}/appointments`,
    employees: `${ServiceBaseUrl}/employees`,
    careGivers: `${ServiceBaseUrl}/care-givers`,
    careGiverDocumentTypes: `${ServiceBaseUrl}/care-giver-document-types`,
    careGiverPaymentTypes: `${ServiceBaseUrl}/care-giver-payment-types`,
    appointmentTypes: `${ServiceBaseUrl}/appointment-types`,
    authenticaion: `${ServiceBaseUrl}/auth`,
    jobAssigns: `${ServiceBaseUrl}/job-assigner`,
    resources: `${ServiceBaseUrl}/resources`,
    shiftNotes: `${ServiceBaseUrl}/shift-notes`,
    otp: `${ServiceBaseUrl}/otp`,
    incidentTypes: `${ServiceBaseUrl}/incident-types`,
    incidentStatus: `${ServiceBaseUrl}/incident-status`,
    incidentQuestions: `${ServiceBaseUrl}/incident-action-types`,
    dashboard: `${ServiceBaseUrl}/dashboard`,
    incident: `${ServiceBaseUrl}/incidents`,
    clientDocuments: `${ServiceBaseUrl}/client-documents`,
    carePlanBillings: `${ServiceBaseUrl}/care-plan-bills`,
    chat:`${ServiceBaseUrl}/chats`,
  },
  webSocketUrl:`${ServiceBaseUrl}/ws`,
};
