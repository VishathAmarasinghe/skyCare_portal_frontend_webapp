import React from "react";
import { Box, Chip, Stack, Avatar } from "@mui/material";
import { Descriptions } from "antd";
import type { DescriptionsProps } from "antd";
import { useAppSelector } from "../../../../slices/store";
import { capitalize } from "../../../../utils/utils";
import malAvatar from "../../../../assets/images/maleavatar.jpg";
import femaleAvatar from "../../../../assets/images/female.png";
import roboAvatar from "../../../../assets/images/roboavatar.png";

const BasicInfoTab: React.FC = () => {
  const clientInfo = useAppSelector((state) => state.clients);
  const client = clientInfo?.selectedClient;

  const clientDetails: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Client ID",
      children: client?.clientID || "N/A",
    },
    {
      key: "2",
      label: "Reference No",
      children: client?.referenceNo || "N/A",
    },
    {
      key: "3",
      label: "First Name",
      children: capitalize(client?.firstName),
    },
    {
      key: "4",
      label: "Last Name",
      children: capitalize(client?.lastName),
    },
    {
      key: "5",
      label: "Preferred Name",
      children: capitalize(client?.preferredName),
    },
    {
      key: "6",
      label: "Email Address",
      children: client?.email || "N/A",
    },
    {
      key: "7",
      label: "Gender",
      children: capitalize(client?.gender),
    },
    {
      key: "8",
      label: "Client Type",
      children: capitalize(client?.clientType),
    },
    {
      key: "9",
      label: "Client Status",
      children: capitalize(client?.clientStatus),
    },
    {
      key: "10",
      label: "Birth Date",
      children: client?.birthday || "N/A",
    },
    {
      key: "11",
      label: "Phone Numbers",
      children:
        client?.phoneNumbers?.map((no, index) => (
          <Chip key={index} label={no} sx={{ margin: "4px" }} />
        )) || "N/A",
    },
    {
      key: "12",
      label: "Emergency Contact",
      children: `${client?.emergencyUser || "No Person "} - ${client?.emergencyPhoneNo || "No Phone Number"}`,
    },
    {
      key: "13",
      label: "Client Fundings",
      children:
        client?.clientClassifications?.map((classification, index) => (
          <Chip
            key={index}
            label={capitalize(classification)}
            sx={{ margin: "4px" }}
          />
        )) || "N/A",
    },
    {
      key: "14",
      label: "Languages",
      children:
        client?.clientLanguages?.map((language, index) => (
          <Chip
            key={index}
            label={capitalize(language)}
            sx={{ margin: "4px" }}
          />
        )) || "N/A",
    },
    {
      key: "15",
      label: "Status",
      children: (
        <Chip
        size="small"
          label={client?.status || "Unknown"}
          color={client?.status === "Activated" ? "success" : client?.status === "Deactivated" ? "error" : "default"}
        />
      ),
    },
    {
      key: "16",
      label: "Address",
      children: `${client?.physicalAddress?.address}`,
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
              client?.profilePhoto != null && client?.profilePhoto != ""
                ? client?.profilePhoto
                : client?.gender === "Male"
                ? malAvatar
                : client?.gender === "Female"
                ? femaleAvatar
                : roboAvatar
            }
            alt="Customer Image"
          />
        </Box>
      ),
      children: (
        <Descriptions
          bordered
          items={clientDetails}
          column={2}
          size="small"
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

export default BasicInfoTab;
