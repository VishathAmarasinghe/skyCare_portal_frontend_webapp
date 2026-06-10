import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "@config/config";

export const isAdminUser = (roles: string[]) =>
  roles.includes(APPLICATION_ADMIN) || roles.includes(APPLICATION_SUPER_ADMIN);

export const isCareGiverUser = (roles: string[]) =>
  roles.includes(APPLICATION_CARE_GIVER);

export const getRequesterParams = (roles: string[], userId?: string | null) => ({
  requesterRole: roles.includes(APPLICATION_SUPER_ADMIN)
    ? "Super Admin"
    : roles.includes(APPLICATION_ADMIN)
      ? "Admin"
      : roles.includes(APPLICATION_CARE_GIVER)
        ? "CareGiver"
        : roles[0] || "",
  requesterEmployeeId: userId || "",
});
