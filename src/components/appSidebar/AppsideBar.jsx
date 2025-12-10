"use client";

import {
  Heart,
  LayoutGrid,
  Lock,
  LogOut,
  Package,
  ShoppingCart,
  Star,
  Store,
  Ticket,
  UserCog,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import Image from "next/image";
import {
  getStoreInfo,
  setStoreInfo,
} from "../../features/sellerStoreSlice/sellerStoreSlice";
import { useSelector, useDispatch } from "react-redux";
import { getImageUrl } from "../../redux/baseUrl";
import { VscTag } from "react-icons/vsc";
import { TbBoomFilled, TbPackages } from "react-icons/tb";
import { BsBoxSeam } from "react-icons/bs";
import { MdAdsClick } from "react-icons/md";
import { useGetStoreInfoQuery } from "../../redux/sellerApi/storeInfoApi/storeInfoApi";

const AppSidebar = () => {
  const [activeItem, setActiveItem] = useState("Overview");
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const dispatch = useDispatch();
  const storeInfo = useSelector(getStoreInfo);
  const {
    data: storeInfoData,
    isLoading: storeInfoLoading,
    error: storeInfoError,
  } = useGetStoreInfoQuery();
  const menuItems = [
    {
      icon: LayoutGrid,
      label: "Overview",
      active: true,
      path: "/seller/overview",
    },
    { icon: Package, label: "Category", path: "/seller/category" },
    { icon: TbPackages, label: "SubCategory", path: "/seller/subcategory" },
    { icon: VscTag, label: "Brand", path: "/seller/brand" },
    { icon: BsBoxSeam, label: "Product", path: "/seller/product" },
    { icon: ShoppingCart, label: "Order List", path: "/seller/order" },
    { icon: Ticket, label: "Coupon", path: "/seller/coupon" },
    { icon: Store, label: "Store info", path: "/seller/store" },
    { icon: Heart, label: "Owner info", path: "/seller/owner" },
    { icon: Star, label: "Reviews", path: "/seller/review" },
    { icon: MdAdsClick, label: "Advertisement", path: "/seller/advertise" },
    { icon: UserCog, label: "Admin Role", path: "/seller/admin" },
    { icon: Lock, label: "Change Password", path: "/seller/change-password" },
    { icon: LogOut, label: "Logout" },
  ];
  const handleLogout = () => {
    logout();
    router.push("/auth/become-seller-login");
  };

  // Update store info in Redux when API data is available
  useEffect(() => {
    if (storeInfoData?.data?.name) {
      dispatch(
        setStoreInfo({
          storeName: storeInfoData.data.name,
          storeLogo: storeInfoData.data.logo,
          isAdvertised: storeInfoData.data.isAdvertised || false,
          advertisedAt: storeInfoData.data.advertisedAt || null,
          advertisedExpiresAt: storeInfoData.data.advertisedExpiresAt || null,
          advertisementBanner: storeInfoData.data.advertisement_banner || [],
        })
      );
    }
  }, [storeInfoData, storeInfo, dispatch, storeInfoLoading, storeInfoError]);

  useEffect(() => {
    const currentMenuItem = menuItems.find((item) => item.path === pathname);
    if (currentMenuItem) {
      setActiveItem(currentMenuItem.label);
    }
  }, [pathname]);

  const handleItemClick = (item) => {
    setActiveItem(item.label);
    if (item.path) {
      router.push(item.path);
    }
    if (item.label === "Logout") {
      handleLogout();
    }
  };

  return (
    <div className="w-80 bg-white rounded-2xl shadow-lg p-6 min-h-screen">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src={
            storeInfo?.storeLogo
              ? `${getImageUrl}${
                  storeInfo.storeLogo.startsWith("/")
                    ? storeInfo.storeLogo.slice(1)
                    : storeInfo.storeLogo
                }`
              : "/assets/default-store-logo.png"
          }
          alt="store logo"
          width={100}
          height={100}
          className="w-24 h-24 ring-2 ring-[#B01501] rounded-full object-contain bg-white p-1"
        />
        <h2 className="text-xl font-semibold text-gray-900 my-2">
          {storeInfoLoading
            ? "Loading..."
            : storeInfo?.storeName || "Store Name"}
        </h2>
        {storeInfoError && (
          <p className="text-xs text-red-500">Error loading store info</p>
        )}
      </div>

      {/* Menu Items */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-[#B01501] text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium flex items-center justify-between w-full">
                {item.label}
                {item.label === "Advertisement" && storeInfo?.isAdvertised ? (
                  <TbBoomFilled className="w-5 h-5 text-red-500 animate-pulse" />
                ) : null}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppSidebar;
