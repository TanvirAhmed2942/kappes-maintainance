"use client";
import Checkout from "../../components/CheckOut/checkout";
import { withAuth } from "../../Providers/AuthGuard"; 
import React from "react";

const CheckOutPage = () => {
  return <Checkout />;
}

export default withAuth(CheckOutPage, "USER");
