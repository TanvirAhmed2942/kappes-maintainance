"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineUser } from "react-icons/hi";
import { LuShoppingCart, LuHeart } from "react-icons/lu";
import { FiLock, FiLogOut } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import useUser from "../../hooks/useUser";
import { getImageUrl } from "../../redux/baseUrl";
import { useUpdateUserProfileMutation } from "../../redux/userprofileApi/userprofileApi";
import { TiCameraOutline } from "react-icons/ti";
import useToast from "../../hooks/useShowToast";
import { MdStorefront } from "react-icons/md";
const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center">
        <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
        <p className="mb-6">Are you sure you want to log out?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#AF1500] text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ setSelectedMenu, selectedMenu }) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { user, updateUserProfile } = useUser();
  const [updateProfile, { isLoading: isUpdatingImage }] =
    useUpdateUserProfileMutation();
  const { showSuccess, showError } = useToast();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      const formData = new FormData();

      // Add data as JSON string (keep existing user data)
      formData.append(
        "data",
        JSON.stringify({
          full_name: user?.full_name || "",
          phone: user?.phone || "",
          email: user?.email || "",
        })
      );

      // Add image file
      formData.append("image", file);

      const response = await updateProfile({ data: formData }).unwrap();

      if (response?.success) {
        showSuccess(response.message || "Profile image updated successfully!");
        // Update Redux store with new user data
        if (response.data) {
          updateUserProfile(response.data);
        }
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showError(response?.message || "Failed to update profile image");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Update image error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Failed to update profile image. Please try again.";
      showError(errorMessage);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const menuItem = [
    {
      id: 1,
      icon: <HiOutlineUser size={25} />,
      label: "My Profile",
    },
    {
      id: 2,
      icon: <LuShoppingCart size={24} />,
      label: "Order History",
    },
    {
      id: 3,
      icon: <LuHeart size={24} />,
      label: "Wishlist",
    },
    {
      id: 4,
      icon: <MdStorefront size={24} />,
      label: "Followed Shops",
    },
    {
      id: 5,
      icon: <FiLock size={24} />,
      label: "Change Password",
    },
    {
      id: 6,
      icon: <FiLogOut size={24} />,
      label: "Logout",
      onClick: () => setIsLogoutModalOpen(true),
    },
  ];

  return (
    <>
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="bg-white min-w-52 h-[30rem] flex-col items-center justify-center rounded-lg border shadow-sm hidden md:flex z-10">
        <div className="flex flex-col items-center pt-4 py-4">
          <div className="relative">
            <Image
              src={
                user?.image
                  ? `${getImageUrl}${
                      user?.image.startsWith("/")
                        ? user.image.slice(1)
                        : user.image
                    }`
                  : "/assets/userProfile/profileImage.jpg"
              }
              width={100}
              height={100}
              priority
              alt="user image"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#AF1500] "
            />
            <TiCameraOutline
              size={20}
              className="text-white absolute bottom-0 right-0 cursor-pointer rounded-full bg-kappes p-0.5 border border-white"
              onClick={handleImageClick}
            />
          </div>

          <div className="mt-2 text-center">
            <p className="font-medium text-sm">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="mt-4 px-2">
          <ul className="space-y-2">
            {menuItem.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setSelectedMenu(item.id);
                  }
                }}
              >
                <Link
                  href="#"
                  className={`flex items-center gap-2 p-2 rounded-md group transition-colors duration-200 ${
                    selectedMenu === item.id
                      ? "bg-[#AF1500]"
                      : "hover:bg-[#AF1500]"
                  }`}
                >
                  <span
                    className={`${
                      selectedMenu === item.id
                        ? "text-white"
                        : "text-[#AF1500] group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-sm ${
                      selectedMenu === item.id
                        ? "text-white"
                        : "text-[#AF1500] group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
