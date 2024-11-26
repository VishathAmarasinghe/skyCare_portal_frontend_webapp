import { fetchGoalOutcomes } from "@slices/carePlanSlice/carePlan";
import { saveClient } from "@slices/clientSlice/client";

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
        
  },
  warning: {},
}
