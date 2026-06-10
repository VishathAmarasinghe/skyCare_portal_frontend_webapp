export type ReferenceMaterialViewMode = "pdf" | "image" | "unsupported";

export interface ReferenceMaterialPreviewMeta {
  mimeType?: string | null;
  originalFilename?: string | null;
}

export const getReferenceMaterialViewMode = (
  meta: ReferenceMaterialPreviewMeta
): ReferenceMaterialViewMode => {
  const mime = (meta.mimeType || "").toLowerCase();
  const name = (meta.originalFilename || "").toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (mime.startsWith("image/") || /\.(png|jpe?g)$/.test(name)) {
    return "image";
  }
  return "unsupported";
};

export const canPreviewReferenceMaterial = (meta: ReferenceMaterialPreviewMeta): boolean =>
  getReferenceMaterialViewMode(meta) !== "unsupported";
