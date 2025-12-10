"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Upload, X } from "lucide-react";
import {
  useGetVariantByIdQuery,
  useUpdateVariantMutation,
} from "../../../redux/variantApi/variantApi";
import { getImageUrl } from "../../../redux/baseUrl";

export default function EditVariantModal({ open, onOpenChange, variantId }) {
  // Form states
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState({ name: "", code: "" });
  const [size, setSize] = useState("");
  const [flavour, setFlavour] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [variantImages, setVariantImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Color picker options
  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#22c55e" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Yellow", value: "#eab308" },
    { name: "Red", value: "#ef4444" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
    { name: "Gray", value: "#6b7280" },
    { name: "Black", value: "#000000" },
    { name: "White", value: "#ffffff" },
  ];

  // API Hooks
  const { data: variantData, isLoading: isLoadingVariant } =
    useGetVariantByIdQuery(variantId, {
      skip: !variantId || !open,
    });

  const [updateVariant, { isLoading: isUpdating }] = useUpdateVariantMutation();

  // Pre-fill form when variant data loads
  useEffect(() => {
    if (variantData?.data?.result) {
      const variant = variantData.data.result;
      setIdentifier(variant.identifier || "");
      setDescription(variant.description || "");
      setColor(variant.color || { name: "", code: "" });
      setSize(variant.size || "");
      setFlavour(variant.flavour || "");
      setWeight(variant.weight || "");
      setDimensions(variant.dimensions || "");
      setMaterial(variant.material || "");
      setExistingImages(variant.image || []);
      setNewImages([]);
    }
  }, [variantData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setIdentifier("");
      setDescription("");
      setColor({ name: "", code: "" });
      setSize("");
      setFlavour("");
      setWeight("");
      setDimensions("");
      setMaterial("");
      setExistingImages([]);
      setNewImages([]);
    }
  }, [open]);

  const handleColorSelect = (selectedColor) => {
    setColor({
      name: selectedColor.name,
      code: selectedColor.value,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!identifier.trim()) {
      alert("Variant identifier is required");
      return;
    }

    const variant = variantData?.data?.result;
    if (!variant) {
      alert("Variant data not loaded");
      return;
    }

    try {
      const formData = new FormData();

      // Build the payload - must include categoryId and subCategoryId
      const payload = {
        categoryId: variant.categoryId?._id || variant.categoryId,
        subCategoryId: variant.subCategoryId?._id || variant.subCategoryId,
        identifier: identifier.trim(),
        description: description.trim(),
      };

      // Add optional fields if they have values
      if (color.code) {
        payload.color = color;
      }
      if (size) payload.size = size;
      if (flavour) payload.flavour = flavour;
      if (weight) payload.weight = weight;
      if (dimensions) payload.dimensions = dimensions;
      if (material) payload.material = material;

      // Keep existing images that weren't removed
      if (existingImages.length > 0) {
        payload.existingImages = existingImages;
      }

      formData.append("data", JSON.stringify(payload));

      // Add new images
      newImages.forEach((image) => {
        formData.append("image", image);
      });

      console.log("Update payload:", payload);

      const response = await updateVariant({
        id: variantId,
        data: formData,
      }).unwrap();

      if (response?.success) {
        alert("Variant updated successfully!");
        onOpenChange(false);
      } else {
        alert(response?.message || "Failed to update variant");
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      alert(error?.data?.message || "Failed to update variant");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const variant = variantData?.data?.result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Variant</DialogTitle>
          <DialogDescription>
            Update the variant details below
          </DialogDescription>
        </DialogHeader>

        {isLoadingVariant ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">Loading variant data...</div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Category & Subcategory (Read-only) */}
            {variant && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Category</Label>
                  <p className="font-medium">
                    {variant.categoryId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Subcategory</Label>
                  <p className="font-medium">
                    {variant.subCategoryId?.name || "N/A"}
                  </p>
                </div>
              </div>
            )}

            {/* Identifier */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-base font-medium">
                Variant Identifier <span className="text-red-500">*</span>
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="e.g., strawberry_500g, black_xl"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter variant description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color.code === c.value
                        ? "ring-2 ring-offset-2 ring-black border-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => handleColorSelect(c)}
                    title={c.name}
                  />
                ))}
              </div>
              {color.name && (
                <p className="text-sm text-gray-500">
                  Selected: {color.name} ({color.code})
                </p>
              )}
            </div>

            {/* Other Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  type="text"
                  placeholder="e.g., Small, Medium, Large"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flavour">Flavour</Label>
                <Input
                  id="flavour"
                  type="text"
                  placeholder="e.g., Strawberry, Vanilla"
                  value={flavour}
                  onChange={(e) => setFlavour(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="text"
                  placeholder="e.g., 500g, 1Kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  type="text"
                  placeholder="e.g., 10 x 10 x 8"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  type="text"
                  placeholder="e.g., Ceramic, Wooden"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Current Images</Label>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${getImageUrl}${img}`}
                        alt={`Variant ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Add New Images</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {newImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`New ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400">Add</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
