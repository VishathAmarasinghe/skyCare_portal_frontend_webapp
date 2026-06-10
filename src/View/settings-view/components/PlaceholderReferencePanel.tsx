import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAppDispatch, useAppSelector } from "../../../slices/store";
import { fetchPlaceholderCatalog } from "../../../slices/agreementTemplateSlice/agreementTemplate";

const PlaceholderReferencePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { placeholders } = useAppSelector((state) => state.agreementTemplates);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchPlaceholderCatalog(search || undefined));
  }, [dispatch, search]);

  const totalCount = useMemo(
    () => placeholders.reduce((sum, cat) => sum + cat.items.length, 0),
    [placeholders]
  );

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600}>
        Placeholder Reference ({totalCount} tokens)
      </Typography>
      <TextField
        size="small"
        placeholder="Search tokens or descriptions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {placeholders.map((category) => (
        <Accordion key={category.category} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>{category.category}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              {category.items.map((item) => (
                <Stack
                  key={item.token}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ borderBottom: "1px solid #eee", pb: 1 }}
                >
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.token}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Typography variant="caption">
                      Example: {item.exampleOutput}
                    </Typography>
                  </Stack>
                  <Tooltip title="Copy token">
                    <IconButton size="small" onClick={() => copyToken(item.token)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

export default PlaceholderReferencePanel;
