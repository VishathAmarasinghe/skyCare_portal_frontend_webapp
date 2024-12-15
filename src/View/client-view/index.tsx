import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ClientTablePanel from "./panel/clientTablePanel";
import ClientInfoPanel from "./panel/clientInfoPanel";
import { Stack } from "@mui/material";

const ClientView = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const clientID = searchParams.get("clientID");
    setSelectedUser(clientID);
  }, [location, searchParams]);
  return (
    <Stack width="100%" height="100%">
      {location.pathname === "/Clients" ? (
        <ClientTablePanel />
      ) : location.pathname === "/Clients/clientInfo" && selectedUser ? (
        <ClientInfoPanel />
      ) : null}
    </Stack>
  );
};

export default ClientView;
