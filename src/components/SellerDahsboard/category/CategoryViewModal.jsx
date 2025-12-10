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

const CategoryViewModal = ({ open, onOpenChange, category }) => {
  if (!category) return null;

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
            Category Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Category Name
            </Label>
            <p className="text-base text-gray-900">{category.name || "N/A"}</p>
          </div>

          {/* Category Image */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Category Image
            </Label>
            <div className="w-48 h-48 rounded-md overflow-hidden border border-gray-200">
              <img
                src={getImageSrc(category?.thumbnail || category?.image)}
                alt={category?.name || "Category"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-image.png";
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <p className="text-base text-gray-900">
              {category.description || "N/A"}
            </p>
          </div>

          {/* Subcategories */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Subcategories
            </Label>
            {Array.isArray(category?.subCategory) &&
            category.subCategory.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Total: {category.subCategory.length} subcategories
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.subCategory.map((subCat, index) => (
                    <span
                      key={subCat._id || index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {subCat.name || `Subcategory ${index + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-base text-gray-500">No subcategories</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Status
            </Label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                category?.status === "active" || category?.isActive !== false
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {category?.status === "active" || category?.isActive !== false
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          {/* View Count */}
          {category?.ctgViewCount !== undefined && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                View Count
              </Label>
              <p className="text-base text-gray-900">
                {category.ctgViewCount || 0}
              </p>
            </div>
          )}

          {/* Created Date */}
          {category?.createdAt && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Created Date
              </Label>
              <p className="text-base text-gray-900">
                {new Date(category.createdAt).toLocaleDateString("en-GB", {
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

export default CategoryViewModal;
