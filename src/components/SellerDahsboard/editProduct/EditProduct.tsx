"use client";

import { Upload, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

import { IoArrowBack } from "react-icons/io5";

import { getImageUrl } from "../../../redux/baseUrl";
import { useGetAllBrandQuery } from "../../../redux/sellerApi/brand/brandApi";
import { useGetAllCategoryQuery } from "../../../redux/sellerApi/category/categoryApi";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "../../../redux/sellerApi/product/productApi";
import { useGetSubCategoryReletedToCategoryQuery } from "../../../redux/sellerApi/subCategory/subCategoryApi";
import { useGetAllVariantQuery } from "../../../redux/sellerApi/variant/variantApi";
import { Button } from "../../ui/button";

const EditProductForm = () => {
  const router = useRouter();
  const params = useParams();

  // Store productId in state to ensure it persists across renders
  const [productId, setProductId] = useState<string>("");

  // Set productId from params or URL on mount and when params change
  useEffect(() => {
    // First try to get from params
    if (params?.productId) {
      const id = String(params.productId).trim();
      console.log("Setting productId from params:", id);
      setProductId(id);
      return;
    }

    // Fallback: get from URL pathname
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      const editIndex = pathParts.indexOf("edit-product");
      if (editIndex !== -1 && pathParts[editIndex + 1]) {
        const id = pathParts[editIndex + 1].trim();
        console.log("Setting productId from URL:", id);
        setProductId(id);
      }
    }
  }, [params?.productId]);

  console.log("ProductId resolved:", productId);

  const { data: productData, isLoading: productLoading } =
    useGetProductByIdQuery(productId, { skip: !productId });
  const [editProduct, { isLoading: updateLoading, isError: updateError }] =
    useUpdateProductMutation();

  // Also set productId from loaded product data as additional fallback
  useEffect(() => {
    if (productData?.data?._id && !productId) {
      console.log("Setting productId from product data:", productData.data._id);
      setProductId(productData.data._id);
    }
  }, [productData?.data?._id, productId]);

  // Basic Info States
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // Category & Brand States
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [shopId, setShopId] = useState("691af5eb80ccb62017c06c6f");

  // Variant selection
  const [selectedVariants, setSelectedVariants] = useState([]);

  // Image States
  const [featureImage, setFeatureImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Filtered subcategories based on selected category
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // API Hooks
  const { data: categoryData } = useGetAllCategoryQuery(undefined, {
    skip: !categoryId,
  });

  // Pass categoryId to the subcategory query
  const { data: subcategoryData, isLoading: subcategoryLoading } =
    useGetSubCategoryReletedToCategoryQuery(categoryId, {
      skip: !categoryId,
    });

  const {
    data: variantData,
    isLoading: variantLoading,
    refetch: refetchVariants,
  } = useGetAllVariantQuery(subcategoryId, {
    skip: !subcategoryId, // Skip query if no subcategory is selected
  });
  const { data: brandData } = useGetAllBrandQuery(undefined, {
    skip: !brandId,
  });

  const variants = variantData?.data?.result || [];

  // Refetch variants when subcategoryId is available
  useEffect(() => {
    if (subcategoryId) {
      console.log("Refetching variants for subcategoryId:", subcategoryId);
      refetchVariants();
    }
  }, [subcategoryId, refetchVariants]);

  // Pre-fill form data when product data is loaded
  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      console.log("Product data loaded:", product);
      console.log("Product images:", product.images);

      // Basic Info
      setProductName(product.name || "");
      setDescription(product.description || "");
      setBasePrice(product.basePrice?.toString() || "");
      setTags(product.tags || []);

      // Category & Brand
      setCategoryId(product.categoryId?._id || "");
      setSubcategoryId(product.subcategoryId?._id || "");
      setBrandId(product.brandId?._id || "");
      setShopId(product.shopId?._id || "691af5eb80ccb62017c06c6f");

      // Variant selections - only include items with valid variantId
      if (product.product_variant_Details?.length > 0) {
        const mapped = product.product_variant_Details
          .filter((item) => item.variantId) // Only include items with variantId
          .map((item) => {
            // Get the variantId - could be object or string
            const variantId =
              typeof item.variantId === "object"
                ? item.variantId._id
                : item.variantId;

            return {
              variantId: variantId,
              variantPrice: item.variantPrice ?? parseFloat(product.basePrice),
              variantQuantity: item.variantQuantity ?? 1,
            };
          })
          .filter((item) => item.variantId); // Double check variantId exists

        console.log("Loaded variants:", mapped);
        setSelectedVariants(mapped);
      }

      // Existing Images
      setExistingImages(product.images || []);
    }
  }, [productData]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (categoryId && subcategoryData?.data) {
      const subcategories = Array.isArray(subcategoryData.data)
        ? subcategoryData.data
        : subcategoryData.data.subCategorys || subcategoryData.data || [];

      const filtered = subcategories.filter(
        (sub) => sub.categoryId && sub.categoryId._id === categoryId
      );

      setFilteredSubcategories(filtered);

      // Only reset subcategory if it doesn't belong to the current category
      if (subcategoryId && !filtered.some((sub) => sub._id === subcategoryId)) {
        setSubcategoryId("");
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [categoryId, subcategoryData, subcategoryId]);

  // Function to get complete image URL
  const getCompleteImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${getImageUrl}${imagePath}`;
  };

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

    // Use productId directly - it's already validated at component level
    const productIdToUse = productId || productData?.data?._id;

    // Validate productId before proceeding
    if (!productIdToUse || productIdToUse.length < 10) {
      alert("Invalid product ID. Please refresh the page and try again.");
      console.error("Invalid product ID:", productIdToUse);
      return;
    }

    console.log("Updating product with ID:", productIdToUse);

    try {
      const formData = new FormData();

      // Create the product data object matching API structure
      // Filter out any variants without valid variantId
      const validVariants = selectedVariants
        .filter((variant) => variant.variantId && variant.variantId.length > 0)
        .map((variant) => ({
          variantId: variant.variantId,
          variantPrice:
            typeof variant.variantPrice === "number"
              ? variant.variantPrice
              : parseFloat(variant.variantPrice) || parseFloat(basePrice),
          variantQuantity:
            typeof variant.variantQuantity === "number"
              ? variant.variantQuantity
              : parseInt(variant.variantQuantity) || 1,
        }));

      const productPayload = {
        name: productName,
        description: description,
        basePrice: parseFloat(basePrice),
        tags: tags,
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        shopId: shopId,
        brandId: brandId,
        product_variant_Details: validVariants,
      };

      console.log("Payload to send:", productPayload);

      formData.append("data", JSON.stringify(productPayload));

      // Add feature image if new one is uploaded
      if (featureImage) {
        formData.append("image", featureImage);
      }

      // Call update mutation with productId
      console.log("=== UPDATE PRODUCT ===");
      console.log("Product ID:", productIdToUse);
      console.log("API URL will be:", `/product/${productIdToUse}`);

      const response = await editProduct({
        productId: productIdToUse,
        data: formData,
      }).unwrap();

      console.log("Update response:", response);

      alert("Product updated successfully!");
      router.push("/seller/product");
    } catch (error) {
      alert(
        "Failed to update product: " + (error?.data?.message || "Unknown error")
      );
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    router.push("/seller/product");
  };

  if (productLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading product data...</div>
      </div>
    );
  }

  // Show warning if productId is not available
  if (!productId && !productData?.data?._id) {
    return (
      <div className="flex flex-col justify-center items-center min-h-64">
        <div className="text-lg text-red-600 mb-4">
          Product ID is missing. Please check the URL.
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={() => router.push("/seller/product")}
          className="bg-red-700 hover:bg-red-800 text-white"
        >
          Go Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <button
          onClick={() => window.history.back()}
          className="border px-5 py-2 shadow rounded mb-5 cursor-pointer"
        >
          <IoArrowBack />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

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
                    type="text"
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
                    <SelectContent className="bg-white">
                      {categoryData?.data?.categorys?.map((category) => (
                        <SelectItem
                          className="bg-white"
                          key={category._id}
                          value={category._id}
                        >
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
                    <SelectContent className="bg-white">
                      {filteredSubcategories.length > 0 ? (
                        filteredSubcategories.map((subcategory) => (
                          <SelectItem
                            className="bg-white"
                            key={subcategory._id}
                            value={subcategory._id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          className="bg-white"
                          value="no-subcategory"
                          disabled
                        >
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
                    <SelectContent className="bg-white">
                      {brandData?.data?.result?.map((brand) => (
                        <SelectItem
                          className="bg-white"
                          key={brand._id}
                          value={brand._id}
                        >
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
                {/* Feature Image Section - Fixed */}
                <div>
                  <Label className="text-base font-medium">
                    Feature Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2">
                    {featureImage ? (
                      // Newly uploaded feature image
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
                    ) : existingImages[0] ? (
                      // Existing feature image
                      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={getCompleteImageUrl(existingImages[0])}
                          alt="Feature"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <div className="p-1.5 bg-blue-500 text-white rounded-full text-xs">
                            Existing
                          </div>
                          <button
                            onClick={() => setFeatureImage(null)}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="Remove feature image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Upload new feature image button */}
                        <label className="absolute bottom-2 right-2 bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm cursor-pointer hover:bg-gray-50">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFeatureImageUpload}
                            className="hidden"
                          />
                          Change
                        </label>
                      </div>
                    ) : (
                      // No feature image - upload area
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
                  {existingImages[0] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current feature image. Click &quot;Change&quot; to upload
                      a new one.
                    </p>
                  )}
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

                            {isSelected && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs text-gray-600">
                                    Variant Price
                                  </Label>
                                  <Input
                                    className="bg-white"
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
                                    className="bg-white"
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
                size="default"
                onClick={handleCancel}
                className="px-8 text-red-600 border-red-600 hover:bg-red-50"
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="default"
                onClick={handleSubmit}
                className="px-8 bg-red-700 hover:bg-red-800 text-white"
                disabled={updateLoading || !productId}
                title={
                  !productId
                    ? "Product ID is missing. Please wait for the page to load."
                    : ""
                }
              >
                {updateLoading ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProductForm;
