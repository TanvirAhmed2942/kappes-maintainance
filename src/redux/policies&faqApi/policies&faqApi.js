import { api } from "../baseApi";

const policiesAndFaqApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFAQs: builder.query({
      query: () => {
        return {
          url: `/faq?type=for_website`,
          method: "GET",
        };
      },
      providesTags: ["FAQs"],
    }),
    getFAQsSeller: builder.query({
      query: () => {
        return {
          url: `/faq?type=for_seller`,
          method: "GET",
        };
      },
      providesTags: ["FAQsSeller"],
    }),
    getPrivacyPolicy: builder.query({
      query: () => {
        return {
          url: `/settings/privacy-policy`,
          method: "GET",
        };
      },
      providesTags: ["PrivacyPolicy"],
    }),
    getTermsAndConditions: builder.query({
      query: () => {
        return {
          url: `/settings/termsOfService`,
          method: "GET",
        };
      },
      providesTags: ["TermsAndConditions"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetFAQsQuery,
  useGetFAQsSellerQuery,
  useGetPrivacyPolicyQuery,
  useGetTermsAndConditionsQuery,
} = policiesAndFaqApi;
