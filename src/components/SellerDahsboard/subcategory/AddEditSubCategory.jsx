"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useGetSubCategoryByIdQuery,
} from "../../../redux/sellerApi/subCategory/subCategoryApi";
import { useGetAllCategoryQuery } from "../../../redux/sellerApi/category/categoryApi";
import useToast from "../../../hooks/useShowToast";
import { useRouter, useSearchParams } from "next/navigation";
import { getImageUrl } from "../../../redux/baseUrl";
import { Upload, X } from "lucide-react";

export default function AddEditSubCategory() {
  const [createSubCategory, { isLoading: isCreating }] =
    useCreateSubcategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] =
    useUpdateSubcategoryMutation();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subCategoryId = searchParams.get("id");
  const isEditMode = !!subCategoryId;
  const isLoading = isCreating || isUpdating;

  // Get categories for dropdown
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetAllCategoryQuery();

  // Get subcategory by ID for edit mode
  const {
    data: subCategoryData,
    isLoading: isLoadingSubCategory,
    error: subCategoryError,
  } = useGetSubCategoryByIdQuery(subCategoryId, {
    skip: !isEditMode || !subCategoryId,
  });

  // Debug: Log query state
  useEffect(() => {
    if (isEditMode) {
      console.log("Edit mode active, subCategoryId:", subCategoryId);
      console.log("Query skip:", !isEditMode || !subCategoryId);
      console.log("SubCategory data:", subCategoryData);
      console.log("Loading:", isLoadingSubCategory);
      console.log("Error:", subCategoryError);
    }
  }, [
    isEditMode,
    subCategoryId,
    subCategoryData,
    isLoadingSubCategory,
    subCategoryError,
  ]);

  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedVariantFields, setSelectedVariantFields] = useState([]); // fixed list selections
  const prevSubCategoryIdRef = useRef(null);
  const isFormPopulatedRef = useRef(false);

  const VARIANT_FIELDS = useMemo(
    () => [
      { key: "color", label: "Color" },
      { key: "storage", label: "Storage" },
      { key: "ram", label: "RAM" },
      { key: "network_type", label: "Network Type" },
      { key: "operating_system", label: "Operating System" },
      { key: "storage_type", label: "Storage Type" },
      { key: "processor_type", label: "Processor Type" },
      { key: "processor", label: "Processor" },
      { key: "graphics_card_type", label: "Graphics Card Type" },
      { key: "graphics_card_size", label: "Graphics Card Size" },
      { key: "screen_size", label: "Screen Size" },
      { key: "resolution", label: "Resolution" },
      { key: "lens_kit", label: "Lens Kit" },
      { key: "material", label: "Material" },
      { key: "flavour", label: "Flavour" },
      { key: "size", label: "Size" },
      { key: "fabric", label: "Fabric" },
      { key: "weight", label: "Weight" },
      { key: "volume", label: "Volume" },
      { key: "dimensions", label: "Dimensions" },
      { key: "capacity", label: "Capacity" },
    ],
    []
  );

  // Extract categories from API response
  const categories = Array.isArray(categoriesData?.data?.categorys)
    ? categoriesData.data.categorys
    : Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
    ? categoriesData
    : [];

  // Reset form when switching from edit to create mode
  useEffect(() => {
    if (!isEditMode) {
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        image: null,
      });
      setImagePreview(null);
      setSelectedVariantFields([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      prevSubCategoryIdRef.current = null;
      isFormPopulatedRef.current = false;
    } else {
      // Reset populated flag when subCategoryId changes (new subcategory to edit)
      if (prevSubCategoryIdRef.current !== subCategoryId) {
        isFormPopulatedRef.current = false;
      }
    }
  }, [isEditMode, subCategoryId]);

  // Populate form when in edit mode and subcategory data is loaded
  useEffect(() => {
    // Only populate if we're in edit mode, have a subCategoryId, data is loaded (not loading), and we have data
    // Also check if we haven't already populated this subcategory
    if (
      isEditMode &&
      subCategoryId &&
      !isLoadingSubCategory &&
      subCategoryData &&
      !isFormPopulatedRef.current
    ) {
      // Handle different possible response structures
      // API response structure: { success: true, data: { ...subCategory } }
      let subCategory = null;

      // Try different response structures
      if (
        subCategoryData?.data &&
        (subCategoryData.data.name || subCategoryData.data._id)
      ) {
        // Structure: { data: { name: "...", ... } }
        subCategory = subCategoryData.data;
      } else if (
        subCategoryData?.data?.data &&
        (subCategoryData.data.data.name || subCategoryData.data.data._id)
      ) {
        // Structure: { data: { data: { name: "...", ... } } }
        subCategory = subCategoryData.data.data;
      } else if (subCategoryData?.name || subCategoryData?._id) {
        // Structure: { name: "...", ... } (direct subcategory object)
        subCategory = subCategoryData;
      }

      console.log("SubCategory data received:", subCategoryData);
      console.log("Extracted subCategory:", subCategory);

      if (subCategory && (subCategory.name || subCategory._id)) {
        console.log("Populating form with:", {
          name: subCategory.name,
          description: subCategory.description,
          categoryId: subCategory.categoryId?._id || subCategory.categoryId,
          thumbnail: subCategory.thumbnail,
        });

        setFormData({
          name: subCategory.name || "",
          description: subCategory.description || "",
          categoryId:
            subCategory.categoryId?._id || subCategory.categoryId || "",
          image: null, // Don't set image file, just preview
        });

        // Set fixed required fields selections
        if (
          Array.isArray(subCategory.requiredFieldsForVariant) &&
          subCategory.requiredFieldsForVariant.length > 0
        ) {
          setSelectedVariantFields(subCategory.requiredFieldsForVariant);
        } else {
          setSelectedVariantFields([]);
        }

        // Set image preview from existing image
        const imagePath = subCategory.thumbnail || subCategory.image;
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

        // Mark this subCategoryId as processed and form as populated
        prevSubCategoryIdRef.current = subCategoryId;
        isFormPopulatedRef.current = true;
      } else {
        console.warn(
          "Could not extract subCategory from response:",
          subCategoryData
        );
      }
    }
  }, [isEditMode, subCategoryId, subCategoryData, isLoadingSubCategory]);

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

  const toggleVariantField = (fieldKey) => {
    setSelectedVariantFields((prev) =>
      prev.includes(fieldKey)
        ? prev.filter((f) => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.categoryId) {
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
      toast.showError("Please upload a subcategory image");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Create the subcategory data object
      const subCategoryDataObj = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        requiredFieldsForVariant: selectedVariantFields,
      };

      formDataToSend.append("data", JSON.stringify(subCategoryDataObj));

      // Add thumbnail file if provided (new upload or edit with new image)
      // API expects field name "thumbnail" not "image"
      if (formData.image) {
        formDataToSend.append("thumbnail", formData.image);
      }

      if (isEditMode) {
        // Update subcategory
        const response = await updateSubCategory({
          id: subCategoryId,
          data: formDataToSend,
        }).unwrap();

        if (response?.success) {
          toast.showSuccess(
            response.message || "Subcategory updated successfully!"
          );
          router.push("/seller/subcategory");
        } else {
          toast.showError(response?.message || "Failed to update subcategory");
        }
      } else {
        // Create subcategory
        const response = await createSubCategory(formDataToSend).unwrap();

        if (response?.success) {
          toast.showSuccess(
            response.message || "Subcategory created successfully!"
          );
          // Reset form
          handleCancel();
          // Navigate back to subcategories list
          router.push("/seller/subcategory");
        } else {
          toast.showError(response?.message || "Failed to create subcategory");
        }
      }
    } catch (error) {
      console.error(
        isEditMode ? "Update subcategory error:" : "Create subcategory error:",
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
            ? "Failed to update subcategory. Please try again."
            : "Failed to create subcategory. Please try again.");
        toast.showError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      image: null,
    });
    setImagePreview(null);
    setSelectedVariantFields([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading state when fetching subcategory data in edit mode
  if (isEditMode && isLoadingSubCategory) {
    return (
      <div className="">
        <div className="">
          <h1 className="text-3xl font-semibold mb-8">Edit Subcategory</h1>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading subcategory data...</p>
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
          {isEditMode ? "Edit Subcategory" : "Add Subcategory"}
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Subcategory Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">
                Subcategory Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter subcategory name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  handleInputChange("categoryId", value)
                }
                disabled={isLoading || isLoadingCategories}
              >
                <SelectTrigger className="h-12">
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? "Loading categories..."
                        : categoriesError
                        ? "Error loading categories"
                        : categories.length === 0
                        ? "No categories available"
                        : "Select a category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : categoriesError ? (
                    <SelectItem value="error" disabled>
                      Error loading categories
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name || "N/A"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory Description */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description" className="text-base">
                Subcategory Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter subcategory description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="min-h-[120px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Required Fields for Variant (Fixed Options) */}
            <div className="space-y-2 col-span-2">
              <Label className="text-base">
                Required Fields for Variant
                <span className="text-gray-500 text-sm ml-2">
                  Select applicable fields
                </span>
              </Label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {VARIANT_FIELDS.map((field) => (
                  <label
                    key={field.key}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-colors"
                  >
                    <Checkbox
                      checked={selectedVariantFields.includes(field.key)}
                      onCheckedChange={() => toggleVariantField(field.key)}
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-800">{field.label}</span>
                  </label>
                ))}
              </div>
              {selectedVariantFields.length === 0 && (
                <p className="text-xs text-gray-500">
                  Select at least one field if variants require specific
                  attributes.
                </p>
              )}
            </div>

            {/* Subcategory Image */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="image" className="text-base">
                Subcategory Image{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </Label>
              {imagePreview ? (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Subcategory preview"
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
