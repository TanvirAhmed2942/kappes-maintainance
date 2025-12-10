"use client";
import {
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  X,
  Image,
  MoreVertical,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { BsAppIndicator } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  closeChat,
  markAllAsRead,
  maximizeChat,
  minimizeChat,
  openChat,
  pinChat,
  sendMessage,
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

function Chat() {
  const dispatch = useDispatch();
  const {
    isChatOpen,
    isMinimized,
    messages: reduxMessages,
    unreadCount,
    currentSeller,
    isTyping,
    isPinned,
  } = useSelector((state) => state.chat);

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { userId } = useAuth();
  const toast = useToast();

  // Memoize chatId to avoid unnecessary recalculations
  const chatId = useMemo(
    () => currentSeller?.chatId || currentSeller?.id,
    [currentSeller]
  );

  // Fetch messages from API when chat is open
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch,
  } = useGetMessagesQuery(chatId, {
    skip: !chatId || !isChatOpen, // Skip query if no chatId or chat is closed
  });

  const [createMessage, { isLoading: isSendingMessage }] =
    useCreateMessageMutation();

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

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    [chatId, dispatch]
  );

  // Set up socket listener for real-time messages
  const socketEventName = useMemo(
    () => (chatId ? `getMessage::${chatId}` : null),
    [chatId]
  );

  useSocket(socketEventName, handleSocketMessage);

  // Transform API messages to UI format or use Redux messages as fallback
  const messages = useMemo(() => {
    // If we have API messages, use them; otherwise fall back to Redux messages
    if (messagesData?.data?.messages && userId) {
      // Sort messages chronologically (oldest first)
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
        let senderId = null;

        if (typeof msg.sender === "string") {
          senderId = msg.sender;
        } else if (msg.sender?.participantId) {
          senderId =
            typeof msg.sender.participantId === "object"
              ? msg.sender.participantId._id
              : msg.sender.participantId;
        } else if (msg.senderId) {
          senderId = msg.senderId;
        } else if (msg.sender?._id) {
          senderId = msg.sender._id;
        }

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
    }

    // Fallback to Redux messages (for backward compatibility)
    return reduxMessages || [];
  }, [messagesData, userId, reduxMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages as read when chat is opened and maximized
  useEffect(() => {
    if (isChatOpen && !isMinimized && unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  }, [isChatOpen, isMinimized, unreadCount, dispatch]);

  const handleSendMessage = useCallback(async () => {
    if ((newMessage.trim() === "" && !selectedImage) || !currentSeller) return;

    try {
      // Create FormData
      const formData = new FormData();

      // Add data as JSON string
      const messageData = {
        chatId: currentSeller.chatId || currentSeller.id,
        text: newMessage.trim() || "",
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
        setNewMessage("");
        setSelectedImage(null);
        setImagePreview(null);

        // Also dispatch to Redux for immediate UI update (fallback)
        dispatch(sendMessage(newMessage));
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
  }, [
    newMessage,
    selectedImage,
    currentSeller,
    createMessage,
    toast,
    dispatch,
  ]);

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

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleOpenChat = () => {
    // Use the existing currentSeller info if available, otherwise use default
    if (currentSeller) {
      dispatch(openChat(currentSeller));
    } else {
      // Fallback - this should rarely be used since currentSeller should exist
      const sellerInfo = {
        name: "Customer Support",
        location: "Canada",
        id: "default-chat",
        chatId: "default-chat",
      };
      dispatch(openChat(sellerInfo));
    }
  };

  const handleMinimize = () => {
    dispatch(minimizeChat());
  };

  const handleMaximize = () => {
    dispatch(maximizeChat());
  };

  const handleClose = () => {
    dispatch(closeChat());
  };

  const handlePinChat = () => {
    dispatch(pinChat(!isPinned)); // toggle pin state
  };

  // Floating chat bubble when closed but has messages
  if (!isChatOpen && currentSeller) {
    return (
      <div className="fixed bottom-4 right-4 z-50" onClick={handleOpenChat}>
        <div className="relative">
          <Button
            onClick={() => dispatch(maximizeChat())}
            className="w-16 h-16 rounded-full bg-red-700 hover:bg-red-800 shadow-lg"
          >
            <MessageCircle size={24} className="text-white" />
          </Button>

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}

          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!isChatOpen || !currentSeller) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`bg-white rounded-lg shadow-2xl border ${
          isMinimized ? "w-80 h-16" : "w-80 h-96"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="bg-red-700 text-white p-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">
                {currentSeller?.name?.charAt(0) || "P"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">
                {currentSeller?.name || "Peak"}
              </p>
              <p className="text-xs opacity-90">
                {isTyping ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <div className="bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mr-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto text-white hover:bg-red-600"
              onClick={handlePinChat}
            >
              {isPinned ? (
                <BsAppIndicator size={14} className="text-white" />
              ) : (
                <BsAppIndicator size={14} className="text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto text-white hover:bg-red-600"
              onClick={isMinimized ? handleMaximize : handleMinimize}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto w-auto text-white hover:bg-red-600"
              onClick={handleClose}
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-2 rounded-lg relative ${
                        message.sender === "user"
                          ? "bg-red-700 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.text && (
                        <p className="text-sm">{message.text}</p>
                      )}

                      {/* Images (if any) */}
                      {message.images && message.images.length > 0 && (
                        <div
                          className={`${
                            message.text ? "mt-2" : ""
                          } flex space-x-2`}
                        >
                          {message.images.map((img, i) => (
                            <div key={i} className="rounded-lg overflow-hidden">
                              <img
                                src={img}
                                alt={`Attachment ${i + 1}`}
                                className="h-20 w-auto object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-red-100"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                      {/* New message indicator */}
                      {!message.isRead && message.sender === "seller" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-2 rounded-lg bg-gray-100 text-gray-800">
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
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t relative">
              {/* Image Preview - Positioned absolutely above input */}
              {imagePreview && (
                <div className="absolute bottom-full left-3 mb-1">
                  <div className="relative bg-white border rounded-lg p-1 shadow-sm">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-8 w-8 flex-shrink-0"
                  type="button"
                >
                  <Image size={14} className="text-gray-500" />
                </Button>

                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 text-sm"
                  disabled={isSendingMessage}
                />

                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-red-700 hover:bg-red-800 px-3 flex-shrink-0"
                  disabled={
                    isSendingMessage || (!newMessage.trim() && !selectedImage)
                  }
                >
                  {isSendingMessage ? (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={14} />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Notification dot when minimized and has unread messages */}
      {isMinimized && unreadCount > 0 && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
