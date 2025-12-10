"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useState, useEffect, useRef } from "react";
import {
  useCreateBrandMutation,
  useUpdateCetgoryMutation,
  useGetBrandByIdQuery,
  useGetAllBrandQuery,
} from "../../../redux/sellerApi/brand/brandApi";
import useToast from "../../../hooks/useShowToast";
import { useRouter, useSearchParams } from "next/navigation";
import { getImageUrl } from "../../../redux/baseUrl";
import { Upload, X } from "lucide-react";

export default function AddEditBrandForm() {
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateCetgoryMutation();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");
  const isEditMode = !!brandId;
  const isLoading = isCreating || isUpdating;

  // Try to get brand by ID
  const {
    data: brandData,
    isLoading: isLoadingBrand,
    error: brandError,
  } = useGetBrandByIdQuery(brandId, {
    skip: !isEditMode || !brandId,
  });

  // Fallback: Get all brands and find the one we need
  const { data: allBrandsData } = useGetAllBrandQuery(undefined, {
    skip: !isEditMode || !brandId || (brandData && !brandError),
  });

  // Debug: Log query state
  useEffect(() => {
    if (isEditMode) {
      console.log("Edit mode active, brandId:", brandId);
      console.log("Query skip:", !isEditMode || !brandId);
      console.log("Brand data:", brandData);
      console.log("Loading:", isLoadingBrand);
      console.log("Error:", brandError);
    }
  }, [isEditMode, brandId, brandData, isLoadingBrand, brandError]);

  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const prevBrandIdRef = useRef(null);
  const isFormPopulatedRef = useRef(false);

  // Reset form when switching from edit to create mode
  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        name: "",
        logo: null,
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      prevBrandIdRef.current = null;
      isFormPopulatedRef.current = false;
    } else {
      // Reset populated flag when brandId changes (new brand to edit)
      if (prevBrandIdRef.current !== brandId) {
        isFormPopulatedRef.current = false;
      }
    }
  }, [isEditMode, brandId]);

  // Populate form when in edit mode and brand data is loaded
  useEffect(() => {
    // Only populate if we're in edit mode, have a brandId, and we haven't already populated
    if (isEditMode && brandId && !isFormPopulatedRef.current) {
      let brand = null;

      // First try: Use brandData from getBrandById query
      if (brandData && !isLoadingBrand) {
        // Handle different possible response structures
        if (brandData?.data && (brandData.data.name || brandData.data._id)) {
          brand = brandData.data;
        } else if (
          brandData?.data?.data &&
          (brandData.data.data.name || brandData.data.data._id)
        ) {
          brand = brandData.data.data;
        } else if (brandData?.name || brandData?._id) {
          brand = brandData;
        }
      }

      // Fallback: If getBrandById failed or returned no data, try to find brand from all brands list
      if (!brand && allBrandsData && !isLoadingBrand) {
        const allBrands = Array.isArray(allBrandsData?.data?.result)
          ? allBrandsData.data.result
          : Array.isArray(allBrandsData?.data)
          ? allBrandsData.data
          : [];

        brand = allBrands.find((b) => b._id === brandId);
      }

      console.log("Brand data received:", brandData);
      console.log("All brands data:", allBrandsData);
      console.log("Extracted brand:", brand);

      if (brand && (brand.name || brand._id)) {
        console.log("Populating form with:", {
          name: brand.name,
          logo: brand.logo,
        });

        setFormData({
          name: brand.name || "",
          logo: null, // Don't set logo file, just preview
        });

        // Set image preview from existing logo
        const imagePath = brand.logo;
        if (imagePath) {
          const imageUrl = imagePath.startsWith("http")
            ? imagePath
            : `${getImageUrl}${
                imagePath.startsWith("/") ? imagePath : `/${imagePath}`
              }`;
          console.log("Setting image preview:", imageUrl);
          setImagePreview(imageUrl);
        } else {
          setImagePreview(null);
        }

        // Mark this brandId as processed and form as populated
        prevBrandIdRef.current = brandId;
        isFormPopulatedRef.current = true;
      } else if (!isLoadingBrand && brandData === undefined && !allBrandsData) {
        console.warn("Could not find brand data. BrandId:", brandId);
      }
    }
  }, [isEditMode, brandId, brandData, allBrandsData, isLoadingBrand]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.showError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.showError("Image size should be less than 5MB");
        return;
      }

      handleInputChange("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.name) {
      toast.showError("Please fill in brand name");
      return;
    }

    // In edit mode, logo is optional. In create mode, logo is required
    if (!isEditMode && !formData.logo) {
      toast.showError("Please upload a brand logo");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Create the brand data object
      const brandDataObj = {
        name: formData.name.trim(),
      };

      formDataToSend.append("data", JSON.stringify(brandDataObj));

      // Add logo file if provided (new upload or edit with new logo)
      // API expects field name "logo" not "image" or "thumbnail"
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      }

      if (isEditMode) {
        // Update brand
        const response = await updateBrand({
          id: brandId,
          data: formDataToSend,
        }).unwrap();

        if (response?.success) {
          toast.showSuccess(response.message || "Brand updated successfully!");
          router.push("/seller/brand");
        } else {
          toast.showError(response?.message || "Failed to update brand");
        }
      } else {
        // Create brand
        const response = await createBrand(formDataToSend).unwrap();

        if (response?.success) {
          toast.showSuccess(response.message || "Brand created successfully!");
          // Reset form
          handleCancel();
          // Navigate back to brands list
          router.push("/seller/brand");
        } else {
          toast.showError(response?.message || "Failed to create brand");
        }
      }
    } catch (error) {
      console.error(
        isEditMode ? "Update brand error:" : "Create brand error:",
        error
      );
      if (error?.data?.error && Array.isArray(error.data.error)) {
        let generalErrorMessage = "";
        error.data.error.forEach((err) => {
          if (!err.path || err.path === "") {
            generalErrorMessage = err.message;
          }
        });
        toast.showError(
          generalErrorMessage || error.data.message || "Operation failed"
        );
      } else {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          (isEditMode
            ? "Failed to update brand. Please try again."
            : "Failed to create brand. Please try again.");
        toast.showError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      logo: null,
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading state when fetching brand data in edit mode
  if (isEditMode && isLoadingBrand) {
    return (
      <div className="">
        <div className="">
          <h1 className="text-3xl font-semibold mb-8">Edit Brand</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading brand data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <h1 className="text-3xl font-semibold mb-8">
          {isEditMode ? "Edit Brand" : "Add Brand"}
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter brand name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Brand Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-base">
                Brand Logo{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </Label>
              {imagePreview ? (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Brand preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-8 h-12 text-base border-red-500 text-red-500 hover:bg-red-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              className="px-8 h-12 text-base bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update"
                : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
