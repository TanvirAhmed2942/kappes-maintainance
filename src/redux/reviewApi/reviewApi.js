import { api } from "../baseApi";

const reviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addReview: builder.mutation({
      query: (reviewData) => ({
        url: `/review/product`,
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, arg) => {
        // Extract product ID from the form data or result
        let productId = null;

        if (arg instanceof FormData) {
          try {
            const data = JSON.parse(arg.get("data"));
            productId = data.product;
          } catch (e) {
            console.error("Error parsing form data:", e);
          }
        } else if (arg?.product) {
          productId = arg.product;
        }

        return [{ type: "Product", id: productId }, "ProductReviews"];
      },
    }),
    getProductReviews: builder.query({
      query: (productId) => ({
        url: `/review/product/${productId}`,
        method: "GET",
      }),
      providesTags: (result, error, productId) => [
        { type: "ProductReviews", id: productId },
        "ProductReviews",
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useAddReviewMutation, useGetProductReviewsQuery } = reviewApi;
