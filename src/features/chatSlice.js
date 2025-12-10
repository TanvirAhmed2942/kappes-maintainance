// features/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper function to get initial state from localStorage
const getInitialChatState = () => {
  if (typeof window !== "undefined") {
    try {
      const savedChatState = localStorage.getItem("chatState");
      if (savedChatState) {
        const parsed = JSON.parse(savedChatState);
        return {
          ...parsed,
          // Always start with chat closed and not typing on page load
          isChatOpen: false,
          isTyping: false,
        };
      }
    } catch (error) {
      console.error("Error loading chat state from localStorage:", error);
    }
  }

  return {
    isChatOpen: false,
    isMinimized: false,
    messages: [],
    unreadCount: 0,
    currentSeller: null,
    isTyping: false,
    isPinned: false,
  };
};

const initialState = getInitialChatState();

// Helper function to save state to localStorage
const saveChatState = (state) => {
  if (typeof window !== "undefined") {
    try {
      // Only save persistent data (exclude temporary states)
      const persistentState = {
        messages: state.messages,
        unreadCount: state.unreadCount,
        currentSeller: state.currentSeller,
        isPinned: state.isPinned,
        isMinimized: state.isMinimized,
      };
      localStorage.setItem("chatState", JSON.stringify(persistentState));
    } catch (error) {
      console.error("Error saving chat state to localStorage:", error);
    }
  }
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChat: (state, action) => {
      const sellerInfo = action.payload;
      state.currentSeller = sellerInfo;
      state.isChatOpen = true;
      state.isMinimized = false;
      state.isPinned = true;

      // Only initialize with welcome message if no messages exist for this specific chat
      const hasMessagesForThisChat = state.messages.some(
        (msg) =>
          msg.sellerId === sellerInfo.id || msg.chatId === sellerInfo.chatId
      );

      if (!hasMessagesForThisChat) {
        const welcomeMessage = {
          id: Date.now(),
          text: `Hello! I'm here to help you with any questions about our products. How can I assist you today?`,
          sender: "seller",
          sellerId: sellerInfo.id,
          chatId: sellerInfo.chatId || sellerInfo.id,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: false,
        };
        state.messages.push(welcomeMessage);
        state.unreadCount = 1;
      }

      // Mark all messages as read when opening chat
      state.messages.forEach((msg) => {
        if (!msg.isRead) {
          msg.isRead = true;
        }
      });
      state.unreadCount = 0;

      // Save state to localStorage
      saveChatState(state);
    },

    closeChat: (state) => {
      state.isChatOpen = false;
      state.unreadCount = 0;
      // Save state to localStorage
      saveChatState(state);
    },

    minimizeChat: (state) => {
      state.isMinimized = true;
      // Save state to localStorage
      saveChatState(state);
    },

    maximizeChat: (state) => {
      state.isMinimized = false;
      // Mark messages as read when maximizing
      state.messages.forEach((msg) => {
        if (!msg.isRead) {
          msg.isRead = true;
        }
      });
      state.unreadCount = 0;
      // Save state to localStorage
      saveChatState(state);
    },

    pinChat: (state, action) => {
      state.isPinned = action.payload;
      // Save state to localStorage
      saveChatState(state);
    },

    sendMessage: (state, action) => {
      const messageText = action.payload;
      const userMessage = {
        id: Date.now(),
        text: messageText,
        sender: "user",
        chatId: state.currentSeller?.chatId || state.currentSeller?.id,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: true,
      };
      state.messages.push(userMessage);
      // Save state to localStorage
      saveChatState(state);
    },

    receiveMessage: (state, action) => {
      const { text, sellerId, chatId } = action.payload;
      const sellerMessage = {
        id: Date.now(),
        text,
        sender: "seller",
        sellerId,
        chatId: chatId || sellerId,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: state.isChatOpen && !state.isMinimized,
      };

      state.messages.push(sellerMessage);

      // Only increment unread count if chat is closed or minimized
      if (!state.isChatOpen || state.isMinimized) {
        state.unreadCount += 1;
      }

      // Save state to localStorage
      saveChatState(state);
    },

    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },

    clearChat: (state) => {
      state.messages = [];
      state.unreadCount = 0;
      state.currentSeller = null;
      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("chatState");
      }
    },

    markAllAsRead: (state) => {
      state.messages.forEach((msg) => {
        msg.isRead = true;
      });
      state.unreadCount = 0;
      // Save state to localStorage
      saveChatState(state);
    },
  },
});

export const {
  openChat,
  closeChat,
  minimizeChat,
  maximizeChat,
  sendMessage,
  receiveMessage,
  setTyping,
  clearChat,
  markAllAsRead,
  pinChat,
} = chatSlice.actions;

export default chatSlice.reducer;
