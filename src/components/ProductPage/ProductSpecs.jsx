"use client";
import React from "react";
import { Card } from "../../components/ui/card";
import { getVariantSpecs } from "../../utils/productUtils";

// Allowed variant fields that should be displayed in specifications
// This matches the VARIANT_FIELDS from AddEditSubCategory.jsx
const ALLOWED_VARIANT_FIELDS = [
  "color",
  "storage",
  "ram",
  "network_type",
  "operating_system",
  "storage_type",
  "processor_type",
  "processor",
  "graphics_card_type",
  "graphics_card_size",
  "screen_size",
  "resolution",
  "lens_kit",
  "material",
  "flavour",
  "size",
  "fabric",
  "weight",
  "volume",
  "dimensions",
  "capacity",
];

// This component displays product specifications based on available data in slugDetails and variants
const ProductSpecs = ({ productDetails, selectedVariant = null }) => {
  if (!productDetails) {
    return null;
  }

  // Get specifications from selected variant if available
  const allVariantSpecs = selectedVariant
    ? getVariantSpecs(selectedVariant)
    : {};

  // Filter to only show allowed variant fields
  const variantSpecs = {};
  Object.keys(allVariantSpecs).forEach((key) => {
    if (ALLOWED_VARIANT_FIELDS.includes(key)) {
      variantSpecs[key] = allVariantSpecs[key];
    }
  });

  const slugDetails = productDetails.slugDetails || {};

  console.log("slugDetails", slugDetails);
  // Format specification values for display
  const formatSpecValue = (key, value) => {
    // Special handling for color
    if (key === "color") {
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: value.code }}
            title={value.name}
          />
          <span>{value.name}</span>
        </div>
      );
    }

    // Uppercase for certain specifications
    const uppercaseKeys = ["size", "ram", "storage", "network_type"];
    if (uppercaseKeys.includes(key)) {
      return typeof value === "string" ? value.toUpperCase() : value;
    }

    // Capitalize first letter for other specs
    return typeof value === "string"
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;
  };

  // Combine variant specs and slug details for display
  const getDisplaySpecs = () => {
    const specs = [];

    // Add variant-specific specs first (these take priority)
    Object.entries(variantSpecs).forEach(([key, value]) => {
      if (value) {
        specs.push({
          key,
          value: formatSpecValue(key, value),
          isVariant: true,
        });
      }
    });

    // Add additional details from slug details (only allowed fields)
    Object.entries(slugDetails).forEach(([key, values]) => {
      // Only show allowed variant fields and skip if already added as a variant spec
      const skipKeys = ["categoryId", "subCategoryId", "color"];
      if (
        ALLOWED_VARIANT_FIELDS.includes(key) &&
        !variantSpecs[key] &&
        !skipKeys.includes(key)
      ) {
        specs.push({
          key,
          value: Array.isArray(values) ? values.join(", ") : values,
          isVariant: false,
        });
      }
    });

    return specs;
  };

  const displaySpecs = getDisplaySpecs();

  // If no specs to display, return null
  if (displaySpecs.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displaySpecs.map((spec, index) => (
            <div
              key={index}
              className={`flex justify-between p-2 rounded-md ${
                spec.isVariant ? "bg-gray-100 font-semibold" : "bg-white"
              }`}
            >
              <span className="text-gray-600 capitalize">
                {spec.key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </span>
              <span>{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProductSpecs;
