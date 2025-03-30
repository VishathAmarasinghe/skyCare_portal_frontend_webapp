import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Button, Chip, Stack, Grid } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { updateShiftNotesPaymentStatus } from "@slices/shiftNoteSlice/shiftNote";
import { useConfirmationModalContext } from "@context/DialogContext";
import { ConfirmationType } from "../../../types/types";
import RejectModal from "./RejectModal";

interface TimeSheetCardProps {
  shiftNote: any;
}

const TimeSheetCard = ({ shiftNote }: TimeSheetCardProps) => {
  const { showConfirmation } = useConfirmationModalContext();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState(shiftNote.status);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "Approve") {
      setStatus("Approved");
      showConfirmation(
        "Approve Time Sheet",
        "Are you sure you want to approve this time sheet?",
        ConfirmationType.update,
        () =>
          dispatch(
            updateShiftNotesPaymentStatus({
              id: shiftNote.shiftNoteID,
              paymentState: "Approved",
              comment: shiftNote.comments,
            })
          ),
        "Yes",
        "Cancel"
      );
    } else if (newStatus === "Reject") {
      setRejectModalOpen(true);
    }
  };

  const handleRejectConfirm = (comment: string) => {
    setStatus("Rejected");
    setRejectModalOpen(false);
    showConfirmation(
      "Reject Time Sheet",
      "Are you sure you want to reject this time sheet?",
      ConfirmationType.update,
      () =>
        dispatch(
          updateShiftNotesPaymentStatus({
            id: shiftNote.shiftNoteID,
            paymentState: "Rejected",
            comment: shiftNote.comments !== "N/A" ? shiftNote.comments + " " + comment : comment,
          })
        ),
      "Yes",
      "Cancel"
    );
  };

  return (
    <Card sx={{ marginBottom: 2, width: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {shiftNote.employeeName}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              Shift Note ID: {shiftNote.shiftNoteID}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              Start Date: {shiftNote.startDate}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              Start Time: {shiftNote.startTime}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              End Time: {shiftNote.endTime}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="textSecondary">
              Total Work Hours: {shiftNote.totalWorkHrs} hrs
            </Typography>
          </Grid>

          {/* <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Shift Notes: {shiftNote.shiftNotes}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Comments: {shiftNote.comments}
            </Typography>
          </Grid> */}

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} marginTop={2}>
              {status === "Paid" ? (
                <Chip label="Paid" size="small" color="success" />
              ) : status === "Pending" ? (
                <>
                  <Chip
                    label="Approve"
                    size="small"
                    color="primary"
                    clickable
                    onClick={() => handleStatusChange("Approve")}
                  />
                  <Chip
                    label="Reject"
                    size="small"
                    color="warning"
                    clickable
                    onClick={() => handleStatusChange("Reject")}
                  />
                </>
              ) : (
                <Chip label={status} size="small" color={status === "Approved" ? "success" : "error"} />
              )}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
      <RejectModal
        open={isRejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
      />
    </Card>
  );
};

interface TimeSheetTableProps {
}

const ClientTimeSheetCardList = ({ }: TimeSheetTableProps) => {
  const [rows, setRows] = useState<any[]>([]);
  const shiftNoteSlice = useAppSelector((state) => state?.shiftNotes);

  useEffect(() => {
    // Mapping and transforming the data before setting the rows state
    const mappedRows = shiftNoteSlice?.timeSheets?.map((shiftNote) => ({
      shiftNoteID: shiftNote?.shiftNoteDTO?.noteID || "",
      employeeName: `${shiftNote?.employeeDTO?.firstName || "N/A"} ${
        shiftNote?.employeeDTO?.lastName
      }`,
      startDate: shiftNote?.shiftNoteDTO?.shiftStartDate || "",
      startTime: shiftNote?.shiftNoteDTO?.shiftStartTime || "",
      endTime: shiftNote?.shiftNoteDTO?.shiftEndTime || "",
      totalWorkHrs: shiftNote?.shiftNoteDTO?.totalWorkHrs || 0,
      shiftNotes: shiftNote?.shiftNoteDTO?.notes || "N/A",
      comments: shiftNote?.shiftNoteDTO?.comments || "N/A",
      status: shiftNote?.shiftNoteDTO?.paymentState || "N/A",
    }));
    setRows(mappedRows || []);
  }, [shiftNoteSlice?.timeSheets, shiftNoteSlice?.submitState, shiftNoteSlice?.updateState]);

  return (
    <Stack sx={{ width: "100%", padding: 2 }}>
      {rows.map((shiftNote, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
        <TimeSheetCard key={index} shiftNote={shiftNote} />
        </Box>
      ))}
      {
        rows.length === 0 && (
          <Typography variant="h6" color="textSecondary">
            No time sheets found
          </Typography>
        )
      }
    </Stack>
  );
};

export default ClientTimeSheetCardList;
