"use client";
import React, { useEffect } from "react";
import { useGetPrivacyPolicyQuery } from "../../redux/policies&faqApi/policies&faqApi";
import useToast from "../../hooks/useShowToast";

function PrivacyPolicy() {
  const { data: privacyPolicy, isLoading, error } = useGetPrivacyPolicyQuery();
  const toast = useToast();

  useEffect(() => {
    if (error) {
      let errorMessage = "Failed to fetch Privacy Policy";

      if (error.data?.errorMessages && error.data.errorMessages.length > 0) {
        errorMessage = error.data.errorMessages[0].message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.showError("Failed to fetch Privacy Policy: " + errorMessage);
    }
  }, [error, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  // console.log("privacyPolicy", privacyPolicy);
  return (
    <div className="px-8 sm:px-14 md:px-20 lg:px-32 py-10 min-h-screen">
      <h2 className="text-2xl md:text-3xl lg:text-4xl  text-center mb-10 font-comfortaa font-extrabold md:leading-14">
        Privacy Policy
      </h2>
      <div>
        <div dangerouslySetInnerHTML={{ __html: privacyPolicy?.data }} />
      </div>
    </div>
  );
}

export default PrivacyPolicy;
