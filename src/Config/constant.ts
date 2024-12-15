import { Note, OtherHouses } from "@mui/icons-material";
import { updateRecurrentAppointment } from "@slices/AppointmentSlice/appointment";
import { fetchGoalOutcomes, UpdateCarePlan } from "@slices/carePlanSlice/carePlan";
import { saveClient } from "@slices/clientSlice/client";
import { updateEmployee } from "@slices/EmployeeSlice/employee";
import { updateNotes } from "@slices/NotesSlice/notes";
import { fetchSingleResource } from "@slices/ResourceSlice/resource";

// snack messages
export const SnackMessage = {
  success: {
    saveLanguage:"Language saved successfully",
    saveClassification:"Classification saved successfully",
    saveClientType:"Client type saved successfully",
    saveClientStatus:"Client status saved successfully",
    saveClient:"Client saved successfully",
    saveNotes:"Notes saved successfully",
    saveCarePlans:"Care plans saved successfully",
    updateNotes : "Notes updated successfully",
    NoteDeleted:"Note deleted successfully",
    updateCarePlan:"Care plan updated successfully",
    saveEmployee:"Employee saved successfully",
    saveCareGiver:"Care giver saved successfully",
    updateEmployee:"Employee updated successfully",
    login:"Login successful",
    saveResources:"Resource saved successfully",
    deleteResource:"Resource deleted successfully",
    updateRecurrentAppointment:"Recurrent appointment updated successfully",
    shiftStarted:"Shift started successfully,please make sure to end the shift!",
    shiftFinished:"Shift ended successfully",
    shiftUpdate:"Shift updated successfully",
    OTPSent:"OTP sent successfully, Please check your email",
    passwordReset:"Password reset successfully",

  },
  error: {
    fetchClients:"Failed to fetch clients",
    fetchClassifications:"Failed to fetch classifications",
    fetchLanguages:"Failed to fetch languages",
    fetchClientStatus:"Failed to fetch client status",
    fetchClientTypes:"Failed to fetch client types",
    saveLanguage:"Failed to save language",
    saveClassification:"Failed to save classification",
    saveClientType:"Failed to save client type",
    saveClientStatus:"Failed to save client status",
    saveClient:"Failed to save client",
    fetchSingleClient:"Failed to fetch client",
    fetchNotes:"Failed to fetch notes",
    saveNotes:"Failed to save notes",
    saveCarePlans:"Failed to save care plans",
    fetchCarePlans:"Failed to fetch care plans",
    fetchCarePlanStatus:"Failed to fetch care plan status",
    fetchGoalOutcomes:"Failed to fetch goal outcomes",
    updateNotes:"Failed to update notes",
    NoteDeleted:"Failed to delete note",
    updateCarePlan:"Failed to update care plan",
    fetchEmployees:"Failed to fetch employees",
    saveEmployee:"Failed to save employee",
    fetchSingleEmployee:"Failed to fetch employee",
    fetchCareGivers:"Failed to fetch care givers",
    saveCareGiver:"Failed to save care giver",
    fetchSingleCareGiver:"Failed to fetch care giver",
    fetchCareGiverDocumentTypes:"Failed to fetch care giver document types",
    fetchCareGiverPaymentTypes:"Failed to fetch care giver payment types",
    updateEmployee:"Failed to update employee",
    fetchAppointments:"Failed to fetch appointments",
    fetchCalenderEvents:"Failed to fetch calender events",
    login:"Login failed",
    updateJobAcceptanceState:"Failed to update job state",
    fetchJobAssignerTable:"Failed to fetch job assigner table data",
    fetchResources:"Failed to fetch resources",
    saveResources:"Failed to save resources",
    fetchSingleResource:"Failed to fetch resource",
    updateResource:"Failed to update resource",
    deleteResource:"Failed to delete resource",
    appointmentCancel:"Failed to cancel appointment",
    updateRecurrentAppointment:"Failed to update recurrent appointment",
    fetchingNextAppointment:"Failed to fetch next appointment, Please contact admin!",
    shiftStarted:"Failed to start shift, Please contact admin!",
    shiftFinished:"Failed to finish shift, Please contact admin!",
    fetchShiftNotes:"Failed to fetch shift notes",
    fetchMetaEmployees:"Failed to fetch meta employees",
    shiftUpdate:"Failed to update shift",   
    otpSend:"Failed to send OTP, Please contact admin!",   
    otpValidate:"Failed to validate OTP, Please contact admin!", 
    passwordReset:"Failed to reset password, Please contact admin!",
    fetchIncidentTypes:"Failed to fetch incident types",
    fetchIncidentStatus:"Failed to fetch incident status",
    fetchIncidentQuestions:"Failed to fetch incident questions",
    fetchDashboard:"Failed to fetch dashboard",
  },
  warning: {},
}
