import React from "react";
import ShopLayout from "../Shop/shopLayout";

function RecommendedProducts() {
  return (
    <div>
      <h2 className="text-3xl font-extrabold font-comfortaa px-4 md:px-32 py-10">
        Recommended Products
      </h2>
      <div className="">
        <ShopLayout />
      </div>
    </div>
  );
}

export default RecommendedProducts;
