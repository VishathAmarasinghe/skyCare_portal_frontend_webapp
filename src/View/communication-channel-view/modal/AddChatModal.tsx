import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  TextField,
  Select,
  MenuItem,
  Chip,
  Grid,
  Box,
  Typography,
  IconButton,
} from "@mui/material";

import { Chat } from "../../../types/types";
import { useAppDispatch, useAppSelector } from "@slices/store";
import {
  ChatInfo,
  ChatMember,
  ChatUserInfo,
  fetchAvailableChatUsers,
  fetchChatMembers,
  saveGroupChat,
  saveIndividualChat,
  updateChat,
} from "@slices/chatSlice/chat";
import { Delete } from "@mui/icons-material";
import { FILE_DOWNLOAD_BASE_URL } from "@config/config";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";

interface AddChatModalProps {
  open: boolean;
  onClose: () => void;
  chatType:"New" | "Edit";
  chat?: ChatInfo | null;
}

const AddChatModal: React.FC<AddChatModalProps> = ({ open, onClose,chatType,chat }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const dispatch = useAppDispatch();
  const authSlice = useAppSelector((state) => state?.auth);
  const chatSlice = useAppSelector((state) => state?.chat);
  const [chatUsers, setChatUsers] = useState<ChatUserInfo[]>([]);
  const [individualChatUsers, setIndividualChatUsers] = useState<ChatMember|null>(null);

  const handleToggleUser = (user: string) => {
    const isSelected = selectedUsers.some((u) => u === user);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  useEffect(()=>{
    if (chatSlice?.chatMembers.length>0) {
      const filteredUsers = chatSlice?.chatMembers?.filter((user)=>user.userID!==authSlice?.userInfo?.userID);
      if (filteredUsers.length===1) {
        setIndividualChatUsers(filteredUsers[0]);
      }
      setSelectedUsers(filteredUsers.map((user)=>user.userID));
    }
  },[chatSlice?.chatMembers,chatSlice?.State])

  const handleRemoveUser = (user: string) => {
    if (chatType==="Edit" && chat && individualChatUsers?.userID===user) {
      return dispatch(enqueueSnackbarMessage({message:"Cannot remove user from individual chats",type:"error"}))
    }
    setSelectedUsers(selectedUsers.filter((u) => u !== user));
  };

  useEffect(()=>{
    if (chatType ==="Edit" && chat) {
      dispatch(fetchChatMembers({chatID:chat?.chatID}));
      setGroupName(chat?.chatName ?? "");
    }
  },[open])

  useEffect(() => {
    if (open) {
      dispatch(
        fetchAvailableChatUsers({ userId: authSlice?.userInfo?.userID ?? null })
      );
    } else {
      setSelectedUsers([]);
      setGroupName("");
    }
  }, [open]);

  useEffect(() => {
    if (chatSlice?.chatUsers.length > 0) {
      setChatUsers(chatSlice?.chatUsers);
    }
  }, [chatSlice?.chatUsers, chatSlice?.State]);

  const handleCreateChat = () => {
    if (selectedUsers.length > 1 && !groupName.trim())
      return dispatch(
        enqueueSnackbarMessage({
          message: "Please enter group name",
          type: "error",
        })
      ); // Prevent empty group names
    
    if (chatType==="Edit" && chat) {
      dispatch(updateChat({chatId:chat?.chatID,chatInfo:{groupName:groupName,userIDs:[...selectedUsers, authSlice?.userInfo?.userID ?? ""]}}));
      setSelectedUsers([]);
      setGroupName("");
      onClose();
      return ;
    }

    if (selectedUsers.length === 1) {
      // Create individual chat
      dispatch(
        saveIndividualChat({
          user1: authSlice?.userInfo?.userID ?? "",
          user2: selectedUsers[0],
        })
      );
    }

    if (selectedUsers.length > 1) {
      // Create group chat
      dispatch(
        saveGroupChat({
          groupName: groupName,
          userIDs: [...selectedUsers, authSlice?.userInfo?.userID ?? ""],
        })
      );
    }
    setSelectedUsers([]);
    setGroupName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Users</DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          displayEmpty
          value={selectedUsers}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedUsers(
              Array.isArray(value) ? value : [...selectedUsers, value]
            );
          }}
          renderValue={(selected) =>
            selected.length === 0 ? "Select User" : selected.join(", ")
          }
        >
          <MenuItem value="" disabled>
            Select User
          </MenuItem>
          {chatUsers
            .filter(
              (user) =>
                !selectedUsers.some((selected) => selected === user.userID)
            ).filter((user) => user.userID !== authSlice?.userInfo?.userID)
            .map((user) => (
              <MenuItem key={user?.userID} value={user?.userID}>
                <Chip
                  label={`${user?.firstName} ${user?.lastName} - ${user?.userRole}`}
                  avatar={
                    <Avatar
                      src={
                        user?.profilePhoto
                          ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                              user?.profilePhoto
                            )}`
                          : ""
                      }
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                  }
                />
              </MenuItem>
            ))}
        </Select>
        {selectedUsers.length > 1 && (
          <TextField
            fullWidth
            label="Group Name"
            variant="outlined"
            margin="dense"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        )}
        <Grid container spacing={2} mt={2}>
          {selectedUsers.map((user) => {
            const selectedUser = chatUsers?.find((usr) => usr?.userID === user);
            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={6}
                key={user} // Ensure each child has a unique key
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  p={1}
                  sx={{ borderRadius: 2, bgcolor: "grey.100" }}
                >
                  <Avatar
                    src={selectedUser?.profilePhoto || ""}
                    sx={{ width: 32, height: 32 }}
                  >
                    {!selectedUser?.profilePhoto &&
                      selectedUser?.firstName?.charAt(0)}
                  </Avatar>
                  <Typography variant="body1" fontWeight="500">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </Typography>
                  {/* Delete Icon */}
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleRemoveUser(user)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => handleCreateChat()}
          variant="contained"
          color="primary"
          disabled={selectedUsers.length === 0}
        >
          {chatType ==="New"?"Create Chat":"Update Chat"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChatModal;
