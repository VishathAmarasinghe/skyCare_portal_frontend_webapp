import {
  createSlice,
  Dispatch,
  isDraft,
  PayloadAction,
} from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { Message, State } from "../../types/types";
import { AppConfig } from "../../config/config";
import { enqueueSnackbarMessage } from "../commonSlice/common";
import { SnackMessage } from "../../config/constant";
import axios, { Axios, HttpStatusCode } from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { AppDispatch, useAppDispatch } from "@slices/store";
import { authSlice } from "@slices/authSlice/auth";
import { log } from "console";
import { io } from "socket.io-client";

// Define a type for the slice state

export interface ChatUserInfo {
  userID: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  userRole: string;
}

export interface ChatMember {
  userID: string;
  userName: string;
  puserProfilePhoto: string;
  userRole: string;
}

export interface GroupChatInfo {
  groupName: string;
  userIDs: string[];
}

export interface ChatInfo {
  chatID: number;
  chatName: string;
  group: boolean;
  chatIcon: string;
}

export interface UnseenMessagesMap {
  [chatId: number]: number;
}

interface ChatState {
  State: State;
  submitState: State;
  updateState: State;
  stateMessage: string | null;
  errorMessage: string | null;
  chatUsers: ChatUserInfo[];
  chatList: ChatInfo[];
  chatMessages: Message[];
  socketMessage: Message | null;
  socketClient: Client | null;
  chatMembers: ChatMember[];
  chatState: State;
  unSeenMessages: UnseenMessagesMap | null;
  chatUploadedDocuments: string[];
  backgroundProcess: boolean;
  backgroundProcessMessage: string | null;
  [key: string]: any; // Index signature
}

// Define the initial state using client State
const initialState: ChatState = {
  State: State.idle,
  submitState: State.idle,
  updateState: State.idle,
  stateMessage: "",
  errorMessage: "",
  chatUsers: [],
  chatList: [],
  chatMessages: [],
  socketMessage: null,
  chatMembers: [],
  chatState: State.idle,
  unSeenMessages: null,
  chatUploadedDocuments: [],
  socketClient: null,
  selectedChat: null,
  backgroundProcess: false,
  backgroundProcessMessage: null,
};

export const fetchMessageSeen = createAsyncThunk(
  "chat/fetchMessageSeen",
  async (payload: { userId:string }, { dispatch, rejectWithValue }) => {
    return new Promise<UnseenMessagesMap>((resolve, reject) => {
      APIService.getInstance()
        .get(
          `${AppConfig.serviceUrls.chat}/seen/${encodeURIComponent(
            payload.userId
          )}`
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchUnseenMessageCount
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);


export const updateUnseenMessagesToSeen = createAsyncThunk(
  "chat/updateUnseenMessagesToSeen",
  async (payload: { userId:string,chatId:number }, { dispatch, rejectWithValue }) => {
    return new Promise<string>((resolve, reject) => {
      APIService.getInstance()
        .put(
          `${AppConfig.serviceUrls.chat}/seen?userId=${payload?.userId}&chatId=${payload?.chatId}`
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchUnseenMessageCount
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

export const fetchChatMembers = createAsyncThunk(
  "chat/fetchChatMembers",
  async (payload: { chatID: number }, { dispatch, rejectWithValue }) => {
    return new Promise<ChatMember[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          `${AppConfig.serviceUrls.chat}/members/${encodeURIComponent(
            payload.chatID
          )}`
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchChatmembers
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);


export const fetchChatMessages = createAsyncThunk(
  "chat/fetchChatMessages",
  async (payload: { chatID: number }, { dispatch, rejectWithValue }) => {
    return new Promise<Message[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          `${AppConfig.serviceUrls.chat}/messages/${encodeURIComponent(
            payload.chatID
          )}`
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchChatMessages
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

export const fetchChatListByUser = createAsyncThunk(
  "chat/fetchChatListByUser",
  async (payload: { user1: string }, { dispatch, rejectWithValue }) => {
    return new Promise<ChatInfo[]>((resolve, reject) => {
      APIService.getInstance()
        .get(
          `${AppConfig.serviceUrls.chat}/${encodeURIComponent(payload.user1)}`
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchChatList
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

export const saveIndividualChat = createAsyncThunk(
  "chat/saveIndividualChat",
  async (
    payload: { user1: string; user2: string },
    { dispatch, rejectWithValue }
  ) => {
    console.log("user1", payload.user1);
    console.log("user2", payload.user2);

    return new Promise<string>((resolve, reject) => {
      APIService.getInstance()
        .post(
          `${AppConfig.serviceUrls.chat}/private?user1=${encodeURIComponent(
            payload.user1
          )}&user2=${encodeURIComponent(payload.user2)}`
        )
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: response.data,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.chatCreated
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);


export const updateChat = createAsyncThunk(
  "chat/updateChat",
  async (payload: {chatInfo:GroupChatInfo,chatId:number}, { dispatch, rejectWithValue }) => {
    return new Promise<string>((resolve, reject) => {
      APIService.getInstance()
        .put(AppConfig.serviceUrls.chat + `/${payload.chatId}`, payload.chatInfo)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.updateChat,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.updateChat
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch advisories
export const saveGroupChat = createAsyncThunk(
  "chat/saveGroupChat",
  async (payload: GroupChatInfo, { dispatch, rejectWithValue }) => {
    return new Promise<string>((resolve, reject) => {
      APIService.getInstance()
        .post(AppConfig.serviceUrls.chat + `/group`, payload)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.groupChatCreated,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.groupChatCreate
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// Save a caregiver
export const saveChatDocuments = createAsyncThunk(
  "chat/saveDocuments",
  async (
    payload: {
      uploadFiles: File[];
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      payload.uploadFiles.forEach((file) => {
        formData.append("documents", file);
      });
      const response = await APIService.getInstance().post(
        AppConfig.serviceUrls.chat + "/documents",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue("Request canceled");
      }
      dispatch(
        enqueueSnackbarMessage({
          message:
            error.response?.status === HttpStatusCode.InternalServerError
              ? SnackMessage.error.saveChatDocuments
              : String(error.response?.data),
          type: "error",
        })
      );
      throw error.response?.data;
    }
  }
);

export const deleteMessage = createAsyncThunk(
  "client/deleteMessage",
  async (
    payload: { messageID: string | null },
    { dispatch, rejectWithValue }
  ) => {
    return new Promise<string>((resolve, reject) => {
      APIService.getInstance()
        .delete(AppConfig.serviceUrls.chat + `?messageID=${payload.messageID}`)
        .then((response) => {
          dispatch(
            enqueueSnackbarMessage({
              message: SnackMessage.success.deleteChatMessage,
              type: "success",
            })
          );
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.deleteChatMessage
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);

// fetch advisories
export const fetchAvailableChatUsers = createAsyncThunk(
  "client/fetchAvailableChatUsers",
  async (payload: { userId: string | null }, { dispatch, rejectWithValue }) => {
    return new Promise<ChatUserInfo[]>((resolve, reject) => {
      APIService.getInstance()
        .get(AppConfig.serviceUrls.chat + `/accessibleUsers/${payload.userId}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return rejectWithValue("Request canceled");
          }
          dispatch(
            enqueueSnackbarMessage({
              message:
                error.response?.status === HttpStatusCode.InternalServerError
                  ? SnackMessage.error.fetchChatUsers
                  : String(error.response?.data),
              type: "error",
            })
          );
          reject(error.response?.data);
        });
    });
  }
);
const subscriptions: Record<string, any> = {};

export const openMessagingSocket =
  (authUserID: string, chatList: number[]) => (dispatch: AppDispatch) => {
    const socket = new SockJS(`${AppConfig.webSocketUrl}`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Reconnect if disconnected
      onConnect: () => {
        console.log("Connected to WebSocket");
        stompClient.publish({
          destination: "/app/join",
          body: authUserID,
        });

        chatList.forEach((element) => {
          const destination = `/topic/chat-${element}`;

          // Check if already subscribed
          if (subscriptions[destination]) {
            console.log(`Already subscribed to ${destination}`);
          } else {
            subscriptions[destination] = stompClient.subscribe(
              destination,
              (msg) => {
                const newMessage: Message = JSON.parse(msg.body);
                console.log("Message received:", newMessage);
                if (authUserID) {
                  dispatch(fetchMessageSeen({ userId: authUserID }));
                }
                dispatch(receiveSocketMessage(newMessage));
              }
            );
          }
        });

        dispatch(setSocketClient(stompClient));
      },
      onStompError: (err) => {
        console.error("STOMP Error:", err);
      },
    });
    stompClient.activate();
    console.log("🔄 Activating WebSocket...");
  };

export const handleIncommingMessages = (
  dispatch: Dispatch,
  message: string
) => {
  dispatch(enqueueSnackbarMessage({ message: message, type: "success" }));
};

// Define a type for the slice state
const ChatSlice = createSlice({
  name: "Chat",
  initialState,
  reducers: {
    resetSubmitSate(state) {
      state.submitState = State.idle;
    },
    resetSelectedChat(state) {
      state.selectedClient = null;
    },
    resetSelectedChatMessages(state) {
      state.chatMessages = [];
    },
    receiveSocketMessage(state, action: PayloadAction<Message>) {
      state.socketMessage = action.payload;
    },
    setSocketClient(state, action: PayloadAction<Client>) {
      console.log("socket client", action.payload);

      state.socketClient = action.payload;
    },
    resetUploadedDocuments(state) {
      state.chatUploadedDocuments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableChatUsers.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching Chat users...";
      })
      .addCase(fetchAvailableChatUsers.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched chat users!";
        state.chatUsers = action.payload;
      })
      .addCase(fetchAvailableChatUsers.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch chat users!";
      })
      .addCase(fetchChatListByUser.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching Chat List...";
      })
      .addCase(fetchChatListByUser.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched chat list!";
        state.chatList = action.payload;
      })
      .addCase(fetchChatListByUser.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch chat list!";
      })
      .addCase(saveIndividualChat.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Creating Chat...";
      })
      .addCase(saveIndividualChat.fulfilled, (state) => {
        state.submitState = State.success;
        state.stateMessage = "Chat created successfully!";
      })
      .addCase(saveIndividualChat.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to create chat!";
      })
      .addCase(saveGroupChat.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Creating Group Chat...";
      })
      .addCase(saveGroupChat.fulfilled, (state) => {
        state.submitState = State.success;
        state.stateMessage = "Group Chat created successfully!";
      })
      .addCase(saveGroupChat.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to create group chat!";
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "Fetching Chat Messages...";
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.State = State.success;
        state.stateMessage = "Successfully fetched chat messages!";
        state.chatMessages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch chat messages!";
      })
      .addCase(saveChatDocuments.pending, (state) => {
        state.submitState = State.loading;
        state.stateMessage = "Uploading Documents...";
      })
      .addCase(saveChatDocuments.fulfilled, (state, action) => {
        state.submitState = State.success;
        state.stateMessage = "Documents uploaded successfully!";
        state.chatUploadedDocuments = action.payload;
      })
      .addCase(saveChatDocuments.rejected, (state) => {
        state.submitState = State.failed;
        state.stateMessage = "Failed to upload documents!";
      })
      .addCase(deleteMessage.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "Deleting Message...";
      })
      .addCase(deleteMessage.fulfilled, (state) => {
        state.updateState = State.success;
        state.stateMessage = "Message deleted successfully!";
      })
      .addCase(deleteMessage.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to delete message!";
      })
      .addCase(fetchChatMembers.pending, (state) => {
        state.State = State.loading;
        state.stateMessage = "fetching Chat Members...";
      })
      .addCase(fetchChatMembers.fulfilled, (state,action) => {
        state.State = State.success;
        state.stateMessage = "chat Members fetched successfully!";
        state.chatMembers = action.payload;
      })
      .addCase(fetchChatMembers.rejected, (state) => {
        state.State = State.failed;
        state.stateMessage = "Failed to fetch chat Members!";
      })
      .addCase(updateChat.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating Chat...";
      })
      .addCase(updateChat.fulfilled, (state,action) => {
        state.updateState = State.success;
        state.stateMessage = "update Chat successfully!";
      })
      .addCase(updateChat.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update chat!";
      }) 
      .addCase(fetchMessageSeen.pending, (state) => {
        state.chatState = State.loading;
        state.stateMessage = "fetching Unseen messgae count";
      })
      .addCase(fetchMessageSeen.fulfilled, (state,action) => {
        state.chatState = State.success;
        state.stateMessage = "successfully fetched unseen message count";
        state.unSeenMessages = action.payload;
      })
      .addCase(fetchMessageSeen.rejected, (state) => {
        state.chatState = State.failed;
        state.stateMessage = "Failed to fetch unseen message count";
      })
      .addCase(updateUnseenMessagesToSeen.pending, (state) => {
        state.updateState = State.loading;
        state.stateMessage = "updating unseen messgae count";
      })
      .addCase(updateUnseenMessagesToSeen.fulfilled, (state,action) => {
        state.updateState = State.success;
        state.stateMessage = "successfully updated unseen message count";
      })
      .addCase(updateUnseenMessagesToSeen.rejected, (state) => {
        state.updateState = State.failed;
        state.stateMessage = "Failed to update unseen message count";
      })
  },
});

export const {
  resetSubmitSate,
  resetUploadedDocuments,
  resetSelectedChat,
  resetSelectedChatMessages,
  setSocketClient,
  receiveSocketMessage,
} = ChatSlice.actions;
export default ChatSlice.reducer;
