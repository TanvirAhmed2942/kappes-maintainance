"use client";
import AppSidebar from "../../../components/appSidebar/AppsideBar";
import { withAuth } from "../../../Providers/AuthGuard";

const SellerLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <AppSidebar />
      <main className="flex-1 ml-6 bg-white rounded-2xl shadow-lg p-8">
        {children}
      </main>
    </div>
  );
};

// Only allow VENDOR role to access seller dashboard
export default withAuth(SellerLayout, ["VENDOR", "SHOP ADMIN"]);
