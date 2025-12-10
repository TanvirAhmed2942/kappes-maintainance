"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { getImageUrl } from "../../../redux/baseUrl";

const SubCategoryViewModal = ({ open, onOpenChange, subCategory }) => {
  if (!subCategory) return null;

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "/placeholder-image.png";
    if (imagePath.startsWith("http")) return imagePath;
    return `${getImageUrl}${
      imagePath.startsWith("/") ? imagePath : `/${imagePath}`
    }`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Subcategory Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this subcategory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Subcategory Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Subcategory Name
            </Label>
            <p className="text-base text-gray-900">
              {subCategory.name || "N/A"}
            </p>
          </div>

          {/* Subcategory Image */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Subcategory Image
            </Label>
            <div className="w-48 h-48 rounded-md overflow-hidden border border-gray-200">
              <img
                src={getImageSrc(subCategory?.thumbnail)}
                alt={subCategory?.name || "Subcategory"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <p className="text-base text-gray-900">
              {subCategory.description || "N/A"}
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Category
            </Label>
            <p className="text-base text-gray-900">
              {subCategory?.categoryId?.name || "N/A"}
            </p>
          </div>

          {/* Variants Count */}
          {Array.isArray(subCategory?.variants) && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Variants
              </Label>
              <p className="text-base text-gray-900">
                {subCategory.variants.length} variant
                {subCategory.variants.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Status
            </Label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                subCategory?.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {subCategory?.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Created Date */}
          {subCategory?.createdAt && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Created Date
              </Label>
              <p className="text-base text-gray-900">
                {new Date(subCategory.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubCategoryViewModal;
