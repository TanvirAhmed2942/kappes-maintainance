"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";

const CouponViewModal = ({ open, onOpenChange, coupon }) => {
  if (!coupon) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Coupon Details
          </DialogTitle>
          <DialogDescription>
            View complete information about this coupon
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Coupon Code */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-700">
              Coupon Code
            </Label>
            <div className="text-lg font-mono font-bold text-red-600 bg-red-50 px-4 py-2 rounded-md">
              {coupon.code}
            </div>
          </div>

          {/* Discount Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Discount Type
              </Label>
              <div className="text-base text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {coupon.discountType}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Discount Value
              </Label>
              <div className="text-base text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {coupon.discountType === "Percentage"
                  ? `${coupon.discountValue}%`
                  : `$${coupon.discountValue}`}
              </div>
            </div>
          </div>

          {/* Order Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Minimum Order Amount
              </Label>
              <div className="text-base text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {coupon.minOrderAmount ? `$${coupon.minOrderAmount}` : "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Maximum Discount Amount
              </Label>
              <div className="text-base text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {coupon.maxDiscountAmount
                  ? `$${coupon.maxDiscountAmount}`
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Start Date
              </Label>
              <div className="text-base text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {formatDateOnly(coupon.startDate)}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                End Date
              </Label>
              <div className="text-base text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                {formatDateOnly(coupon.endDate)}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-700">
              Status
            </Label>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  coupon.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {coupon.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-500">
                Created At
              </Label>
              <div className="text-sm text-gray-600">
                {formatDate(coupon.createdAt)}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-500">
                Last Updated
              </Label>
              <div className="text-sm text-gray-600">
                {formatDate(coupon.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponViewModal;
