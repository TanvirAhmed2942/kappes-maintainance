import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import {
  useGetBusinessListQuery,
  useGetBusinessByIdQuery,
  useSendMessageMutation,
} from "../redux/servicesApi/servicsApi";
import {
  setServices,
  setSelectedService,
  clearSelectedService,
  setLoading,
  setError,
} from "../features/servieSlice/serviceSlice";

const useService = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  // Get state from Redux
  const { services, selectedService, isLoading, error, meta } = useSelector(
    (state) => state.service
  );

  // Fetch individual business by ID if ID is present
  const {
    data: businessData,
    error: businessError,
    isLoading: businessLoading,
    refetch: refetchBusiness,
  } = useGetBusinessByIdQuery(id, { skip: !id });

  // Fetch services list query (for list pages)
  const {
    data: servicesData,
    error: apiError,
    isLoading: apiLoading,
    refetch,
  } = useGetBusinessListQuery(undefined, { skip: !!id }); // Skip if we have an ID

  // Effect to handle individual business data
  useEffect(() => {
    if (id) {
      // Set loading state
      dispatch(setLoading(businessLoading));

      // Handle API errors
      if (businessError) {
        dispatch(
          setError(
            businessError?.data?.message ||
              businessError?.message ||
              "Failed to fetch business details"
          )
        );
      }

      // Process successful business data response
      if (businessData && businessData.success && businessData.data) {
        try {
          // Set the selected service directly from API response
          dispatch(setSelectedService(businessData.data));
        } catch (error) {
          dispatch(setError("Error processing business data"));
          console.error("Business data processing error:", error);
        }
      }
    }
  }, [businessData, businessError, businessLoading, id, dispatch]);

  // Effect to handle services list data (when no ID)
  useEffect(() => {
    if (!id) {
      // Set loading state
      dispatch(setLoading(apiLoading));

      // Handle API errors
      if (apiError) {
        dispatch(setError(apiError.message || "Failed to fetch services"));
      }

      // Process successful data response
      if (servicesData && servicesData.success) {
        try {
          // Dispatch the entire response data to the reducer
          dispatch(setServices(servicesData.data));
        } catch (error) {
          dispatch(setError("Error processing services data"));
          console.error("Services data processing error:", error);
        }
      }
    }
  }, [servicesData, apiError, apiLoading, id, dispatch]);

  const [sendMessage, { isLoading: isSending, error: sendError }] =
    useSendMessageMutation();

  const handleSendMessage = async (data) => {
    // Ensure serviceId is provided
    if (!data.serviceId) {
      throw new Error("Service ID is required to send a message");
    }

    try {
      const response = await sendMessage({
        data: {
          message: data.message,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
        },
        businessId: data.serviceId, // Note: API still expects businessId
      }).unwrap();

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return {
    // Raw services list
    services,

    // Selected service details
    selectedService,

    // Loading and error states
    isLoading: id ? businessLoading : isLoading,
    error: error || (id ? businessError : apiError),

    // Metadata
    meta,

    // Utility functions
    refetch: id ? refetchBusiness : refetch,

    // Convenience checks
    hasServices: services.length > 0,
    isServiceSelected: !!selectedService,

    // Send message
    sendMessage,
    isSending,
    sendError,
    handleSendMessage,
  };
};

export default useService;
