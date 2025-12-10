"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCetgoryMutation,
  useGetCategoryByIdQuery,
} from "../../../redux/sellerApi/category/categoryApi";
import useToast from "../../../hooks/useShowToast";
import { useRouter, useSearchParams } from "next/navigation";
import { getImageUrl } from "../../../redux/baseUrl";
import { Upload, X } from "lucide-react";

export default function AddCategoryForm() {
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCetgoryMutation();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const isEditMode = !!categoryId;
  const isLoading = isCreating || isUpdating;

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useGetCategoryByIdQuery(categoryId, {
    skip: !isEditMode || !categoryId,
  });

  // Debug: Log query state
  useEffect(() => {
    if (isEditMode) {
      console.log("Edit mode active, categoryId:", categoryId);
      console.log("Query skip:", !isEditMode || !categoryId);
      console.log("Category data:", categoryData);
      console.log("Loading:", isLoadingCategory);
      console.log("Error:", categoryError);
    }
  }, [isEditMode, categoryId, categoryData, isLoadingCategory, categoryError]);

  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const prevCategoryIdRef = useRef(null);
  const isFormPopulatedRef = useRef(false);

  // Reset form when switching from edit to create mode
  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        name: "",
        description: "",
        image: null,
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      prevCategoryIdRef.current = null;
      isFormPopulatedRef.current = false;
    } else {
      // Reset populated flag when categoryId changes (new category to edit)
      if (prevCategoryIdRef.current !== categoryId) {
        isFormPopulatedRef.current = false;
      }
    }
  }, [isEditMode, categoryId]);

  // Populate form when in edit mode and category data is loaded
  useEffect(() => {
    // Only populate if we're in edit mode, have a categoryId, data is loaded (not loading), and we have data
    // Also check if we haven't already populated this category
    if (
      isEditMode &&
      categoryId &&
      !isLoadingCategory &&
      categoryData &&
      !isFormPopulatedRef.current
    ) {
      // Handle different possible response structures
      // API response structure: { success: true, data: { ...category } }
      let category = null;

      // Try different response structures
      if (
        categoryData?.data &&
        (categoryData.data.name || categoryData.data._id)
      ) {
        // Structure: { data: { name: "...", ... } }
        category = categoryData.data;
      } else if (
        categoryData?.data?.data &&
        (categoryData.data.data.name || categoryData.data.data._id)
      ) {
        // Structure: { data: { data: { name: "...", ... } } }
        category = categoryData.data.data;
      } else if (categoryData?.name || categoryData?._id) {
        // Structure: { name: "...", ... } (direct category object)
        category = categoryData;
      }

      console.log("Category data received:", categoryData);
      console.log("Extracted category:", category);

      if (category && (category.name || category._id)) {
        console.log("Populating form with:", {
          name: category.name,
          description: category.description,
          thumbnail: category.thumbnail,
        });

        setFormData({
          name: category.name || "",
          description: category.description || "",
          image: null, // Don't set image file, just preview
        });

        // Set image preview from existing image
        const imagePath = category.thumbnail || category.image;
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

        // Mark this categoryId as processed and form as populated
        prevCategoryIdRef.current = categoryId;
        isFormPopulatedRef.current = true;
      } else {
        console.warn("Could not extract category from response:", categoryData);
      }
    }
  }, [isEditMode, categoryId, categoryData, isLoadingCategory]);

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

      handleInputChange("image", file);
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
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.name || !formData.description) {
      toast.showError("Please fill in all required fields");
      return;
    }

    // Validate description length
    if (formData.description.length < 10) {
      toast.showError("Description must be at least 10 characters long");
      return;
    }

    // In edit mode, image is optional. In create mode, image is required
    if (!isEditMode && !formData.image) {
      toast.showError("Please upload a category image");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Create the category data object
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      formDataToSend.append("data", JSON.stringify(categoryData));

      // Add thumbnail file if provided (new upload or edit with new image)
      // API expects field name "thumbnail" not "image"
      if (formData.image) {
        formDataToSend.append("thumbnail", formData.image);
      }

      if (isEditMode) {
        // Update category
        const response = await updateCategory({
          id: categoryId,
          data: formDataToSend,
        }).unwrap();

        if (response?.success) {
          toast.showSuccess(
            response.message || "Category updated successfully!"
          );
          router.push("/seller/category");
        } else {
          toast.showError(response?.message || "Failed to update category");
        }
      } else {
        // Create category
        const response = await createCategory(formDataToSend).unwrap();

        if (response?.success) {
          toast.showSuccess(
            response.message || "Category created successfully!"
          );
          // Reset form
          handleCancel();
          // Navigate back to categories list
          router.push("/seller/category");
        } else {
          toast.showError(response?.message || "Failed to create category");
        }
      }
    } catch (error) {
      console.error(
        isEditMode ? "Update category error:" : "Create category error:",
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
            ? "Failed to update category. Please try again."
            : "Failed to create category. Please try again.");
        toast.showError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      image: null,
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading state when fetching category data in edit mode
  if (isEditMode && isLoadingCategory) {
    return (
      <div className="">
        <div className="">
          <h1 className="text-3xl font-semibold mb-8">Edit Category</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading category data...</p>
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
          {isEditMode ? "Edit Category" : "Add Category"}
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Category Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                Category Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Category Image */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-base">
                Category Image{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </Label>
              {imagePreview ? (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Category preview"
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
