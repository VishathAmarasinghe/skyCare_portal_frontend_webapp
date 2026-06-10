import jsPDF from "jspdf";
import "jspdf-autotable";
import appLogo from "../assets/images/app_logo.png";

export interface PdfColumn {
  header: string;
  key: string;
}

export interface BrandedPdfOptions {
  companyName?: string;
  logoUrl?: string;
}

const SKYCARE_PRIMARY: [number, number, number] = [5, 84, 118];
const HEADER_BOTTOM_Y = 34;

const loadImageAsBase64 = (
  src: string
): Promise<{ data: string; width: number; height: number }> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve({
        data: canvas.toDataURL("image/png"),
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => resolve({ data: "", width: 0, height: 0 });
    img.src = src;
  });

const resolveLogo = async (logoUrl?: string) => {
  if (logoUrl) {
    const fromOrg = await loadImageAsBase64(logoUrl);
    if (fromOrg.data) return fromOrg;
  }
  return loadImageAsBase64(appLogo);
};

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const drawReportHeader = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  title: string,
  logoData: { data: string; width: number; height: number },
  options?: BrandedPdfOptions
) => {
  if (logoData.data && logoData.width > 0 && logoData.height > 0) {
    const targetHeight = 16;
    const targetWidth = (targetHeight * logoData.width) / logoData.height;
    doc.addImage(
      logoData.data,
      "PNG",
      pageWidth - margin - targetWidth,
      10,
      targetWidth,
      targetHeight
    );
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...SKYCARE_PRIMARY);
  doc.text(options?.companyName || "SkyCare", margin, 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text(title, margin, 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text(`Exported ${new Date().toLocaleString()}`, margin, 27);

  doc.setDrawColor(222, 226, 230);
  doc.setLineWidth(0.4);
  doc.line(margin, HEADER_BOTTOM_Y, pageWidth - margin, HEADER_BOTTOM_Y);
};

export const exportRowsToPdf = async (
  title: string,
  columns: PdfColumn[],
  rows: Record<string, unknown>[],
  options?: BrandedPdfOptions
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const logoData = await resolveLogo(options?.logoUrl);

  drawReportHeader(doc, pageWidth, margin, title, logoData, options);

  doc.autoTable({
    startY: HEADER_BOTTOM_Y + 4,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => formatCellValue(row[c.key]))),
    styles: { fontSize: 7, cellPadding: 2.5, overflow: "linebreak", textColor: [33, 37, 41] },
    headStyles: {
      fillColor: [245, 247, 250],
      textColor: SKYCARE_PRIMARY,
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [222, 226, 230],
    },
    alternateRowStyles: { fillColor: [252, 253, 255] },
    margin: { left: margin, right: margin, top: HEADER_BOTTOM_Y + 4 },
    didDrawPage: (data: { pageNumber: number }) => {
      if (data.pageNumber > 1) {
        drawReportHeader(doc, pageWidth, margin, title, logoData, options);
      }
    },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
};
