"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import Chat from "../common/components/chatComponent";
import { persistor, store } from "../store";

// Wrapper to access Redux + pathname within Provider
function ChatWrapper({ children }) {
  const pathname = usePathname();
  const { isChatOpen, isPinned } = useSelector((state) => state.chat);

  useEffect(() => {
    console.log("Current path:", pathname);
  }, [pathname]);

  const shouldShowChat = !pathname.includes("chat") && (isChatOpen || isPinned);

  return (
    <>
      {children}
      {shouldShowChat && <Chat />}
    </>
  );
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster richColors />
        {/* <ChatWrapper> */}
        {children}
        {/* </ChatWrapper> */}
      </PersistGate>
    </Provider>
  );
}
