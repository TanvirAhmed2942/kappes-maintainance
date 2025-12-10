import { api } from "../baseApi";

const servicesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    //shop-by-store page
    getBusinessList: builder.query({
      query: () => {
        return {
          url: `/business/all`,
          method: "GET",
        };
      },
    }),
    getBusinessById: builder.query({
      query: (businessId) => {
        return {
          url: `/business/${businessId}`,
          method: "GET",
        };
      },
    }),
    sendMessage: builder.mutation({
      query: ({ data, businessId }) => {
        return {
          url: `/business/message/${businessId}`, // Note: API endpoint uses businessId
          method: "POST",
          body: data,
        };
      },
    }),
    addBusiness: builder.mutation({
      query: ({ data }) => {
        return {
          url: `/business/create`,
          method: "POST",
          body: data,
          formData: true,
        };
      },
    }),
    verifyBusiness: builder.mutation({
      query: (data) => {
        return {
          url: `/business/verify-email`,
          method: "POST",
          body: data, // { email: string, oneTimeCode: number }
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    verifyBusinessEmail: builder.mutation({
      query: (data) => {
        return {
          url: `/business/verify-email`,
          method: "POST",
          body: data,
        };
      },
    }),
    resendBusinessOtp: builder.mutation({
      query: (data) => {
        return {
          url: `/business/resend-otp`,
          method: "POST",
          body: data,
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBusinessListQuery,
  useGetBusinessByIdQuery,
  useSendMessageMutation,
  useAddBusinessMutation,
  useVerifyBusinessMutation,
  useVerifyBusinessEmailMutation,
  useResendBusinessOtpMutation,
} = servicesApi;
