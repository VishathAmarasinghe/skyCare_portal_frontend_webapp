import React from "react";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import { ChatInfo, updateUnseenMessagesToSeen } from "@slices/chatSlice/chat";
import { FILE_DOWNLOAD_BASE_URL } from "@config/config";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { useDispatch } from "react-redux";

interface ChatListProps {
  chats: ChatInfo[];
  onSelectChat: (chat: ChatInfo) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
  const theme = useTheme();
  const chatSlice = useAppSelector((state) => state?.chat);
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);


  return (
    <List>
      {chats.map((chat) => {
        const chatInitial = chat.chatName?.charAt(0).toUpperCase() || "?";
        const showInitial = !chat.chatIcon || chat.chatIcon.trim() === "";
        return (
          <ListItem
            key={chat.chatID}
            component="button"
            sx={{
              my: 1,
              borderRadius: "10px",
              background: theme?.palette?.primary?.main,
            }}
            onClick={() => {
              onSelectChat(chat);
              dispatch(updateUnseenMessagesToSeen({chatId:chat?.chatID,userId:auth?.userInfo?.userID || ''}))
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={
                  showInitial
                    ? undefined
                    : `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                        chat?.chatIcon
                      )}`
                }
              >
                {showInitial && chatInitial}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              sx={{ color: "white" }}
              primary={
                <Typography fontWeight="bold">{chat.chatName}</Typography>
              }
              secondary={
                <Typography variant="caption" fontSize={12}>
                  {chat.group ? "Group Chat" : ""}
                </Typography>
              }
            />
            {
              (chatSlice?.unSeenMessages?.[chat?.chatID] || 0) > 0 && (
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "100%",
                    backgroundColor: "red",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {chatSlice?.unSeenMessages?.[chat?.chatID]}
                </Box>
              )
            }
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChatList;
