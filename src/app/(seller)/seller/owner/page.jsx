"use client";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { LiaUserEditSolid } from "react-icons/lia";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "../../../../redux/userprofileApi/userprofileApi";
import useToast from "../../../../hooks/useShowToast";
import { getImageUrl } from "../../../../redux/baseUrl";
import Image from "next/image";

export default function EditStoreOwnerForm() {
  const { data: profileData, isLoading: isLoadingProfile } =
    useGetUserProfileQuery();
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  const userData = profileData?.data;

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userData && !isEditMode) {
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        email: userData.email || "",
        image: null,
      });
      setOriginalImage(userData.image || null);
      setImagePreview(null);
    }
  }, [userData, isEditMode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleInputChange("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleUpdate = async () => {
    // Validation
    if (!formData.full_name || !formData.phone || !formData.email) {
      toast.showError("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.showError("Please enter a valid email address");
      return;
    }

    try {
      // Create FormData with proper structure
      const formDataToSend = new FormData();

      // Add data as JSON string
      formDataToSend.append(
        "data",
        JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
        })
      );

      // Add image file if a new one was selected
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await updateUserProfile({
        data: formDataToSend,
      }).unwrap();

      if (response?.success) {
        toast.showSuccess("Profile updated successfully!", {
          description: response.message || "Your profile has been updated.",
        });
        setIsEditMode(false);
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, image: null }));
      } else {
        toast.showError(response?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);

      // Handle validation errors from API
      if (error?.data?.error && Array.isArray(error.data.error)) {
        let generalErrorMessage = "";
        error.data.error.forEach((err) => {
          if (!err.path || err.path === "") {
            generalErrorMessage = err.message;
          }
        });
        toast.showError(
          generalErrorMessage ||
            error.data.message ||
            "Failed to update profile"
        );
      } else {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again.";
        toast.showError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (userData) {
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        email: userData.email || "",
        image: null,
      });
      setOriginalImage(userData.image || null);
      setImagePreview(null);
    }
    setIsEditMode(false);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="w-6/12">
        <div className="flex items-center mb-8 justify-between">
          <h1 className="text-3xl font-semibold text-gray-800">
            Store Owner Info
          </h1>
          {!isEditMode && (
            <button
              onClick={handleEdit}
              className="text-base p-3 cursor-pointer border bg-red-700 hover:bg-red-800 flex items-center justify-center rounded-lg"
            >
              <LiaUserEditSolid className="w-5 h-5 mr-2 text-white" />
              <span className="text-white">Edit</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Your Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Your Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                disabled={!isEditMode}
                className="h-14"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditMode}
                className="h-14"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditMode}
                className="h-14"
              />
            </div>

            {/* Image */}
            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="image" className="text-base">
                  Image
                </Label>
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center justify-center h-14 px-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-gray-500">
                      {imagePreview
                        ? "Change owner image"
                        : "Upload owner image"}
                    </span>
                  </label>
                  {(imagePreview || originalImage) && (
                    <div className="mt-4">
                      <Image
                        src={imagePreview || `${getImageUrl}/${originalImage}`}
                        alt="Owner preview"
                        width={500}
                        height={500}
                        className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Display current image when not in edit mode */}
            {!isEditMode && originalImage && (
              <div className="space-y-2">
                <Label className="text-base">Current Image</Label>
                <div className="mt-2">
                  <Image
                    src={`${getImageUrl}/${originalImage}`}
                    alt="Owner image"
                    width={500}
                    height={500}
                    className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Only show in edit mode */}
          {isEditMode && (
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-12 h-12 text-base border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isLoading}
                className="px-12 h-12 text-base bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
