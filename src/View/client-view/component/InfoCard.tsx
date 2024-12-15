import React, { useState } from "react";
import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const InfoCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      onClick={handleToggle}
      sx={{ cursor: "pointer" }}
    >
      <Card
        sx={{
          maxWidth: 600,
          backgroundColor: "#e3f2fd", // Light blue background
          borderLeft: "4px solid #2196f3", // Blue accent on the left
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" p={0}>
            <IconButton disableRipple sx={{ color: "#2196f3" }}>
              <InfoIcon />
            </IconButton>
            <Typography
              variant="h6"
              color="textPrimary"
              fontWeight="bold"
            >
              {isExpanded ? "Action Required" : "Info"}
            </Typography>
          </Box>
          {isExpanded && (
            <Typography
              variant="body2"
              color="textSecondary"
              mt={1}
            >
              Please select an appointment from the table to update its corresponding date and time. Enable editing to make changes. Without selecting an appointment, you can only update overall appointment details.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InfoCard;
