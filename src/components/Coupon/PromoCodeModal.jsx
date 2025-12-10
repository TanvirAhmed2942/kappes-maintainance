"use client";
import { Copy, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { getImageUrl } from "../../redux/baseUrl";

const PromoCodeModal = ({ open, onOpenChange, promo }) => {
  if (!promo) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      toast.success("Promo code copied!", {
        description: `${promo.code} has been copied to your clipboard.`,
        duration: 3000,
      });
    } catch (err) {
      // Fallback for older browsers or if clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = promo.code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Promo code copied!", {
          description: `${promo.code} has been copied to your clipboard.`,
          duration: 3000,
        });
      } catch (fallbackErr) {
        toast.error("Failed to copy promo code");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleContinue = () => {
    // Close modal and potentially navigate to shop or continue shopping
    onOpenChange(false);
    // You can add navigation logic here if needed
  };

  // Get image source - use promo image if available, otherwise use default logo
  const getImageSrc = () => {
    if (!promo.image || promo.image === "N/A") {
      return "/assets/logo.png";
    }

    // If it's already a full URL, use it directly
    if (promo.image.startsWith("http")) {
      return promo.image;
    }

    // If it starts with /, it's a relative path from the API
    if (promo.image.startsWith("/")) {
      return `${getImageUrl}${promo.image}`;
    }

    // Otherwise, prepend the image URL
    return `${getImageUrl}${
      promo.image.startsWith("/") ? promo.image : `/${promo.image}`
    }`;
  };

  const imageSrc = getImageSrc();
  const shopName =
    promo.title && promo.title !== "N/A" ? promo.title : "THE CANUCK MALL";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {promo.discount} promo code from {shopName}
        </DialogTitle>
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Red Strip with Logo */}

          {/* Right Section - Offer Details */}
          <div className="flex-1 p-6 md:p-8">
            <DialogDescription className="sr-only">
              {promo.discount} promo code from {shopName}
            </DialogDescription>
            <div className="flex items-center justify-center p-6 w-full gap-4">
              <Image
                src={imageSrc}
                alt={shopName}
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {promo.discount} promo code
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  {promo.description ||
                    "Shop a Wide Range of Products Across All Categories at The Canuck Mall."}
                </p>
              </div>
            </div>

            {/* Promo Code Display */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant="outline"
                  className="bg-gray-50 border-dashed border-gray-400 text-gray-900 px-4 py-3 text-lg font-bold flex-1"
                >
                  {promo.code !== "N/A" ? promo.code : "N/A"}
                </Badge>
                {promo.code !== "N/A" && (
                  <Button
                    onClick={handleCopyCode}
                    className="bg-red-700 hover:bg-red-800 text-white px-4 py-3 h-13"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-900 font-bold mt-2">
                Enter this code at checkout
              </p>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              className="w-full bg-transparent hover:bg-gray-50 text-red-700 font-bold text-lg py-3 border-0 flex items-center justify-center shadow-none gap-2"
            >
              Continue to {shopName.toUpperCase()}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeModal;
