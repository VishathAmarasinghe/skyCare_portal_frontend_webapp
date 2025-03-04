import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  IconButton,
  Avatar,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ConfirmationType, Message, State } from "../../../types/types";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch, useAppSelector } from "@slices/store";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import SettingsIcon from '@mui/icons-material/Settings';
import {
  ChatInfo,
  deleteMessage,
  fetchChatMessages,
  resetUploadedDocuments,
  updateUnseenMessagesToSeen,
} from "@slices/chatSlice/chat";
import { grey } from "@mui/material/colors";
import dayjs from "dayjs";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import ChatDocumentUploadModal from "../modal/ChatDocumentUploadModal";
import FileViewerWithModal from "@component/common/FileViewerWithModal";
import { FILE_DOWNLOAD_BASE_URL } from "@config/config";
import { useConfirmationModalContext } from "@context/DialogContext";
import AddChatModal from "../modal/AddChatModal";

interface ChatWindowProps {
  selectedChat: ChatInfo | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedChat,
  setMessages,
  messages,
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authSlice = useAppSelector((state) => state?.auth);
  const chatSlice = useAppSelector((state) => state?.chat);
  const [selectedFileOpen, setSelectedFileOpen] = useState<boolean>(false);
  const [openChatUpdateModal, setOpenChatUpdateModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState("");
  const dispatch = useAppDispatch();
  const { showConfirmation } = useConfirmationModalContext();
  const theme = useTheme();
  const [selectedMessageID, setSelectedMessageID] = useState<number | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openChatUploadModal, setOpenChatUploadModal] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      chatSlice?.socketMessage &&
      chatSlice?.socketMessage?.chatID === selectedChat?.chatID
    ) {
      setMessages((prevMessages: Message[]) => {
        // Check if the new message already exists in the current messages
        const isDuplicate = prevMessages.some(
          (msg) => msg.messageID === chatSlice.socketMessage?.messageID
        );

        if (!isDuplicate) {
          const updatedMessages: Message[] = [
            ...prevMessages,
            chatSlice.socketMessage!,
          ];
          return updatedMessages.sort(
            (a, b) =>
              new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
          );
        }

        return prevMessages; // Return previous messages if duplicate is found
      });
    }
  }, [chatSlice?.socketMessage, selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchChatMessages({ chatID: selectedChat.chatID }));
    }
  }, [selectedChat, chatSlice?.updateState]);

  useEffect(() => {
    if (chatSlice?.chatMessages?.length > 0) {
      const sortedMessages = [...chatSlice.chatMessages].sort((a, b) => {
        const timestampA = new Date(a.timeStamp); // Convert to Date object if TimeStamp is a string
        const timestampB = new Date(b.timeStamp);
        return timestampA.getTime() - timestampB.getTime(); // Compare timestamps
      });

      setMessages(sortedMessages);
    } else {
      setMessages([]);
    }
  }, [chatSlice?.State, chatSlice?.chatMessages]);

  useEffect(() => {
    // Scroll to bottom whenever messages are updated
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (
      chatSlice.submitState === State?.success &&
      chatSlice?.chatUploadedDocuments.length > 0
    ) {
      if (selectedChat?.chatID) {
        dispatch(updateUnseenMessagesToSeen({ chatId: selectedChat.chatID, userId: authSlice?.userInfo?.userID || '' }));
      }
      chatSlice?.chatUploadedDocuments.forEach((element) => {
        if (chatSlice?.socketClient) {
          chatSlice.socketClient.publish({
            destination: `/app/send-chat/${selectedChat?.chatID}`,
            body: JSON.stringify({
              chatID: selectedChat?.chatID,
              senderID: authSlice?.userInfo?.userID,
              content: `File:${element}`,
            }),
          });
        }
      });
      dispatch(resetUploadedDocuments());
    }
    setOpenChatUploadModal(false);
  }, [chatSlice?.submitState]);

  const handleSend = () => {
    if (selectedChat?.chatID) {
      dispatch(updateUnseenMessagesToSeen({ chatId: selectedChat.chatID, userId: authSlice?.userInfo?.userID || '' }));
    }

    if (message.trim().length > 0 && chatSlice?.socketClient) {
      chatSlice?.socketClient.publish({
        destination: `/app/send-chat/${selectedChat?.chatID}`,
        body: JSON.stringify({
          chatID: selectedChat?.chatID,
          senderID: authSlice?.userInfo?.userID,
          content: `TEXT:${message}`,
        }),
      });
      setMessage("");
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    messageID: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageID(messageID);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageID(null);
  };

  const handleDeleteMessage = () => {
    if (selectedMessageID) {
      showConfirmation(
        "Delete Chat Message",
        "Are you sure you want to delete(from everyone) this message? This action cannot be undone.",
        "accept" as ConfirmationType,
        () =>
          dispatch(deleteMessage({ messageID: selectedMessageID.toString() })),
        "Delete",
        "Cancel"
      );
      handleMenuClose();
    }
  };

  return (
    <Stack width="100%" height="100%" flexDirection="column">
      <Stack
        direction="row"
        height={"9%"}
        alignItems="center"
        justifyContent={"space-between"}
        spacing={2}
        p={2}
        sx={{
          borderBottom: "1px solid #ccc",
          backgroundColor: "#57ABCF",
          borderRadius: "10px",
        }}
      >
        <Stack direction="row" alignItems="center">
        <Avatar
                      alt={selectedChat?.chatName}
                      src={
                        selectedChat?.chatIcon
                          ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                              selectedChat?.chatIcon
                            )}`
                          : undefined
                      }
                      sx={{
                        width: 30,
                        mx: 1,
                        height: 30,
                        bgcolor: selectedChat?.chatIcon
                          ? undefined
                          : "primary.main",
                      }}
                    >
                      {/* If no image, display first letter of sender's name */}
                      {!selectedChat?.chatName &&
                        selectedChat?.chatName.charAt(0).toUpperCase()}
                    </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {selectedChat?.chatName}
        </Typography>
        </Stack>
          <IconButton onClick={() => setOpenChatUpdateModal(true)}>
          <SettingsIcon/>
          </IconButton>
      </Stack>
      <Stack p={2} height={"91%"}>
        <ChatDocumentUploadModal
          onClose={() => setOpenChatUploadModal(false)}
          visible={openChatUploadModal}
        />
        <AddChatModal
        open={openChatUpdateModal}
        chatType="Edit"
        chat={selectedChat}
        onClose={() => setOpenChatUpdateModal(false)}
        />
        <FileViewerWithModal
          file={selectedFile}
          isVisible={selectedFileOpen}
          onClose={() => {
            setSelectedFileOpen(false);
            setSelectedFile("");
          }}
        />
        <Box
          flexGrow={1}
          overflow="auto"
          sx={{
            maxHeight: "calc(100vh - 120px)", // Adjust based on the message input section height
          }}
        >
          {messages.map((msg, index) => {
            const isSender = msg.senderID === authSlice?.userInfo?.userID;
            let prevMessage = messages[index];
            if (index > 0) {
              prevMessage = messages[index - 1];
            }
            const currentMessageDate = dayjs(msg.timeStamp).format(
              "YYYY-MM-DD"
            );
            const prevMessageDate = prevMessage
              ? dayjs(prevMessage.timeStamp).format("YYYY-MM-DD")
              : "";

            return (
              <Stack my={1} key={msg.messageID}>
                {/* Show date if different from previous message */}
                {currentMessageDate !== prevMessageDate || index == 0 ? (
                  <Typography
                    variant="body2"
                    align="center"
                    color="grey.600"
                    fontWeight="bold"
                    my={2}
                    sx={{ textTransform: "uppercase" }}
                  >
                    {dayjs(currentMessageDate).format("YYYY-MM-DD")}
                  </Typography>
                ) : null}

                <Stack
                  direction={"row"}
                  justifyContent={isSender ? "flex-end" : "flex-start"}
                  spacing={1}
                >
                  {/* Avatar */}

                  <Stack flexDirection={isSender ? "row-reverse" : "row"}>
                    <Avatar
                      alt={msg.senderName}
                      src={
                        msg.senderProfilePic
                          ? `${FILE_DOWNLOAD_BASE_URL}${encodeURIComponent(
                              msg.senderProfilePic
                            )}`
                          : undefined
                      }
                      sx={{
                        width: 30,
                        mx: 1,
                        height: 30,
                        bgcolor: msg.senderProfilePic
                          ? undefined
                          : "primary.main",
                      }}
                    >
                      {/* If no image, display first letter of sender's name */}
                      {!msg.senderName &&
                        msg.senderName.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Sender Name */}
                    <Stack
                      direction="column"
                      alignItems={isSender ? "flex-end" : "flex-start"}
                      spacing={0.5}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={isSender ? "primary" : "text.secondary"}
                      >
                        {authSlice?.userInfo?.userID===msg?.senderID?"":msg.senderName}
                      </Typography>

                      {/* Message Content */}
                      {msg?.content?.includes("File:") ? (
                        <IconButton
                          onClick={() => {
                            setSelectedFile(msg?.content?.split(":")[1]);
                            setSelectedFileOpen(true);
                          }}
                        >
                          <FileCopyOutlinedIcon
                            style={{ fontSize: "50px" }}
                            fontSize="large"
                          />
                        </IconButton>
                      ) : (
                        <Typography
                          key={msg.messageID}
                          bgcolor={isSender ? "primary.light" : "grey.200"}
                          color={isSender ? "white" : "black"}
                          p={1}
                          borderRadius={2}
                          // maxWidth="70%"
                          alignSelf={isSender ? "flex-end" : "flex-start"}
                        >
                          {msg.content?.substring(5)}
                        </Typography>
                      )}

                      <Stack flexDirection={"row"} alignItems={"center"}>
                        {/* Message Timestamp */}
                        <Typography
                          variant="body2"
                          color={grey[500]} // Adjust color if you prefer
                          fontSize="0.75rem"
                          align={isSender ? "right" : "left"}
                        >
                          {dayjs(msg.timeStamp).format("hh:mm A")}
                        </Typography>

                        {msg.senderID === authSlice?.userInfo?.userID && (
                          <IconButton
                            aria-controls="simple-menu"
                            aria-haspopup="true"
                            onClick={(event) =>
                              handleMenuClick(event, msg.messageID)
                            }
                            size="small"
                          >
                            <MoreVertOutlinedIcon />
                          </IconButton>
                        )}

                        <Menu
                          // id="simple-menu"
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={handleDeleteMessage}>
                            Delete
                          </MenuItem>
                        </Menu>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message input section */}
        <Stack
          flexDirection="row"
          alignItems="center"
          spacing={1}
          sx={{
            position: "sticky",
            bottom: 0,
            borderRadius: "10px",
            backgroundColor: "white", // Optional: Make the background white for contrast
            padding: 1,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <IconButton
            color="primary"
            onClick={() => setOpenChatUploadModal(true)}
          >
            <UploadFileIcon style={{ fontSize: "30px" }} />
          </IconButton>
          <IconButton color="primary" onClick={handleSend}>
            <SendIcon style={{ fontSize: "25px" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ChatWindow;
