"use client";
import BusinessListingForm from "../../components/BusinessListing/businessListing";
import { withAuth } from "../../Providers/AuthGuard";
import React from "react";

function BusinessListingPage() {
  return (
    <>
      <BusinessListingForm />
    </>
  );
}

export default withAuth(BusinessListingPage);
