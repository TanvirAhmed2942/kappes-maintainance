import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../redux/baseUrl";

const useSocket = (eventName, callback) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      // Get authentication token
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      // Socket.IO connection options
      const socketOptions = {
        // Try websocket first, fallback to polling if needed
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        // Add authentication if token exists
        ...(token && {
          auth: {
            token: token,
          },
          // Also add token as query parameter (some servers expect this)
          query: {
            token: token,
          },
        }),
      };

      socketRef.current = io(getSocketUrl(), socketOptions);

      socketRef.current.on("connect", () => {
        console.log("Connected to socket", socketRef.current.id);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Disconnected from socket:", reason);
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        console.error("Error details:", {
          message: error?.message || "Unknown error",
          description: error?.description || "No description available",
          context: error?.context || "No context available",
          type: error?.type || "Unknown error type",
        });
      });

      socketRef.current.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
      });

      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
      });

      socketRef.current.on("reconnect_failed", () => {
        console.error("Failed to reconnect to socket");
      });
    }

    const socket = socketRef.current;

    // Subscribe to event if eventName and callback are provided
    if (eventName && callback) {
      socket.on(eventName, callback);
      console.log(`Listening to socket event: ${eventName}`);
    }

    // Cleanup: Remove event listener when component unmounts or dependencies change
    return () => {
      if (eventName && callback) {
        socket.off(eventName, callback);
        console.log(`Stopped listening to socket event: ${eventName}`);
      }
    };
  }, [eventName, callback]);

  // Cleanup socket connection on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("Socket disconnected and cleaned up");
      }
    };
  }, []);

  return socketRef.current;
};

export default useSocket;
