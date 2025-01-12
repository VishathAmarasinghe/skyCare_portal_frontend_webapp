import { Button, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import CarePlanTable from "../CarePlanTable";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../slices/store";
import { State } from "../../../../types/types";
import {
  fetchCarePlansByClientID,
  fetchCarePlanStatusList,
  fetchGoalOutcomes,
  resetSubmitState,
} from "../../../../slices/carePlanSlice/carePlan";
import AddNewCarePlanModal from "../../modal/AddNewCarePlanModal";
import { useConfirmationModalContext } from "@context/DialogContext";

const CarePlansTab = () => {
  const [isCarePlanModalVisible, setIsCarePlanModalVisible] =
    useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const clientID = searchParams.get("clientID");
  const dispatch = useAppDispatch();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);


  const carePlans = useAppSelector((state) => state.carePlans);

  useEffect(() => {
    if (
      carePlans.submitState === State.success ||
      carePlans.updateState === State.success
    ) {
      setIsCarePlanModalVisible(false);
      resetSubmitState();
      fetchCarePlansRelatedToClient();
    }
  }, [carePlans.submitState, carePlans.updateState]);

  useEffect(() => {
    fetchCarePlansRelatedToClient();
  }, [clientID]);

  useEffect(() => {
      // fetchCarePlansRelatedToClient();
      if (clientID !== null && clientID !== undefined && clientID !== "") {
        dispatch(fetchCarePlansByClientID(clientID));
      }

  }, [isCarePlanModalVisible]);

  const fetchCarePlansRelatedToClient = async () => {
    if (clientID !== null && clientID !== undefined && clientID !== "") {
      dispatch(fetchCarePlansByClientID(clientID));
      dispatch(fetchCarePlanStatusList());
      dispatch(fetchGoalOutcomes());
    }
  };
  return (
    <Stack width="100%" height="100%">
      <AddNewCarePlanModal
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        isCarePlanAddModalVisible={isCarePlanModalVisible}
        setIsCarePlanAddModalVisible={setIsCarePlanModalVisible}
      />
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="end"
        justifyContent="flex-end"
        height="9%"
      >
        <Button
          variant="contained"
          onClick={() => {
            setIsCarePlanModalVisible(true), setIsEditMode(true);
          }}
        >
          Add Care Plan
        </Button>
      </Stack>
      <Stack width="100%" height="100%">
        <CarePlanTable
          isCarePlanModalVisible={isCarePlanModalVisible}
          setIsCarePlanModalVisible={setIsCarePlanModalVisible}
        />
      </Stack>
    </Stack>
  );
};

export default CarePlansTab;
