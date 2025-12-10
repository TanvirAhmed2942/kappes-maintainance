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

const BrandViewModal = ({ open, onOpenChange, brand }) => {
  if (!brand) return null;

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
            Brand Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this brand
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Brand Name
            </Label>
            <p className="text-base text-gray-900">{brand.name || "N/A"}</p>
          </div>

          {/* Brand Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Brand Logo
            </Label>
            <div className="w-48 h-48 rounded-md overflow-hidden border border-gray-200">
              <img
                src={getImageSrc(brand?.logo)}
                alt={brand?.name || "Brand"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Status
            </Label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                brand?.isActive === true
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {brand?.isActive === true ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Created Date */}
          {brand?.createdAt && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Created Date
              </Label>
              <p className="text-base text-gray-900">
                {new Date(brand.createdAt).toLocaleDateString("en-GB", {
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

export default BrandViewModal;
