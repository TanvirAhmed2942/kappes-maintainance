"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Star, Upload, X } from "lucide-react";
import { useAddReviewMutation } from "../../redux/reviewApi/reviewApi";
import useToast from "../../hooks/useShowToast";
import Image from "next/image";

function ReviewModal({ isOpen, onClose, productId }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [addReview, { isLoading }] = useAddReviewMutation();
  const { showSuccess, showError } = useToast();

  // Handle star rating click
  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  // Handle star rating hover
  const handleStarHover = (starValue) => {
    setHoverRating(starValue);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Please select only image files");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Image size should be less than 5MB");
        return;
      }

      setImages((prev) => [...prev, file]);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = "";
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (rating === 0) {
      showError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      showError("Please write a comment");
      return;
    }

    if (!productId) {
      showError("Product ID is missing");
      return;
    }

    try {
      const formData = new FormData();

      // Add review data
      const reviewData = {
        refferenceId: productId,
        rating: rating,
        comment: comment.trim(),
        review_type: "Product",
      };

      formData.append("data", JSON.stringify(reviewData));

      // Add images
      images.forEach((image) => {
        formData.append("image", image);
      });

      const response = await addReview(formData).unwrap();

      if (response.success) {
        showSuccess(response.message || "Review submitted successfully!");
        handleCancel(); // Reset form and close modal
      } else {
        showError(response.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      showError(
        error?.data?.message || "Failed to submit review. Please try again."
      );
    }
  };

  // Handle cancel/close
  const handleCancel = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setImages([]);
    setImagePreviews([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`cursor-pointer transition-colors ${
                    star <= (hoverRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
              </span>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comment <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Tell us about your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500 characters
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Images (Optional)</label>
            <div className="space-y-3">
              <input
                type="file"
                id="review-images"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
              <label
                htmlFor="review-images"
                className="flex items-center justify-center h-32 px-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <span className="text-gray-500">
                    Click to upload images (Max 5MB each)
                  </span>
                </div>
              </label>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden border border-gray-200"
                    >
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReviewModal;
