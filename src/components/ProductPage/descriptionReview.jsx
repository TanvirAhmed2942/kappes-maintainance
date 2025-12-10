"use client";
import React, { useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import ReviewAndFeedback from "./reviewAndFeedback";
import useProductDetails from "../../hooks/useProductDetails";
import useProductVariantSelection from "../../hooks/useProductVariantSelection";

function DescriptionReview() {
  const { productDetails, isLoading } = useProductDetails();

  // Get selected variant to show variant-specific description
  const { selectedVariant, initializeVariantSelection } =
    useProductVariantSelection(productDetails);

  // Initialize variant selection when product details load
  useEffect(() => {
    if (productDetails) {
      initializeVariantSelection();
    }
  }, [productDetails, initializeVariantSelection]);

  // Get description - prefer variant description over product description
  const variantDescription = selectedVariant?.variantId?.description;
  const productDescription = productDetails?.description;

  // Get variant details for display
  const variantDetails = selectedVariant?.variantId
    ? {
        identifier: selectedVariant.variantId.identifier,
        material: selectedVariant.variantId.material,
        size: selectedVariant.variantId.size,
        weight: selectedVariant.variantId.weight,
        dimensions: selectedVariant.variantId.dimensions,
        stock: selectedVariant.variantQuantity,
        price: selectedVariant.variantPrice,
      }
    : null;

  return (
    <div className="px-4 lg:px-32">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-red-700">
          <TabsTrigger
            value="description"
            className="data-[state=active]:text-black data-[state=inactive]:text-white"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="review"
            className="data-[state=active]:text-black data-[state=inactive]:text-white"
          >
            Review ({productDetails?.totalReviews || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description">
          <ProductDescription
            productDescription={productDescription}
            variantDescription={variantDescription}
            variantDetails={variantDetails}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="review">
          <ReviewAndFeedback />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DescriptionReview;

const ProductDescription = ({
  productDescription,
  variantDescription,
  variantDetails,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 w-full">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      {/* Product Description */}
      <h2 className="text-lg font-semibold">Product Description</h2>
      <div className="mt-2 text-gray-700">
        {productDescription ? (
          <p className="whitespace-pre-line">{productDescription}</p>
        ) : (
          <p>No description available for this product.</p>
        )}
      </div>

      {/* Variant Description (if different from product) */}
      {variantDescription && variantDescription !== productDescription && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Variant Details</h2>
          <div className="mt-2 text-gray-700">
            <p className="whitespace-pre-line">{variantDescription}</p>
          </div>
        </div>
      )}

      {/* Variant Specifications */}
      {/* {variantDetails && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">
            Selected Variant Specifications
          </h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            {variantDetails.identifier && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Variant</p>
                <p className="font-medium">{variantDetails.identifier}</p>
              </div>
            )}
            {variantDetails.price && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium text-red-600">
                  ${variantDetails.price}
                </p>
              </div>
            )}
            {variantDetails.stock !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">In Stock</p>
                <p
                  className={`font-medium ${
                    variantDetails.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {variantDetails.stock > 0
                    ? `${variantDetails.stock} units`
                    : "Out of Stock"}
                </p>
              </div>
            )}
            {variantDetails.material && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Material</p>
                <p className="font-medium">{variantDetails.material}</p>
              </div>
            )}
            {variantDetails.size && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-medium">{variantDetails.size}</p>
              </div>
            )}
            {variantDetails.weight && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium">{variantDetails.weight}</p>
              </div>
            )}
            {variantDetails.dimensions && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Dimensions</p>
                <p className="font-medium">{variantDetails.dimensions}</p>
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
};
