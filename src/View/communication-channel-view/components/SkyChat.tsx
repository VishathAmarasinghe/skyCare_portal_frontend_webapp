import React, { useEffect, useState } from "react";
import { Stack, Typography, useTheme, useMediaQuery, TextField, IconButton, Avatar } from "@mui/material";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { Chat, Message } from "../../../types/types";
import AddChatModal from "../modal/AddChatModal";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "@slices/store";
import { ChatInfo, fetchChatListByUser, fetchMessageSeen, resetSelectedChatMessages } from "@slices/chatSlice/chat";


const SkyChat: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const chatSlice = useAppSelector((state)=>state?.chat);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const dispatch= useAppDispatch();
  const authSlice = useAppSelector((state)=>state?.auth);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(()=>{
    if (authSlice?.userInfo?.userID) {
      dispatch(fetchChatListByUser({ user1: authSlice.userInfo.userID }));
      dispatch(fetchMessageSeen({ userId: authSlice.userInfo.userID }));
    }
  },[chatSlice?.submitState,chatSlice?.updateState])

  useEffect(()=>{
    if (chatSlice?.chatList.length>0) {
      setChats(chatSlice.chatList);
    }
  },[chatSlice?.State,chatSlice?.chatList])

  const handleSelectChat = (chat:ChatInfo) => {
    if (chat.chatID!=selectedChat?.chatID) {
      dispatch(resetSelectedChatMessages())
    }
    setSelectedChat(chat);
  };

  // Handle Search
  const filteredChats = chats.filter(chat =>
    chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <Stack
      width="100%"
      height={"100%"}
      sx={{ backgroundColor: theme.palette.background.default,borderRadius:"10px" }}
    >
      <Stack flexDirection="row" width="100%" height="100%" borderRadius="10px">
        <AddChatModal
        open={isModalOpen}
        chatType="New"
        chat={null}
        onClose={() => setIsModalOpen(false)}
        />
        {(!isMobile || !selectedChat) && (
          <Stack 
            width={isMobile ? "100%" : "30%"} 
            borderRight={isMobile ? 0 : "1px solid #ccc"} 
            p={2}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1 }} />
                }}
              />
              <IconButton color="primary" onClick={() => setIsModalOpen(true)}>
                <AddIcon />
              </IconButton>
            </Stack>
            <ChatList chats={filteredChats} onSelectChat={handleSelectChat} />
          </Stack>
        )}

        {(!isMobile || selectedChat) && selectedChat && (
          <Stack width={isMobile ? "100%" : "70%"} p={2}>
            <ChatWindow messages={messages} setMessages={setMessages} selectedChat={selectedChat} />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default SkyChat;
