import { Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ShiftNoteTable from "./components/ShiftNoteTable";
import { useAppDispatch, useAppSelector } from "../../slices/store";
import {
  APPLICATION_ADMIN,
  APPLICATION_CARE_GIVER,
  APPLICATION_SUPER_ADMIN,
} from "../../config/config";
import {
  getAllShiftNotes,
  getAllShiftNotesByEmployeeID,
} from "../../slices/shiftNoteSlice/shiftNote";
import ShiftNoteModal from "../careGiver-dashboard-view/modal/ShiftNoteModal";
import { State } from "../../types/types";

const ShiftNoteView = () => {
  const theme = useTheme();
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);
  const [shiftIsEditMode, setShiftIsEditMode] = useState<boolean>(false);
  const [selectedShiftNote, setSelectedShiftNote] = useState<{
    shiftNoteID: string | null;
  }>({ shiftNoteID: null });
  const [pureNew, setPureNew] = useState<boolean>(false);
  const authRoles = useAppSelector((state) => state?.auth?.roles);
  const authUser = useAppSelector((state) => state?.auth?.userInfo);
  const shiftSlice = useAppSelector((state) => state?.shiftNotes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (authRoles.includes(APPLICATION_CARE_GIVER)) {
      dispatch(getAllShiftNotesByEmployeeID(authUser?.userID ?? ""));
    } else if (
      authRoles.includes(APPLICATION_ADMIN) ||
      authRoles.includes(APPLICATION_SUPER_ADMIN)
    ) {
      dispatch(getAllShiftNotes());
    }
  }, [shiftSlice?.submitState, shiftSlice?.updateState]);

  useEffect(() => {
    if (
      shiftSlice?.submitState === State?.success ||
      shiftSlice?.updateState === State?.success
    ) {
      setShiftModalOpen(false);
      setSelectedShiftNote({ shiftNoteID: null });
      setShiftIsEditMode(false);
    }
  }, [shiftSlice?.submitState, shiftSlice?.updateState]);

  return (
    <Stack
      width="100%"
      data-aos="fade-right"
      data-aos-duration="200"
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: 1,
        borderRadius: 2,
        padding: 2,
      }}
      height="100%"
    >
      <ShiftNoteModal
        pureNew={pureNew}
        isEditMode={shiftIsEditMode}
        setIsEditMode={setShiftIsEditMode}
        setSelectedShiftNote={setSelectedShiftNote}
        isNoteModalVisible={shiftModalOpen}
        setIsNoteModalVisible={setShiftModalOpen}
        selectedShiftNote={selectedShiftNote}
        foreignDetails={{ careGiverID: null, recurrentID: null }}
      />
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Shift Notes
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedShiftNote({ shiftNoteID: null }),
              setShiftIsEditMode(true),
              setShiftModalOpen(true),
              setPureNew(true);
          }}
        >
          New Shift Note
        </Button>
      </Stack>
      <Stack width="100%" height="480px">
        <ShiftNoteTable
          setPureNew={setPureNew}
          isNoteModalVisible={shiftModalOpen}
          setIsNoteModalVisible={setShiftModalOpen}
        />
      </Stack>
    </Stack>
  );
};

export default ShiftNoteView;
