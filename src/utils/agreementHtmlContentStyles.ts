import { Theme } from "@mui/material/styles";
import { SystemStyleObject } from "@mui/system";

export interface AgreementHtmlContentStyleOptions {
  /** Stack tables and tighten typography on small screens (public sign page). */
  compactMobile?: boolean;
}

/** Scoped styles for rendered agreement HTML (preview, editor, public sign). */
export function getAgreementHtmlContentSx(
  theme: Theme,
  scope: string = "&",
  options: AgreementHtmlContentStyleOptions = {}
): SystemStyleObject {
  const { compactMobile = false } = options;
  const borderColor = theme.palette.mode === "dark" ? theme.palette.grey[600] : theme.palette.grey[400];
  const cellBorder = `1px solid ${borderColor}`;
  const signatureBorder = `1px solid ${theme.palette.text.primary}`;

  const base: SystemStyleObject = {
    [`${scope}`]: {
      maxWidth: "100%",
      overflowWrap: "break-word",
      wordBreak: "break-word",
      boxSizing: "border-box",
    },
    [`${scope} table`]: {
      borderCollapse: "collapse",
      width: "100%",
      maxWidth: "100%",
      margin: "1em 0",
      tableLayout: "fixed",
      wordBreak: "break-word",
      border: cellBorder,
    },
    [`${scope} th, ${scope} td`]: {
      border: cellBorder,
      padding: "8px 10px",
      verticalAlign: "top",
      textAlign: "left",
    },
    [`${scope} th`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      fontWeight: 600,
    },
    [`${scope} th.agreement-section-th`]: {
      backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[100],
      color: theme.palette.text.primary,
    },
    [`${scope} ul, ${scope} ol`]: {
      margin: "0.5em 0 0.75em",
      paddingLeft: "1.5em",
    },
    [`${scope} li`]: {
      marginBottom: "0.35em",
    },
    [`${scope} h2, ${scope} h3`]: {
      marginTop: "1em",
      marginBottom: "0.5em",
      lineHeight: 1.3,
    },
    [`${scope} p`]: {
      margin: "0 0 0.75em",
    },
    [`${scope} img`]: {
      maxWidth: "100%",
      height: "auto",
    },
    [`${scope} .agreement-columns`]: {
      display: "flex",
      gap: 16,
      margin: "12px 0",
      alignItems: "flex-start",
    },
    [`${scope} .agreement-column`]: {
      flex: 1,
      minWidth: 0,
      border: `1px dashed ${borderColor}`,
      borderRadius: 4,
      padding: 8,
    },
    [`${scope} .page-break-before`]: {
      borderTop: `2px dashed ${borderColor}`,
      margin: "16px 0",
      paddingTop: 8,
    },
    [`${scope} .agreement-signature-section`]: {
      width: "100%",
      maxWidth: "100%",
      borderCollapse: "collapse",
      border: signatureBorder,
      margin: "16px 0",
      pageBreakInside: "avoid",
    },
    [`${scope} .agreement-signature-section td`]: {
      width: "50%",
      border: signatureBorder,
      padding: "12px 14px",
      verticalAlign: "top",
    },
    [`${scope} .agreement-signature-line`]: {
      minHeight: 56,
      marginTop: 4,
    },
    [`${scope} .agreement-signature-line img, ${scope} .agreement-signature-image`]: {
      maxHeight: 80,
      maxWidth: "100%",
      objectFit: "contain",
      display: "block",
    },
    [`${scope} a`]: {
      color: theme.palette.primary.main,
      textDecoration: "underline",
      overflowWrap: "anywhere",
    },
  };

  if (!compactMobile) {
    return base;
  }

  return {
    ...base,
    [theme.breakpoints.down("md")]: {
      [`${scope} table`]: {
        tableLayout: "auto",
      },
    },
    [theme.breakpoints.down("sm")]: {
      [`${scope} h2`]: {
        fontSize: "1.125rem",
      },
      [`${scope} h3`]: {
        fontSize: "1rem",
      },
      [`${scope} th, ${scope} td`]: {
        padding: "6px 8px",
        fontSize: "0.8125rem",
      },
      [`${scope} div, ${scope} span, ${scope} p`]: {
        maxWidth: "100%",
      },
      [`${scope} .agreement-columns`]: {
        flexDirection: "column",
        gap: 12,
      },
      [`${scope} .agreement-column`]: {
        width: "100%",
      },
      [`${scope} .agreement-signature-section tbody`]: {
        display: "block",
        width: "100%",
      },
      [`${scope} .agreement-signature-section tr`]: {
        display: "block",
        width: "100%",
      },
      [`${scope} .agreement-signature-section td`]: {
        display: "block",
        width: "100% !important",
        boxSizing: "border-box",
      },
      [`${scope} .agreement-signature-section td + td`]: {
        borderTop: signatureBorder,
      },
      [`${scope} table:not(.agreement-signature-section) tr`]: {
        display: "flex",
        flexDirection: "column",
      },
      [`${scope} table:not(.agreement-signature-section) td, ${scope} table:not(.agreement-signature-section) th`]: {
        display: "block",
        width: "100% !important",
        boxSizing: "border-box",
      },
    },
  };
}

export function getAgreementHtmlScrollWrapperSx(theme: Theme): SystemStyleObject {
  return {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    [theme.breakpoints.down("sm")]: {
      overflowX: "hidden",
    },
  };
}
