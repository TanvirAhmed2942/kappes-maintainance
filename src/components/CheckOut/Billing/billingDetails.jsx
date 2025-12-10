"use client";
import React, { useState } from "react";
import Address from "./address";
import OrderSummary from "./orderSummary";

function BillingDetails() {
  const [deliveryOption, setDeliveryOption] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Mobile: Stacked layout */}
      <div className="block md:hidden space-y-8 w-full py-6">
        <Address
          onDeliveryChange={setDeliveryOption}
          onPaymentChange={setPaymentMethod}
          onAddressChange={setShippingAddress}
        />
        <OrderSummary
          deliveryOption={deliveryOption}
          paymentMethod={paymentMethod}
          shippingAddress={shippingAddress}
        />
      </div>

      {/* Tablet and larger: Side-by-side layout */}
      <div className="hidden md:flex flex-col lg:flex-row gap-8 xl:gap-12 w-full py-8">
        <div className="lg:w-2/3">
          <Address
            onDeliveryChange={setDeliveryOption}
            onPaymentChange={setPaymentMethod}
            onAddressChange={setShippingAddress}
          />
        </div>
        <div className="lg:w-1/3">
          <OrderSummary
            deliveryOption={deliveryOption}
            paymentMethod={paymentMethod}
            shippingAddress={shippingAddress}
          />
        </div>
      </div>
    </div>
  );
}

export default BillingDetails;
