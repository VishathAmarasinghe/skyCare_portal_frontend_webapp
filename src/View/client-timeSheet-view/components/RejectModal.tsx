import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { useAppDispatch } from "@slices/store";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ open, onClose, onConfirm}) => {
  const dispatch = useAppDispatch();
    const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setComment(comment); // Ensure it resets properly
    }
  }, [open, comment, setComment]);

  const handleConfirm = () => {
    if (comment.trim() === "") {
      return dispatch(enqueueSnackbarMessage({ message: "Please enter a rejection reason", type: "error" }));
    }
    onConfirm(comment);
    setComment(""); // Clear input after submission
    onClose(); // Close modal after confirming
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="reject-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography id="reject-modal-title" variant="h6" mb={2}>
          Reject Time Sheet
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={5}
          label="Reason for rejection"
          variant="outlined"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} color="secondary" size="small" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" size="small" variant="contained">
            Reject
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RejectModal;
