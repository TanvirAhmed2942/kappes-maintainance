"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MoreVertical, Send, Image, Smile, Minimize2, X } from "lucide-react";
import {
  sendMessage,
  closeChat,
  minimizeChat,
  markAllAsRead,
} from "../../features/chatSlice";
import {
  useCreateMessageMutation,
  useGetMessagesQuery,
} from "../../redux/chatApi/chatApi";
import useToast from "../../hooks/useShowToast";
import useAuth from "../../hooks/useAuth";
import { getImageUrl } from "../../redux/baseUrl";
import useSocket from "../../hooks/useSocket";
import { api } from "../../redux/baseApi";

const ChatBox = ({ selectedChat }) => {
  const dispatch = useDispatch();
  const { isTyping, isChatOpen, isMinimized, unreadCount } = useSelector(
    (state) => state.chat
  );
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { userId } = useAuth();

  // Memoize chatId to avoid unnecessary recalculations
  const chatId = useMemo(
    () => selectedChat?.chatId || selectedChat?.id,
    [selectedChat]
  );

  // Fetch messages from API
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch,
  } = useGetMessagesQuery(chatId, {
    skip: !chatId, // Skip query if no chatId
  });

  const [createMessage, { isLoading: isSendingMessage }] =
    useCreateMessageMutation();
  const toast = useToast();
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added - memoized
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle real-time message from socket
  const handleSocketMessage = useCallback(
    (socketMessage) => {
      // Verify the message is for the current chat
      if (socketMessage.chatId !== chatId) {
        return;
      }

      // Update RTK Query cache with the new message
      dispatch(
        api.util.updateQueryData("getMessages", chatId, (draft) => {
          // Check if message already exists (avoid duplicates)
          const messageExists = draft?.data?.messages?.some(
            (msg) => msg._id === socketMessage._id
          );

          if (!messageExists) {
            // Add new message to the messages array
            if (draft?.data?.messages) {
              draft.data.messages.push(socketMessage);
            } else if (draft?.data) {
              draft.data.messages = [socketMessage];
            } else {
              draft.data = { messages: [socketMessage] };
            }
          }
        })
      );

      // Also invalidate chat list to update last message
      dispatch(api.util.invalidateTags(["ChatList"]));

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    [chatId, dispatch, scrollToBottom]
  );

  // Set up socket listener for real-time messages - memoized
  const socketEventName = useMemo(
    () => (chatId ? `getMessage::${chatId}` : null),
    [chatId]
  );

  // Log socket event name for debugging
  useEffect(() => {
    if (chatId) {
      console.log("Socket listening for chatId:", chatId);
      console.log("Socket event name:", socketEventName);
    }
  }, [chatId, socketEventName]);

  useSocket(socketEventName, handleSocketMessage);

  // Transform API messages to UI format
  const messages = useMemo(() => {
    if (!messagesData?.data?.messages || !userId) {
      return [];
    }

    // Ensure messages are shown chronologically (oldest at the top, newest at the bottom)
    const sortedMessages = [...messagesData.data.messages].sort((a, b) => {
      const timeA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : a.updatedAt
        ? new Date(a.updatedAt).getTime()
        : 0;
      const timeB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : b.updatedAt
        ? new Date(b.updatedAt).getTime()
        : 0;
      return timeA - timeB;
    });

    return sortedMessages.map((msg) => {
      // Determine if message is from current user
      // Check multiple possible structures for sender ID
      let senderId = null;

      // API returns sender as a string ID directly
      if (typeof msg.sender === "string") {
        senderId = msg.sender;
      } else if (msg.sender?.participantId) {
        // If sender is an object with participantId
        senderId =
          typeof msg.sender.participantId === "object"
            ? msg.sender.participantId._id
            : msg.sender.participantId;
      } else if (msg.senderId) {
        // Direct senderId field
        senderId = msg.senderId;
      } else if (msg.sender?._id) {
        // Sender object with _id
        senderId = msg.sender._id;
      }

      // Compare userId (convert both to strings for reliable comparison)
      // If senderId matches userId, it's from the current user
      const isFromUser = senderId && String(senderId) === String(userId);

      // Get image URL if exists
      const getImageUrlFull = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith("http")) return imagePath;
        return `${getImageUrl}${
          imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
        }`;
      };

      return {
        id: msg._id,
        text: msg.text || msg.content || "",
        sender: isFromUser ? "user" : "seller",
        timestamp: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        isRead: msg.isRead || false,
        images: msg.image ? [getImageUrlFull(msg.image)] : null,
      };
    });
  }, [messagesData, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Mark messages as read when chat is visible and not minimized
    if (isChatOpen && !isMinimized && unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  }, [isChatOpen, isMinimized, unreadCount, dispatch]);

  const handleSendMessage = useCallback(async () => {
    if ((inputMessage.trim() === "" && !selectedImage) || !selectedChat) return;

    try {
      // Create FormData
      const formData = new FormData();

      // Add data as JSON string
      const messageData = {
        chatId: selectedChat.chatId || selectedChat.id,
        text: inputMessage.trim() || "",
      };
      formData.append("data", JSON.stringify(messageData));

      // Add image if selected
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Send message via API
      const response = await createMessage(formData).unwrap();

      if (response?.success) {
        // Clear input and image
        setInputMessage("");
        setSelectedImage(null);
        setImagePreview(null);

        // Messages will automatically refetch due to cache invalidation
        // Optionally show success toast
        // toast.showSuccess("Message sent successfully");
      } else {
        toast.showError(response?.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Failed to send message. Please try again.";
      toast.showError(errorMessage);
    }
  }, [inputMessage, selectedImage, selectedChat, createMessage, toast]);

  const handleImageSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.showError("Please select an image file");
          return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.showError("Image size should be less than 5MB");
          return;
        }

        setSelectedImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [toast]
  );

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleCloseChat = useCallback(() => {
    dispatch(closeChat());
  }, [dispatch]);

  const handleMinimizeChat = useCallback(() => {
    dispatch(minimizeChat());
  }, [dispatch]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center">
          <div className="relative flex-shrink-0">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="h-10 w-10 rounded-full mr-3"
            />
            {selectedChat.isOnline && (
              <span className="absolute bottom-0 right-2 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <div>
            <h3 className="font-medium">{selectedChat.name}</h3>
            <p className="text-xs text-gray-500">
              {isTyping ? (
                <span className="text-blue-500">Typing...</span>
              ) : selectedChat.isOnline ? (
                "Online"
              ) : (
                `Last seen ${selectedChat.lastSeen}`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={messagesContainerRef}>
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[75%]">
                    {msg.sender !== "user" && (
                      <div className="flex items-center mb-1 space-x-2">
                        <img
                          src={selectedChat.avatar}
                          alt={selectedChat.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-xs text-gray-500">
                          {msg.timestamp}
                        </span>
                      </div>
                    )}

                    <div className="relative group">
                      <div
                        className={`p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-red-700 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Images (if any) */}
                        {msg.images && msg.images.length > 0 && (
                          <div className="mt-2 flex space-x-2">
                            {msg.images.map((img, i) => (
                              <div
                                key={i}
                                className="rounded-lg overflow-hidden"
                              >
                                <img
                                  src={img}
                                  alt={`Attachment ${i + 1}`}
                                  className="h-20 w-auto object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {msg.sender === "user" && (
                      <div className="flex justify-end items-center mt-1">
                        <span className="text-xs text-gray-500 mr-2">
                          {msg.timestamp}
                        </span>
                        <span
                          className={`h-2 w-2 rounded-full ${
                            msg.isRead ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[75%]">
                  <div className="flex items-center mb-1 space-x-2">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full"
            type="button"
          >
            <Image className="h-5 w-5 text-gray-500" />
          </button>

          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type something ..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            onKeyDown={handleKeyDown}
            disabled={isSendingMessage}
          />

          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Smile className="h-5 w-5 text-gray-500" />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={
              isSendingMessage || (!inputMessage.trim() && !selectedImage)
            }
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full h-9 w-9 flex items-center justify-center p-0 transition-colors"
          >
            {isSendingMessage ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
