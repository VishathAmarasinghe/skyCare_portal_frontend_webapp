export const preventBackdropClose =
  (onClose: () => void) =>
  (_event: object, reason?: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") return;
    onClose();
  };
