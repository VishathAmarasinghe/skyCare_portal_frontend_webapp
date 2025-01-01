import { FILE_DOWNLOAD_BASE_URL } from "@config/config";
import { Avatar, Box, Chip, Stack } from "@mui/material";
import { useAppSelector } from "@slices/store";
import { capitalize } from "@utils/utils";
import { Descriptions, DescriptionsProps } from "antd";
import React from "react";

const CareGiverbasicInfo = () => {
  const careGiverInfo = useAppSelector((state) => state.careGivers);
  const careGiver = careGiverInfo?.selectedCareGiver;

  const clientDetails: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Care Giver ID",
      children: careGiver?.careGiverID || "N/A",
    },
    {
      key: "4",
      label: "Employee ID",
      children: capitalize(careGiver?.employee?.employeeID),
    },
    {
      key: "2",
      label: "First Name",
      children: capitalize(careGiver?.employee?.firstName),
    },
    {
      key: "3",
      label: "Last Name",
      children: capitalize(careGiver?.employee?.lastName),
    },

    {
      key: "5",
      label: "Email Address",
      children: careGiver?.employee?.email || "N/A",
    },
    {
      key: "6",
      label: "Job Role",
      children: capitalize(careGiver?.employee?.accessRole),
    },
    {
      key: "7",
      label: "Join Date",
      children: careGiver?.employee?.joinDate,
    },
    {
      key: "11",
      label: "Phone Numbers",
      children:
        careGiver?.employee.employeePhoneNo?.map((no, index) => (
          <Chip key={index} label={no} sx={{ margin: "4px" }} />
        )) || "N/A",
    },
    {
      key: "12",
      label: "Address",
      children: `${careGiver?.employee?.employeeAddresses[0]?.address} ${careGiver?.employee?.employeeAddresses[0]?.postal_code}`,
    },
  ];

  const clientProfilePic: DescriptionsProps["items"] = [
    {
      key: "0",
      label: (
        <Box>
          <Avatar
            variant="square"
            sx={{
              width: "100px",
              height: "100px",
              margin: "auto",
            }}
            src={
              careGiver?.employee?.profile_photo
                ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                    careGiver?.employee?.profile_photo
                  )}`
                : ""
            }
            alt="Care Giver"
          />
        </Box>
      ),
      children: (
        <Descriptions
          bordered
          items={clientDetails}
          column={2}
          size="default"
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  return (
    <Stack width="100%" height="100%" sx={{ padding: "16px" }} spacing={4}>
      <Descriptions
        bordered
        items={clientProfilePic}
        column={1}
        size="default"
        style={{ width: "100%" }}
      />
    </Stack>
  );
};

export default CareGiverbasicInfo;
