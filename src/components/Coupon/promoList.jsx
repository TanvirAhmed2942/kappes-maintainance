"use client";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useGetCouponsQuery } from "../../redux/couponApi/couponApi";
import Image from "next/image";
import { getImageUrl } from "../../redux/baseUrl";
import PromoCodeModal from "./PromoCodeModal";

const PromoCodeList = () => {
  const { data: couponsData, isLoading, error } = useGetCouponsQuery();
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Format discount text
  const formatDiscount = (discountType, discountValue, maxDiscountAmount) => {
    if (!discountType || !discountValue) return "N/A";

    if (discountType === "Percentage") {
      const maxDiscount = maxDiscountAmount
        ? ` (Up to $${maxDiscountAmount})`
        : "";
      return `${discountValue}% Off${maxDiscount}`;
    } else if (discountType === "Fixed") {
      return `$${discountValue} Off`;
    }
    return "N/A";
  };

  // Map API response to UI structure
  const promos =
    couponsData?.success && couponsData?.data?.result
      ? couponsData.data.result.map((coupon) => {
          // Extract shop information if available
          const shop = coupon.shop || coupon.shopId;
          const shopLogo =
            shop?.logo || shop?.image || coupon.logo || coupon.image || null;
          const shopName =
            shop?.name ||
            shop?.storeName ||
            coupon.shopName ||
            "The Canuck Mall";

          return {
            id: coupon._id || "N/A",
            title: shopName,
            image: shopLogo || "/assets/logo.png", // Use shop logo if available, otherwise default logo
            expiry: formatDate(coupon.endDate),
            discount: formatDiscount(
              coupon.discountType,
              coupon.discountValue,
              coupon.maxDiscountAmount
            ),
            description: coupon.description || "N/A",
            code: coupon.code || "N/A",
            minOrderAmount: coupon.minOrderAmount || 0,
            maxDiscountAmount: coupon.maxDiscountAmount || 0,
            discountType: coupon.discountType || "N/A",
            discountValue: coupon.discountValue || 0,
            startDate: coupon.startDate || "N/A",
            endDate: coupon.endDate || "N/A",
            isActive: coupon.isActive ?? true,
          };
        })
      : [];

  const handleShowPromoCode = (promo) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 w-full">
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 w-full">
        <div className="flex justify-center items-center min-h-[200px] text-red-500">
          <p>Error loading coupons. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (promos.length === 0) {
    return (
      <div className="container mx-auto p-4 w-full">
        <div className="flex justify-center items-center min-h-[200px] text-gray-500">
          <p>No coupons available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 w-full">
      {promos.map((promo) => (
        <PromoCodeCard
          key={promo.id}
          promo={promo}
          onShowPromoCode={handleShowPromoCode}
        />
      ))}
      {selectedPromo && (
        <PromoCodeModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          promo={selectedPromo}
        />
      )}
    </div>
  );
};

const PromoCodeCard = ({ promo, onShowPromoCode }) => {
  return (
    <Card className="overflow-hidden mb-4 rounded-2xl shadow-sm border p-0">
      <div className="flex flex-col-reverse md:flex-row">
        {/* Left section */}
        <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {promo.image && promo.image !== "N/A" ? (
              <Image
                src={
                  promo.image?.startsWith("http")
                    ? promo.image
                    : `${getImageUrl}${promo.image}`
                }
                alt={promo.title || "Shop logo"}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                N/A
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-base font-medium text-gray-900 font-comfortaa">
                {promo.title || "N/A"}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Expires: {promo.expiry}</span>
              </div>

              <h2 className="text-lg font-bold font-comfortaa mt-2">
                {promo.discount}{" "}
                {promo.minOrderAmount > 0 &&
                  `(Min order: $${promo.minOrderAmount})`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {promo.description}
              </p>
            </div>

            {/* Promo Code */}
            <div className="mt-3">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onShowPromoCode(promo)}
                disabled={promo.code === "N/A"}
              >
                Show Promo Code
              </Button>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="bg-red-700 flex md:w-32 w-full justify-center items-center p-6 md:rounded-none rounded-b-2xl md:rounded-r-2xl md:rounded-l-none">
          <div className="bg-white rounded-full p-3">
            <Image
              src="/assets/logo.png"
              alt="logo"
              width={64}
              height={64}
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PromoCodeList;
