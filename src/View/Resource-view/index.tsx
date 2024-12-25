import { Button, Stack, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ResourceTable from "./components/ResourceTable";
import ResourceCreationModal from "./modal/ResourceCreationModal";
import { fetchAllResources } from "@slices/resourceSlice/resource";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { State } from "../../types/types";
import { APPLICATION_ADMIN, APPLICATION_SUPER_ADMIN } from "@config/config";

const ResourceView = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const resourceSlice = useAppSelector((state) => state.resource);
  const [isResourceModalVisible, setIsResourceModalVisible] =
    useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const authUser = useAppSelector((state) => state?.auth?.roles);

  useEffect(() => {
    if (resourceSlice?.selectedResource) {
      setIsResourceModalVisible(true);
    }
  }, [resourceSlice?.selectedResource]);

  useEffect(() => {
    if (
      resourceSlice?.submitState === State?.success ||
      resourceSlice?.updateState === State?.success
    ) {
      setIsResourceModalVisible(false);
      setIsEditMode(false);
    }
  }, [resourceSlice?.submitState, resourceSlice?.updateState]);

  useEffect(() => {
    dispatch(fetchAllResources());
  }, [
    resourceSlice?.submitState,
    resourceSlice?.updateState,
    resourceSlice?.deleteState,
  ]);
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
      <Stack
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <ResourceCreationModal
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          isResourceModalVisible={isResourceModalVisible}
          setIsResourceModalVisible={setIsResourceModalVisible}
        />
        <Typography
          color={theme.palette.primary.main}
          fontWeight="600"
          variant="h6"
        >
          Resources
        </Typography>
        {authUser?.includes(APPLICATION_ADMIN) ||
        authUser?.includes(APPLICATION_SUPER_ADMIN) ? (
          <Button
            variant="contained"
            onClick={() => {
              setIsResourceModalVisible(true), setIsEditMode(true);
            }}
          >
            Add Resource
          </Button>
        ) : (
          <></>
        )}
      </Stack>
      <Stack width="100%" height="480px">
        <ResourceTable />
      </Stack>
    </Stack>
  );
};

export default ResourceView;
