"use client";
import MessagingApp from "../../../components/Chat/messagingApp";
import React from "react";
import { withAuth } from "../../../Providers/AuthGuard";

function Page() {
  return (
    <div className="w-full h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] bg-gray-50 overflow-hidden">
      <MessagingApp />
    </div>
  );
}

export default withAuth(Page);
