"use client";

import { Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Textarea } from "../../../../../components/ui/textarea";

import { IoArrowBack } from "react-icons/io5";
import { useGetAllBrandQuery } from "../../../../../redux/sellerApi/brand/brandApi";
import { useGetAllCategoryQuery } from "../../../../../redux/sellerApi/category/categoryApi";
import { useCreateProductMutation } from "../../../../../redux/sellerApi/product/productApi";
import { useGetSubCategoryReletedToCategoryQuery } from "../../../../../redux/sellerApi/subCategory/subCategoryApi";
import { useGetAllVariantQuery } from "../../../../../redux/sellerApi/variant/variantApi";
import CreateVariantSheet from "../../../../../components/SellerDahsboard/Product/CreateVariantSheet";
import EditVariantModal from "../../../../../components/SellerDahsboard/Product/EditVariantModal";
import { BiSolidEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDeleteVariantMutation } from "../../../../../redux/variantApi/variantApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../../components/ui/dialog";

const AddProductForm = () => {
  const router = useRouter();

  // Basic Info States
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Edit Variant Modal State
  const [editVariantModalOpen, setEditVariantModalOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState(null);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState(null);
  const [deletingVariantName, setDeletingVariantName] = useState("");

  // Delete variant mutation
  const [deleteVariant, { isLoading: isDeletingVariant }] =
    useDeleteVariantMutation();

  // Category & Brand States
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [shopId, setShopId] = useState(localStorage.getItem("shop"));

  // Image States
  const [featureImage, setFeatureImage] = useState(null);

  // Variant selection
  const [selectedVariants, setSelectedVariants] = useState([]);

  // Filtered subcategories based on selected category
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // API Hooks
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: categoryData } = useGetAllCategoryQuery();

  // Pass categoryId to the subcategory query
  const { data: subcategoryData, isLoading: subcategoryLoading } =
    useGetSubCategoryReletedToCategoryQuery(categoryId, {
      skip: !categoryId, // Skip the query if no category is selected
    });

  const { data: variantData, isLoading: variantLoading } =
    useGetAllVariantQuery(subcategoryId, {
      skip: !subcategoryId, // Skip query if no subcategory is selected
    });
  const { data: brandData } = useGetAllBrandQuery();

  const variants = variantData?.data?.result || [];

  // Filter subcategories when category changes
  useEffect(() => {
    console.log("Category ID:", categoryId);
    console.log("Subcategory Data:", subcategoryData);

    if (categoryId && subcategoryData?.data) {
      // Since the API already returns subcategories related to the category,
      // we might not need additional filtering
      // But let's double check the structure
      const subcategories = Array.isArray(subcategoryData.data)
        ? subcategoryData.data
        : subcategoryData.data.subCategorys || subcategoryData.data || [];

      console.log("All subcategories:", subcategories);

      // If the API doesn't filter by category, we need to do it manually
      const filtered = subcategories.filter(
        (sub) => sub.categoryId && sub.categoryId._id === categoryId
      );

      console.log("Filtered subcategories:", filtered);

      setFilteredSubcategories(filtered);
      setSubcategoryId(""); // Reset subcategory when category changes
    } else {
      setFilteredSubcategories([]);
      setSubcategoryId("");
    }
  }, [categoryId, subcategoryData]);

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleFeatureImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeatureImage(file);
    }
  };

  const toggleVariant = (variant) => {
    setSelectedVariants((prev) => {
      const exists = prev.find((item) => item.variantId === variant._id);
      if (exists) {
        return prev.filter((item) => item.variantId !== variant._id);
      }
      return [
        ...prev,
        {
          variantId: variant._id,
          variantPrice: basePrice ? parseFloat(basePrice) : 0,
          variantQuantity: 1,
        },
      ];
    });
  };

  const getVariantSelection = (variantId) =>
    selectedVariants.find((item) => item.variantId === variantId);

  const updateVariantPrice = (variantId, value) => {
    setSelectedVariants((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, variantPrice: Number(value) || 0 }
          : item
      )
    );
  };

  const updateVariantQuantity = (variantId, value) => {
    setSelectedVariants((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, variantQuantity: Number(value) || 1 }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !productName ||
      !description ||
      !basePrice ||
      !categoryId ||
      !subcategoryId ||
      !brandId
    ) {
      alert(
        "Please fill all required fields: Product Name, Description, Base Price, Category, Subcategory, and Brand"
      );
      return;
    }

    if (description.length < 10) {
      alert("Description must be at least 10 characters long");
      return;
    }

    if (!featureImage) {
      alert("Please upload a feature image");
      return;
    }

    if (selectedVariants.length === 0) {
      alert("Select at least one variant for this product");
      return;
    }

    const invalidVariant = selectedVariants.find(
      (v) => !v.variantPrice || v.variantQuantity < 1
    );
    if (invalidVariant) {
      alert("Each selected variant needs price and quantity greater than 0");
      return;
    }

    try {
      const formData = new FormData();

      // Create the product data object matching API structure
      const productData = {
        name: productName,
        description: description,
        basePrice: parseFloat(basePrice),
        tags: tags,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        shopId: shopId,
        brandId: brandId,
        product_variant_Details: selectedVariants.map((variant) => ({
          variantId: variant.variantId,
          variantPrice:
            typeof variant.variantPrice === "number"
              ? variant.variantPrice
              : parseFloat(variant.variantPrice) || parseFloat(basePrice),
          variantQuantity:
            typeof variant.variantQuantity === "number"
              ? variant.variantQuantity
              : parseInt(variant.variantQuantity) || 1,
        })),
      };

      formData.append("data", JSON.stringify(productData));

      // Add feature image
      if (featureImage) {
        formData.append("image", featureImage);
      }

      const response = await createProduct(formData).unwrap();
      alert("Product created successfully!");
      router.push("/seller/product");
    } catch (error) {
      alert(
        "Failed to create product: " + (error?.data?.message || "Unknown error")
      );
      console.error("Error:", error);
    }
  };

  const [showVariantSheet, setShowVariantSheet] = useState(false);

  // Handle edit variant
  const handleEditVariant = (variantId) => {
    setEditingVariantId(variantId);
    setEditVariantModalOpen(true);
  };

  // Handle delete variant - open confirmation modal
  const handleDeleteVariant = (variantId, variantName) => {
    setDeletingVariantId(variantId);
    setDeletingVariantName(variantName || "this variant");
    setDeleteModalOpen(true);
  };

  // Confirm delete variant
  const confirmDeleteVariant = async () => {
    if (!deletingVariantId) return;

    try {
      const response = await deleteVariant(deletingVariantId).unwrap();
      if (response?.success) {
        alert("Variant deleted successfully!");
        // Remove from selected variants if it was selected
        setSelectedVariants((prev) =>
          prev.filter((v) => v.variantId !== deletingVariantId)
        );
      } else {
        alert(response?.message || "Failed to delete variant");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      alert(error?.data?.message || "Failed to delete variant");
    } finally {
      setDeleteModalOpen(false);
      setDeletingVariantId(null);
      setDeletingVariantName("");
    }
  };

  // Cancel delete
  const cancelDeleteVariant = () => {
    setDeleteModalOpen(false);
    setDeletingVariantId(null);
    setDeletingVariantName("");
  };

  const handleCancel = () => {
    router.push("/seller/product");
  };

  return (
    <div className="">
      <div className="">
        <button
          onClick={() => window.history.back()}
          className="border px-5 py-2 shadow rounded mb-5 cursor-pointer"
        >
          <IoArrowBack />
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-gray-600 mt-1">
              Create a variant first then add product
            </p>
          </div>
          <Button
            onClick={() => setShowVariantSheet(true)}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Variant
          </Button>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="productName"
                    className="text-base font-medium"
                  >
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-base font-medium"
                  >
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Write product description (minimum 10 characters)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length} / 10 characters minimum
                  </p>
                </div>

                <div className="w-full">
                  <Label htmlFor="category" className="text-base font-medium">
                    Product Category <span className="text-red-500">*</span>
                  </Label>

                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryData?.data?.categorys?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <Label
                    htmlFor="subcategory"
                    className="text-base font-medium"
                  >
                    Product Subcategory <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={subcategoryId}
                    onValueChange={setSubcategoryId}
                    disabled={
                      !categoryId ||
                      filteredSubcategories.length === 0 ||
                      subcategoryLoading
                    }
                  >
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue
                        placeholder={
                          subcategoryLoading
                            ? "Loading subcategories..."
                            : !categoryId
                            ? "Select category first"
                            : filteredSubcategories.length === 0
                            ? "No subcategory available"
                            : "Select subcategory"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.length > 0 ? (
                        filteredSubcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory._id}
                            value={subcategory._id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-subcategory" disabled>
                          No subcategory available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {categoryId &&
                    filteredSubcategories.length === 0 &&
                    !subcategoryLoading && (
                      <p className="text-xs text-gray-500 mt-1">
                        No subcategories available for this category
                      </p>
                    )}
                  {subcategoryLoading && (
                    <p className="text-xs text-gray-500 mt-1">
                      Loading subcategories...
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="brand" className="text-base font-medium">
                    Brand <span className="text-red-500">*</span>
                  </Label>
                  <Select value={brandId} onValueChange={setBrandId}>
                    <SelectTrigger className="mt-2 w-full">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandData?.data?.result?.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="basePrice" className="text-base font-medium">
                    Base Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="0.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Tags</Label>
                  <div className="mt-2 min-h-[50px] flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm h-fit"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      onBlur={addTag}
                      className="flex-1 min-w-[120px] bg-transparent border-0 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* ... (rest of your right column code remains the same) */}
                <div>
                  <Label className="text-base font-medium">
                    Feature Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    {featureImage ? (
                      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(featureImage)}
                          alt="Feature"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => setFeatureImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFeatureImageUpload}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center mb-3">
                            <Upload className="w-6 h-6 text-gray-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Drop your image here or
                          </p>
                          <span className="text-sm text-red-600 font-medium hover:text-red-700">
                            Click to upload
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Select Variants
                  </Label>
                  {variantLoading ? (
                    <p className="text-sm text-gray-500">Loading variants...</p>
                  ) : variants.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No variants available. Create one first.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {variants.map((variant) => {
                        const selection = getVariantSelection(variant._id);
                        const isSelected = Boolean(selection);
                        const title =
                          variant.identifier ||
                          variant.flavour ||
                          variant.color?.name ||
                          variant.slug ||
                          "Variant";
                        const subLabel =
                          variant.weight ||
                          variant.dimensions ||
                          variant.color?.code ||
                          variant.description;

                        return (
                          <div
                            key={variant._id}
                            className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3"
                          >
                            <div className="flex items-center justify-between">
                              <label className="flex items-start gap-3 cursor-pointer">
                      <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleVariant(variant)}
                                  className="mt-1 h-4 w-4 accent-red-600"
                      />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {title}
                                  </p>
                                  {subLabel && (
                                    <p className="text-xs text-gray-500">
                                      {subLabel}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {variant.categoryId?.name} •{" "}
                                    {variant.subCategoryId?.name}
                                  </p>
                      </div>
                    </label>
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleEditVariant(variant._id)}
                                  className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                                  title="Edit variant"
                                >
                                  <BiSolidEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteVariant(variant._id, title)
                                  }
                                  disabled={isDeletingVariant}
                                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 disabled:opacity-50"
                                  title="Delete variant"
                                >
                                  <RiDeleteBin6Line />
                                </button>
                  </div>
                </div>
                            {isSelected && (
                              <div className="grid grid-cols-2 gap-3">
                <div>
                                  <Label className="text-xs text-gray-600">
                    Variant Price
                  </Label>
                  <Input
                    type="number"
                                    min="0"
                                    value={
                                      selection.variantPrice ?? basePrice ?? ""
                                    }
                                    placeholder={basePrice || "0"}
                                    onChange={(e) =>
                                      updateVariantPrice(
                                        variant._id,
                                        e.target.value
                                      )
                                    }
                  />
                </div>
                <div>
                                  <Label className="text-xs text-gray-600">
                    Variant Quantity
                  </Label>
                                  <Input
                      type="number"
                                    min="1"
                                    value={selection.variantQuantity ?? 1}
                      onChange={(e) =>
                                      updateVariantQuantity(
                                        variant._id,
                                        e.target.value
                                      )
                        }
                                  />
                    </div>
                  </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-8 text-red-600 border-red-600 hover:bg-red-50"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="px-8 bg-red-700 hover:bg-red-800 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Publishing..." : "Publish Product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Variant Sheet */}
      <CreateVariantSheet
        open={showVariantSheet}
        onOpenChange={setShowVariantSheet}
        selectedCategory={categoryId}
        onCategoryChange={setCategoryId}
        selectedSubcategory={subcategoryId}
        onSubcategoryChange={setSubcategoryId}
      />

      {/* Edit Variant Modal */}
      <EditVariantModal
        open={editVariantModalOpen}
        onOpenChange={setEditVariantModalOpen}
        variantId={editingVariantId}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Variant</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{deletingVariantName}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={cancelDeleteVariant}
              disabled={isDeletingVariant}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteVariant}
              disabled={isDeletingVariant}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingVariant ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProductForm;
