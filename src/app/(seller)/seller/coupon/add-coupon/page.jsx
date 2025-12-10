"use client";

import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { useState, useEffect } from "react";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useGetCouponsQuery,
} from "../../../../../redux/sellerApi/couponApi/couponApi";
import useToast from "../../../../../hooks/useShowToast";
import { useRouter, useSearchParams } from "next/navigation";
export default function AddCouponForm() {
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const { data: couponsData } = useGetCouponsQuery();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams.get("code");
  const isEditMode = !!couponCode;
  const isLoading = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    discountType: "",
    discountAmount: "",
    maxDiscountAmount: "",
    minOrderAmount: "",
    startDate: "",
    endDate: "",
  });

  // Populate form when in edit mode
  useEffect(() => {
    if (isEditMode && couponsData?.data) {
      const coupon = couponsData.data.find((c) => c.code === couponCode);
      if (coupon) {
        // Format dates for date inputs (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        // Map discountType to form value
        const discountTypeLower = coupon.discountType?.toLowerCase() || "";
        const discountTypeValue =
          discountTypeLower === "percentage"
            ? "percentage"
            : discountTypeLower === "flat" || discountTypeLower === "fixed"
            ? "flat"
            : "";

        setFormData({
          title: coupon.name || "",
          description: coupon.description || "",
          code: coupon.code || "",
          discountType: discountTypeValue,
          discountAmount: coupon.discountValue?.toString() || "",
          maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
          minOrderAmount: coupon.minOrderAmount?.toString() || "",
          startDate: formatDateForInput(coupon.startDate),
          endDate: formatDateForInput(coupon.endDate),
        });
      }
    }
  }, [isEditMode, couponCode, couponsData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePublish = async () => {
    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "code",
      "discountType",
      "discountAmount",
      "startDate",
      "endDate",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.showError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Validate discount type is selected
    if (!formData.discountType) {
      toast.showError("Please select a discount type");
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isEditMode && startDate < today) {
      toast.showError("Start date cannot be in the past");
      return;
    }

    if (endDate <= startDate) {
      toast.showError("End date must be after start date");
      return;
    }

    // Validate discount amount
    const discountAmount = parseFloat(formData.discountAmount);
    if (isNaN(discountAmount) || discountAmount <= 0) {
      toast.showError("Discount amount must be a positive number");
      return;
    }

    // Validate max discount amount if provided
    if (formData.maxDiscountAmount) {
      const maxDiscount = parseFloat(formData.maxDiscountAmount);
      if (isNaN(maxDiscount) || maxDiscount <= 0) {
        toast.showError("Max discount amount must be a positive number");
        return;
      }
      if (
        formData.discountType === "percentage" &&
        maxDiscount < discountAmount
      ) {
        toast.showError(
          "Max discount amount should be greater than discount amount"
        );
        return;
      }
    }

    // Validate min order amount if provided
    if (formData.minOrderAmount) {
      const minOrder = parseFloat(formData.minOrderAmount);
      if (isNaN(minOrder) || minOrder <= 0) {
        toast.showError("Min order amount must be a positive number");
        return;
      }
    }

    try {
      // Convert dates to ISO 8601 format
      const startDateISO = new Date(formData.startDate).toISOString();
      const endDateISO = new Date(
        formData.endDate + "T23:59:59Z"
      ).toISOString();

      if (isEditMode) {
        // Map discountType to API enum values
        const discountTypeMap = {
          percentage: "Percentage",
          flat: "Fixed",
        };
        const apiDiscountType =
          discountTypeMap[formData.discountType] || formData.discountType;

        // Update coupon - include all fields
        const payload = {
          code: formData.code.toUpperCase().trim(),
          name: formData.title.trim(),
          description: formData.description.trim(),
          discountType: apiDiscountType,
          discountValue: discountAmount,
          startDate: startDateISO,
          endDate: endDateISO,
        };

        // Add optional fields if provided
        if (formData.maxDiscountAmount) {
          payload.maxDiscountAmount = parseFloat(formData.maxDiscountAmount);
        }

        if (formData.minOrderAmount) {
          payload.minOrderAmount = parseFloat(formData.minOrderAmount);
        }

        const response = await updateCoupon({
          couponCode: formData.code.toUpperCase().trim(),
          data: payload,
        }).unwrap();

        if (response?.success) {
          toast.showSuccess(response.message || "Coupon updated successfully!");
          router.push("/seller/coupon");
        } else {
          toast.showError(response?.message || "Failed to update coupon");
        }
      } else {
        // Create coupon
        // Get shopId from localStorage
        const shopId = localStorage.getItem("shop");
        if (!shopId) {
          toast.showError("Shop information not available. Please try again.");
          return;
        }

        // Map discountType to API enum values
        const discountTypeMap = {
          percentage: "Percentage",
          flat: "Flat",
        };
        const apiDiscountType =
          discountTypeMap[formData.discountType] || formData.discountType;

        // Prepare API payload
        const payload = {
          code: formData.code.toUpperCase().trim(),
          shopId: shopId,
          discountType: apiDiscountType,
          discountValue: discountAmount,
          name: formData.title.trim(),
          description: formData.description.trim(),
          startDate: startDateISO,
          endDate: endDateISO,
        };

        // Add optional fields if provided
        if (formData.maxDiscountAmount) {
          payload.maxDiscountAmount = parseFloat(formData.maxDiscountAmount);
        }

        if (formData.minOrderAmount) {
          payload.minOrderAmount = parseFloat(formData.minOrderAmount);
        }

        const response = await createCoupon({ data: payload }).unwrap();

        if (response?.success) {
          toast.showSuccess(response.message || "Coupon created successfully!");
          // Reset form
          handleCancel();
          // Navigate back to coupons list
          router.push("/seller/coupon");
        } else {
          toast.showError(response?.message || "Failed to create coupon");
        }
      }
    } catch (error) {
      console.error(
        isEditMode ? "Update coupon error:" : "Create coupon error:",
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
            ? "Failed to update coupon. Please try again."
            : "Failed to create coupon. Please try again.");
        toast.showError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      code: "",
      discountType: "",
      discountAmount: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="">
      <div className="">
        <h1 className="text-3xl font-semibold mb-8">
          {isEditMode ? "Edit Coupon" : "Add Coupon"}
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Coupon Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Coupon Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter coupon Title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Coupon Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                Coupon Description<span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                placeholder="Enter coupon Description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-base">
                Coupon Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Enter coupon code"
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                className="h-12"
                disabled={isLoading || isEditMode}
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-2 w-full">
              <Label htmlFor="discountType" className="text-base">
                Discount Type
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) =>
                  handleInputChange("discountType", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Amount */}
            <div className="space-y-2">
              <Label htmlFor="discountAmount" className="text-base">
                Discount Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="discountAmount"
                placeholder="Enter discount amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.discountAmount}
                onChange={(e) =>
                  handleInputChange("discountAmount", e.target.value)
                }
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Max Discount Amount (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="maxDiscountAmount" className="text-base">
                Max Discount Amount
              </Label>
              <Input
                id="maxDiscountAmount"
                placeholder="Enter max discount amount (optional)"
                type="number"
                step="0.01"
                min="0"
                value={formData.maxDiscountAmount}
                onChange={(e) =>
                  handleInputChange("maxDiscountAmount", e.target.value)
                }
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Min Order Amount (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount" className="text-base">
                Min Order Amount
              </Label>
              <Input
                id="minOrderAmount"
                placeholder="Enter min order amount (optional)"
                type="number"
                step="0.01"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  handleInputChange("minOrderAmount", e.target.value)
                }
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-base">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                placeholder="mm/dd/yyyy"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-base">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                placeholder="mm/dd/yyyy"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="h-12"
                disabled={isLoading}
              />
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
