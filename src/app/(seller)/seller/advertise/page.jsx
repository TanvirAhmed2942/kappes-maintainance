"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  CalendarIcon,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { useToggleAdvertisementMutation } from "../../../../redux/advertisement/advertisementApi";
import { useUpdateStoreInfoMutation } from "../../../../redux/sellerApi/storeInfoApi/storeInfoApi";
import { toast } from "sonner";
import Image from "next/image";
import { useSelector } from "react-redux";
import { getStoreInfo } from "../../../../features/sellerStoreSlice/sellerStoreSlice";
import { getImageUrl } from "../../../../redux/baseUrl";
import { format } from "date-fns";

export default function AdvertisePage() {
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [toggleAdvertisement, { isLoading }] = useToggleAdvertisementMutation();
  const [updateStoreInfo, { isLoading: isUploadingImages }] =
    useUpdateStoreInfoMutation();
  const storeInfo = useSelector(getStoreInfo);

  // Populate existing expiry date if advertisement is active
  useEffect(() => {
    if (storeInfo?.advertisedExpiresAt) {
      const expiryDateFormatted = format(
        new Date(storeInfo.advertisedExpiresAt),
        "yyyy-MM-dd"
      );
      setExpiryDate(expiryDateFormatted);
    }
  }, [storeInfo]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding new files exceeds limit
    if (images.length + files.length > 3) {
      toast.error("You can only upload a maximum of 3 images");
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Only JPG, PNG images are allowed");
      return;
    }

    // Add new images
    setImages([...images, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSaveImages = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least 1 image");
      return;
    }

    try {
      const formData = new FormData();

      // Append all images with key 'advertisement_banner'
      images.forEach((image) => {
        formData.append("advertisement_banner", image);
      });

      await updateStoreInfo({ data: formData }).unwrap();

      toast.success("Advertisement images saved successfully!");

      // Clear the uploaded images after successful save
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error saving images:", error);
      toast.error(
        error?.data?.message || "Failed to save images. Please try again."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!expiryDate) {
      setError("Please select an expiry date");
      return;
    }

    // Validate that date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(expiryDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Expiry date must be in the future");
      return;
    }

    // Check if images exist (either uploaded now OR already saved in store)
    const hasExistingImages =
      storeInfo?.advertisementBanner &&
      storeInfo.advertisementBanner.length > 0;
    const hasNewImages = images.length > 0;

    if (!hasExistingImages && !hasNewImages) {
      toast.error(
        "Please upload at least 1 image before creating advertisement"
      );
      return;
    }

    // Get shopId from localStorage
    const shopId = localStorage.getItem("shop");
    if (!shopId) {
      toast.error("Shop ID not found. Please login again.");
      return;
    }

    try {
      const response = await toggleAdvertisement({
        shopId,
        data: { advertisedExpiresAt: expiryDate }, // Already in YYYY-MM-DD format
      }).unwrap();

      toast.success(
        "Advertisement created successfully! Redirecting to payment..."
      );

      // Redirect to Stripe checkout URL
      if (response?.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error creating advertisement:", error);
      toast.error(
        error?.data?.message ||
          "Failed to create advertisement. Please try again."
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {storeInfo?.isAdvertised
              ? "Update Advertisement"
              : "Create Advertisement"}
          </h1>
          <p className="text-gray-600">
            Upload up to 3 images and set an expiry date for your advertisement
          </p>
        </div>

        {/* Current Advertisement Status */}
        {storeInfo?.isAdvertised && (
          <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">
                Advertisement Active
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-medium">Started:</span>
                <span>
                  {storeInfo.advertisedAt
                    ? format(new Date(storeInfo.advertisedAt), "PPP 'at' p")
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium">Expires:</span>
                <span>
                  {storeInfo.advertisedExpiresAt
                    ? format(new Date(storeInfo.advertisedExpiresAt), "PPP")
                    : "N/A"}
                </span>
              </div>
              {storeInfo.advertisementBanner &&
                storeInfo.advertisementBanner.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-3">
                      Current Advertisement Images:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {storeInfo.advertisementBanner.map((banner, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden border-2 border-green-300"
                        >
                          <Image
                            src={`${getImageUrl}${
                              banner.startsWith("/") ? banner.slice(1) : banner
                            }`}
                            alt={`Advertisement ${index + 1}`}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="expiry-date" className="text-base font-semibold">
              <CalendarIcon className="inline w-5 h-5 mr-2" />
              Expiry Date
            </Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                setError("");
              }}
              min={new Date().toISOString().split("T")[0]}
              className={`text-base py-6 ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <p className="text-sm text-gray-500">
              Select the date when your advertisement should expire
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              <ImageIcon className="inline w-5 h-5 mr-2" />
              Advertisement Images (Max 3)
            </Label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-red-500 transition-all"
                  >
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-base font-medium text-gray-700 mb-2">
                    Click to upload images
                  </span>
                  <span className="text-sm text-gray-500">
                    JPG, PNG (max 3 images)
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    {images.length} / 3 uploaded
                  </span>
                </label>
              </div>
            )}

            {images.length === 3 && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Maximum images uploaded (3/3)
              </p>
            )}

            {/* Save Images Button */}
            {images.length > 0 && (
              <Button
                type="button"
                onClick={handleSaveImages}
                disabled={isUploadingImages}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-base mt-4"
              >
                {isUploadingImages
                  ? "Saving Images..."
                  : "Save Advertisement Images"}
              </Button>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1 py-6 text-base"
              onClick={() => {
                setExpiryDate("");
                setImages([]);
                setImagePreviews([]);
                setError("");
              }}
            >
              Clear All
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white py-6 text-base"
            >
              {isLoading
                ? storeInfo?.isAdvertised
                  ? "Updating..."
                  : "Creating..."
                : storeInfo?.isAdvertised
                ? "Update Advertisement"
                : "Create Advertisement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
