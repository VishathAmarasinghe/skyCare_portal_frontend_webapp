export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "";
export const ServiceBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL ?? "";
export const APPLICATION_ADMIN = import.meta.env.VITE_APPLICATION_ADMIN ?? "";
export const APPLICATION_SUPER_ADMIN =
  import.meta.env.VITE_APPLICATION_SUPER_ADMIN ?? "";
export const APPLICATION_CARE_GIVER =
  import.meta.env.VITE_APPLICATION_CARE_GIVER ?? "";

export const AppConfig = {
  serviceUrls: {
    collections: `${ServiceBaseUrl}/collections`,
    getUserInfo: `${ServiceBaseUrl}/user-info`,
  },
};
