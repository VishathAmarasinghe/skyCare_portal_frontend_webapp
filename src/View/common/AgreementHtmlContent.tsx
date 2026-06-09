import React, { useEffect, useMemo, useRef } from "react";
import { Box, BoxProps, useTheme } from "@mui/material";
import {
  AgreementHtmlContentStyleOptions,
  getAgreementHtmlContentSx,
  getAgreementHtmlScrollWrapperSx,
} from "../../utils/agreementHtmlContentStyles";
import {
  applyAgreementTickToggle,
  enhanceAgreementCheckboxes,
  serializeAgreementCheckboxes,
} from "../../utils/agreementCheckboxMarkup";

interface AgreementHtmlContentProps extends Omit<BoxProps, "children"> {
  html: string;
  styleOptions?: AgreementHtmlContentStyleOptions;
  /** Enable clickable ☐ / ☑ controls for public signing. */
  interactive?: boolean;
  onContentChange?: (html: string) => void;
}

/** Renders merged agreement HTML with consistent table, list, and signature block styling. */
const AgreementHtmlContent = React.forwardRef<HTMLDivElement, AgreementHtmlContentProps>(
  ({ html, sx, styleOptions, interactive = false, onContentChange, ...boxProps }, ref) => {
    const theme = useTheme();
    const innerRef = useRef<HTMLDivElement | null>(null);

    const renderedHtml = useMemo(
      () => (interactive ? enhanceAgreementCheckboxes(html) : html),
      [html, interactive]
    );

    useEffect(() => {
      if (!interactive) return;
      const root = innerRef.current;
      if (!root) return;

      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest("button.agreement-tick") as HTMLButtonElement | null;
        if (!button || !root.contains(button)) return;
        event.preventDefault();
        applyAgreementTickToggle(button, root);
        onContentChange?.(serializeAgreementCheckboxes(root));
      };

      root.addEventListener("click", handleClick);
      return () => root.removeEventListener("click", handleClick);
    }, [interactive, renderedHtml, onContentChange]);

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const content = (
      <Box
        ref={setRef}
        className="agreement-html-content"
        sx={[
          getAgreementHtmlContentSx(theme, "&", styleOptions),
          interactive && {
            "& button.agreement-tick": {
              appearance: "none",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              font: "inherit",
              color: "inherit",
              lineHeight: "inherit",
              padding: "0 2px",
              margin: 0,
              verticalAlign: "baseline",
              "&:hover": {
                color: theme.palette.primary.main,
              },
              "&:focus-visible": {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
                borderRadius: 1,
              },
            },
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
        {...boxProps}
      />
    );

    if (!styleOptions?.compactMobile) {
      return content;
    }

    return <Box sx={getAgreementHtmlScrollWrapperSx(theme)}>{content}</Box>;
  }
);

AgreementHtmlContent.displayName = "AgreementHtmlContent";

export default AgreementHtmlContent;

export function getAgreementHtmlSnapshot(root: HTMLDivElement | null): string {
  if (!root) return "";
  return serializeAgreementCheckboxes(root);
}
