"use client";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { openChat, closeChat } from "../../features/chatSlice";
import Sidebar from "./chatSidebar";
import ChatBox from "./chatBox";
import {
  useGetChatforUserQuery,
  useGetChatListShopOwnerQuery,
  useGetShopIdQuery,
} from "../../redux/chatApi/chatApi";
import useAuth from "../../hooks/useAuth";
import { getImageUrl } from "../../redux/baseUrl";

const MessagingApp = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const { currentSeller, isChatOpen } = useSelector((state) => state.chat);
  const [selectedChat, setSelectedChat] = useState(null);
  const { userId, isVendor, role } = useAuth();

  // Determine if user is vendor - check both isVendor flag and role
  const isVendorUser = isVendor || role === "VENDOR" || role === "SHOP ADMIN";

  // First, fetch shop ID for vendors
  const { data: shopIdData, isLoading: isLoadingShopId } = useGetShopIdQuery(
    undefined,
    {
      skip: !isVendorUser, // Only fetch if user is vendor
    }
  );

  // Extract shop ID from the response
  const shopId = useMemo(() => {
    if (!shopIdData?.data) return null;
    return shopIdData.data._id || shopIdData.data.id || null;
  }, [shopIdData]);

  // Conditionally fetch chat list based on user type
  // If role is VENDOR, use shop owner API, otherwise use user API
  const { data: userChatsData, isLoading: isLoadingUserChats } =
    useGetChatforUserQuery(undefined, {
      skip: isVendorUser, // Skip if user is vendor
    });

  const { data: shopChatsData, isLoading: isLoadingShopChats } =
    useGetChatListShopOwnerQuery(shopId, {
      skip: !isVendorUser || !shopId, // Only fetch if user is vendor and has shopId
    });

  // Use appropriate data based on user type
  // If role is VENDOR, use shop chats data, otherwise use user chats data
  const chatsData = isVendorUser ? shopChatsData : userChatsData;
  const isLoading = isVendorUser
    ? isLoadingShopId || isLoadingShopChats
    : isLoadingUserChats;

  // Transform API response to format expected by Sidebar
  const users = useMemo(() => {
    if (!chatsData?.data?.chats || !userId) return [];

    return chatsData.data.chats
      .map((chat) => {
        // For vendors/shop owners: find User participants (customers)
        // For regular users: find Shop participants or other Users
        const otherParticipant = chat.participants.find((participant) => {
          if (isVendorUser) {
            // Vendor sees User participants (customers)
            return participant.participantType === "User";
          } else {
            // Regular user sees Shop participants or other Users
            if (participant.participantType === "User") {
              return participant.participantId?._id !== userId;
            }
            // For Shop type, always include
            return participant.participantType === "Shop";
          }
        });

        if (!otherParticipant) return null;

        const participantId = otherParticipant.participantId;
        const isShop = otherParticipant.participantType === "Shop";

        // Get avatar URL with base URL prefix
        const getAvatarUrl = (imagePath) => {
          if (!imagePath) return "/assets/chat/default-user.png";
          // If image path already starts with http, return as is
          if (imagePath.startsWith("http")) return imagePath;
          // Otherwise, prefix with base URL
          return `${getImageUrl}${
            imagePath.startsWith("/") ? imagePath.slice(1) : imagePath
          }`;
        };

        // Get last message timestamp for sorting (most recent activity first)
        // Priority: lastMessage.createdAt > chat.updatedAt > chat.createdAt
        let lastMessageTimestamp = 0;

        if (chat.lastMessage?.createdAt) {
          // If lastMessage is an object with createdAt
          lastMessageTimestamp = new Date(chat.lastMessage.createdAt).getTime();
        } else if (
          chat.lastMessage &&
          typeof chat.lastMessage === "object" &&
          chat.lastMessage.createdAt
        ) {
          lastMessageTimestamp = new Date(chat.lastMessage.createdAt).getTime();
        } else if (chat.updatedAt) {
          lastMessageTimestamp = new Date(chat.updatedAt).getTime();
        } else if (chat.createdAt) {
          lastMessageTimestamp = new Date(chat.createdAt).getTime();
        }

        return {
          id: chat._id,
          chatId: chat._id,
          name: isShop
            ? participantId?.name || "Unknown Shop"
            : participantId?.full_name || "Unknown User",
          avatar: isShop
            ? getAvatarUrl(participantId?.logo)
            : getAvatarUrl(participantId?.image),
          lastMessage: chat.lastMessage
            ? typeof chat.lastMessage === "string"
              ? chat.lastMessage
              : chat.lastMessage.content ||
                chat.lastMessage.text ||
                "No messages yet"
            : "No messages yet",
          isOnline: true, // You can update this based on your online status logic
          lastSeen: chat.lastMessage?.createdAt
            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString()
            : "Never",
          participantType: otherParticipant.participantType,
          participantId: participantId?._id,
          lastMessageTimestamp, // Add timestamp for sorting
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => {
        // Sort by last message timestamp (most recent first)
        // If no timestamp, put at the end
        return b.lastMessageTimestamp - a.lastMessageTimestamp;
      });
  }, [chatsData, userId, isVendorUser]);

  // Sync selectedChat with URL parameter
  useEffect(() => {
    if (!users.length) return;

    if (params?.id) {
      const chatFromUrl = users.find((user) => user.id === params.id);
      if (chatFromUrl && selectedChat?.id !== chatFromUrl.id) {
        setSelectedChat(chatFromUrl);
        dispatch(
          openChat({
            id: chatFromUrl.id,
            name: chatFromUrl.name,
            avatar: chatFromUrl.avatar,
            isOnline: chatFromUrl.isOnline,
            lastSeen: chatFromUrl.lastSeen,
          })
        );
      }
    } else if (!params?.id && !selectedChat && users.length > 0) {
      // If no URL param and no selected chat, select first chat and update URL
      const firstChat = users[0];
      setSelectedChat(firstChat);
      router.push(`/chat/${firstChat.id}`);
      dispatch(
        openChat({
          id: firstChat.id,
          name: firstChat.name,
          avatar: firstChat.avatar,
          isOnline: firstChat.isOnline,
          lastSeen: firstChat.lastSeen,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, users]);

  // Sync selectedChat with Redux currentSeller (fallback)
  useEffect(() => {
    if (currentSeller && currentSeller.id !== selectedChat?.id) {
      setSelectedChat(currentSeller);
      router.push(`/chat/${currentSeller.id}`);
    }
  }, [currentSeller, router, selectedChat]);

  const handleUserSelect = (user) => {
    setSelectedChat(user);
    // Update URL with chat ID
    router.push(`/chat/${user.id}`);
    // Open chat with selected user in Redux
    dispatch(
      openChat({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row border w-full h-full bg-gray-50 lg:px-32 overflow-hidden">
      {/* Mobile Sidebar (Horizontal on top) */}
      <div className="md:hidden w-full border-b flex-shrink-0 max-h-48 overflow-hidden">
        <Sidebar
          users={users}
          selectedChat={selectedChat}
          onUserSelect={handleUserSelect}
          orientation="horizontal"
        />
      </div>

      {/* Desktop Sidebar (Vertical) */}
      <div className="hidden md:block w-80 border-r h-full overflow-hidden">
        <Sidebar
          users={users}
          selectedChat={selectedChat}
          onUserSelect={handleUserSelect}
          orientation="vertical"
        />
      </div>

      {/* Chat Area */}
      <ChatBox selectedChat={selectedChat} />
    </div>
  );
};

export default MessagingApp;
