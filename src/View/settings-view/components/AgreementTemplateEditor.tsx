import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  Box,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  TextField,
  Alert,
  useTheme,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import TableChartIcon from "@mui/icons-material/TableChart";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ViewWeekOutlinedIcon from "@mui/icons-material/ViewWeekOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import MergeTypeIcon from "@mui/icons-material/MergeType";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CodeIcon from "@mui/icons-material/Code";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import { useAppDispatch } from "../../../slices/store";
import { DEFAULT_AGREEMENT_SIGNATURE_SECTION_HTML } from "../../../constants/agreementSignatureSection";
import { getAgreementHtmlContentSx } from "../../../utils/agreementHtmlContentStyles";
import { uploadAgreementAsset } from "../../../slices/agreementTemplateSlice/agreementTemplate";
import { PlaceholderItem } from "../../../slices/agreementTemplateSlice/agreementTemplate";

type EditorMode = "agreement" | "email";

interface AgreementTemplateEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholders?: PlaceholderItem[];
  templateId?: string;
  mode?: EditorMode;
  minHeight?: number;
}

interface ToolbarIconButtonProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const ToolbarIconButton: React.FC<ToolbarIconButtonProps> = ({
  title,
  onClick,
  active = false,
  disabled = false,
  children,
}) => {
  const theme = useTheme();
  return (
    <Tooltip title={title} arrow>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: 1,
            color: active ? theme.palette.primary.main : theme.palette.text.primary,
            backgroundColor: active ? theme.palette.primary.main + "18" : "transparent",
            "&:hover": {
              backgroundColor: active
                ? theme.palette.primary.main + "28"
                : theme.palette.action.hover,
            },
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

const ToolbarGroup: React.FC<{ children: React.ReactNode; label?: string }> = ({
  children,
  label,
}) => (
  <Stack direction="row" alignItems="center" spacing={0.25} sx={{ px: 0.5 }}>
    {label && (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mr: 0.5, display: { xs: "none", md: "block" }, minWidth: "fit-content" }}
      >
        {label}
      </Typography>
    )}
    {children}
  </Stack>
);

const AgreementTemplateEditor: React.FC<AgreementTemplateEditorProps> = ({
  content,
  onChange,
  placeholders = [],
  templateId,
  mode = "agreement",
  minHeight = 320,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(content);

  const tableWarning = useMemo(() => {
    const colMatches = content.match(/<col[^>]*>/gi) || [];
    const thMatches = content.match(/<th[^>]*>/gi) || [];
    const cols = Math.max(colMatches.length, thMatches.length);
    if (cols > 6) {
      return "This table has many columns and may overflow in PDF output. Consider splitting or using page breaks.";
    }
    if (content.includes("<table") && content.length > 12000) {
      return "Large table content detected — verify page breaks for PDF pagination.";
    }
    return null;
  }, [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: true, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: "agreement-html-content ProseMirror",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const insertPlaceholder = (token: string) => {
    editor?.chain().focus().insertContent(token).run();
  };

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const result = await dispatch(
        uploadAgreementAsset({ file, templateId })
      ).unwrap();
      editor.chain().focus().setImage({ src: result.url }).run();
    };
    input.click();
  }, [dispatch, editor, templateId]);

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertPageBreak = () => {
    editor?.chain().focus().insertContent('<div class="page-break-before"></div>').run();
  };

  const insertTwoColumns = () => {
    editor?.chain().focus().insertContent(
      '<div class="agreement-columns"><div class="agreement-column"><p>Left column</p></div><div class="agreement-column"><p>Right column</p></div></div>'
    ).run();
  };

  const insertSignatureSection = () => {
    editor?.chain().focus().insertContent(DEFAULT_AGREEMENT_SIGNATURE_SECTION_HTML).run();
  };

  const toggleSource = () => {
    if (!showSource) {
      setSourceHtml(editor?.getHTML() || content);
    } else if (editor) {
      editor.commands.setContent(sourceHtml, { emitUpdate: false });
      onChange(sourceHtml);
    }
    setShowSource((v) => !v);
  };

  const applySourceHtml = () => {
    if (editor) {
      editor.commands.setContent(sourceHtml, { emitUpdate: false });
      onChange(sourceHtml);
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  const showTableTools = mode === "agreement";
  const iconSize = "small" as const;

  return (
    <Stack spacing={1.5}>
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          borderRadius: 1.5,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          useFlexGap
          sx={{ gap: 0.5 }}
        >
          <ToolbarGroup label="Style">
            <ToggleButtonGroup size={iconSize} aria-label="text style">
              <ToggleButton
                value="bold"
                selected={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                aria-label="Bold"
              >
                <FormatBoldIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="italic"
                selected={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Italic"
              >
                <FormatItalicIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="underline"
                selected={editor.isActive("underline")}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Underline"
              >
                <FormatUnderlinedIcon fontSize={iconSize} />
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

          <ToolbarGroup label="Heading">
            <ToggleButtonGroup size={iconSize} exclusive aria-label="heading level">
              <ToggleButton
                value="h1"
                selected={editor.isActive("heading", { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                aria-label="Heading 1"
              >
                <LooksOneIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="h2"
                selected={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Heading 2"
              >
                <LooksTwoIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="h3"
                selected={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                aria-label="Heading 3"
              >
                <Looks3Icon fontSize={iconSize} />
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

          <ToolbarGroup label="List">
            <ToggleButtonGroup size={iconSize} exclusive aria-label="lists">
              <ToggleButton
                value="bullet"
                selected={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet list"
              >
                <FormatListBulletedIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="ordered"
                selected={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Numbered list"
              >
                <FormatListNumberedIcon fontSize={iconSize} />
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

          <ToolbarGroup label="Align">
            <ToggleButtonGroup size={iconSize} exclusive aria-label="text alignment">
              <ToggleButton
                value="left"
                selected={editor.isActive({ textAlign: "left" })}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                aria-label="Align left"
              >
                <FormatAlignLeftIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="center"
                selected={editor.isActive({ textAlign: "center" })}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                aria-label="Align center"
              >
                <FormatAlignCenterIcon fontSize={iconSize} />
              </ToggleButton>
              <ToggleButton
                value="right"
                selected={editor.isActive({ textAlign: "right" })}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                aria-label="Align right"
              >
                <FormatAlignRightIcon fontSize={iconSize} />
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarGroup>

          {showTableTools && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              <ToolbarGroup label="Table">
                <ToolbarIconButton title="Insert table" onClick={insertTable}>
                  <TableChartIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Add row"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <PlaylistAddIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Add column"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <ViewWeekOutlinedIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Delete row"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  <PlaylistRemoveIcon fontSize={iconSize} color="error" />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Delete column"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  <ViewColumnIcon fontSize={iconSize} color="error" />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Delete table"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                >
                  <DeleteOutlineIcon fontSize={iconSize} color="error" />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Merge cells"
                  onClick={() => editor.chain().focus().mergeCells().run()}
                >
                  <MergeTypeIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton
                  title="Split cell"
                  onClick={() => editor.chain().focus().splitCell().run()}
                >
                  <CallSplitIcon fontSize={iconSize} />
                </ToolbarIconButton>
              </ToolbarGroup>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              <ToolbarGroup label="Insert">
                <ToolbarIconButton title="Insert link" onClick={setLink}>
                  <InsertLinkIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton title="Page break" onClick={insertPageBreak}>
                  <VerticalAlignBottomIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton title="Two-column layout" onClick={insertTwoColumns}>
                  <ViewColumnIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton title="Add signature section" onClick={insertSignatureSection}>
                  <DrawOutlinedIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton title="Source HTML" onClick={toggleSource} active={showSource}>
                  <CodeIcon fontSize={iconSize} />
                </ToolbarIconButton>
                <ToolbarIconButton title="Insert image" onClick={handleImageUpload}>
                  <ImageOutlinedIcon fontSize={iconSize} />
                </ToolbarIconButton>
              </ToolbarGroup>
            </>
          )}

          {mode === "email" && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              <ToolbarGroup label="Insert">
                <ToolbarIconButton title="Insert link" onClick={setLink}>
                  <InsertLinkIcon fontSize={iconSize} />
                </ToolbarIconButton>
              </ToolbarGroup>
            </>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

          <ToolbarGroup label="History">
            <ToolbarIconButton
              title="Undo"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <UndoIcon fontSize={iconSize} />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Redo"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <RedoIcon fontSize={iconSize} />
            </ToolbarIconButton>
          </ToolbarGroup>

          {placeholders.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              <ToolbarGroup label="Fields">
                <Select
                  size="small"
                  displayEmpty
                  value=""
                  onChange={(e) => {
                    if (e.target.value) insertPlaceholder(e.target.value);
                  }}
                  renderValue={() => (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <DataObjectIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2">Placeholder</Typography>
                    </Stack>
                  )}
                  sx={{
                    minWidth: 140,
                    height: 34,
                    backgroundColor: "background.paper",
                    "& .MuiSelect-select": { py: 0.75 },
                  }}
                >
                  <MenuItem value="" disabled>
                    Insert placeholder
                  </MenuItem>
                  {placeholders.map((item) => (
                    <MenuItem key={item.token} value={item.token}>
                      <Stack>
                        <Typography variant="body2">{item.token}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </ToolbarGroup>
            </>
          )}
        </Stack>
      </Paper>

      {tableWarning && mode === "agreement" && (
        <Alert severity="warning" sx={{ py: 0.5 }}>
          {tableWarning}
        </Alert>
      )}

      {showSource ? (
        <TextField
          multiline
          fullWidth
          minRows={12}
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          onBlur={applySourceHtml}
          sx={{
            "& textarea": { fontFamily: "monospace", fontSize: 13 },
          }}
        />
      ) : (
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1.5,
          p: 2,
          minHeight,
          backgroundColor: "background.paper",
          transition: "border-color 0.2s",
          "&:focus-within": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${theme.palette.primary.main}33`,
          },
          "& .ProseMirror": {
            outline: "none",
            minHeight: minHeight - 32,
          },
          ...getAgreementHtmlContentSx(theme, "& .ProseMirror"),
        }}
      >
        <EditorContent editor={editor} />
      </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        {mode === "email"
          ? "Use placeholders like [Recipient Name] — they merge when you preview the email."
          : "Use placeholders like {{worker.fullName}} — they merge when previewing. Use Add signature section for admin/recipient sign blocks."}
      </Typography>
    </Stack>
  );
};

export default AgreementTemplateEditor;
