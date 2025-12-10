"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToggleAdvertisementMutation } from "../../redux/advertisement/advertisementApi";
import { toast } from "sonner";

export default function AdvertisementModal({ open, onOpenChange }) {
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [toggleAdvertisement, { isLoading }] = useToggleAdvertisementMutation();

  const handleSend = async () => {
    setError(""); // Clear previous errors

    if (!expiryDate) {
      setError("Please enter an expiry date");
      return;
    }

    // Validate MM/DD/YYYY format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(expiryDate)) {
      setError("Please enter date in MM/DD/YYYY format");
      return;
    }

    // Parse date components
    const [month, day, year] = expiryDate.split("/").map(Number);

    // Validate month (1-12)
    if (month < 1 || month > 12) {
      setError("Invalid month. Please enter a month between 01 and 12");
      return;
    }

    // Validate year (reasonable range)
    if (year < 2024 || year > 2100) {
      setError("Invalid year. Please enter a year between 2024 and 2100");
      return;
    }

    // Days in each month (0 index, so month-1)
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Check for leap year
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (isLeapYear) {
      daysInMonth[1] = 29; // February has 29 days in leap year
    }

    // Validate day for the given month
    if (day < 1 || day > daysInMonth[month - 1]) {
      setError(
        `Invalid day. ${getMonthName(month)} can only have ${
          daysInMonth[month - 1]
        } days`
      );
      return;
    }

    // Create date object and validate it's a real date
    const selectedDate = new Date(year, month - 1, day);
    if (
      selectedDate.getFullYear() !== year ||
      selectedDate.getMonth() !== month - 1 ||
      selectedDate.getDate() !== day
    ) {
      setError("Invalid date. Please enter a valid date");
      return;
    }

    // Validate that date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Expiry date must be in the future");
      return;
    }

    // Get shopId from localStorage
    const shopId = localStorage.getItem("shop");
    if (!shopId) {
      toast.error("Shop ID not found. Please login again.");
      return;
    }

    // Convert MM/DD/YYYY to YYYY-MM-DD
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    try {
      const response = await toggleAdvertisement({
        shopId,
        data: { advertisedExpiresAt: formattedDate },
      }).unwrap();

      toast.success(
        "Advertisement enabled successfully! Redirecting to payment..."
      );

      // Redirect to Stripe checkout URL
      if (response?.data?.url) {
        window.location.href = response.data.url;
      }

      onOpenChange(false);
      setExpiryDate("");
      setError("");
    } catch (error) {
      console.error("Error toggling advertisement:", error);
      toast.error(
        error?.data?.message ||
          "Failed to enable advertisement. Please try again."
      );
    }
  };

  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1];
  };

  const handleCancel = () => {
    onOpenChange(false);
    setExpiryDate("");
    setError("");
  };

  const handleInputChange = (e) => {
    setError(""); // Clear error when user starts typing
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

    // Format as MM/DD/YYYY
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + "/" + value.slice(5, 9);
    }

    setExpiryDate(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
          <DialogDescription>
            Select an expiry date for your advertisement. The ad will be active
            until this date.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="expiry-date">Expiry Date (MM/DD/YYYY)</Label>
            <Input
              id="expiry-date"
              type="text"
              placeholder="MM/DD/YYYY"
              value={expiryDate}
              onChange={handleInputChange}
              maxLength={10}
              className={`w-full ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
