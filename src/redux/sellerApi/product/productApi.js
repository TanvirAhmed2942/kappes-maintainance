import { api } from "../../baseApi";

const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllProduct: builder.query({
      query: (id, searchTerm) => {
        const url = searchTerm
          ? `/product/shop/${id}?searchTerm=${searchTerm}`
          : `/product/shop/${id}`;

        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => {
        return {
          url: `/product/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation({
      query: (data) => {
        return {
          url: `/product/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ data, productId }) => {
        return {
          url: `/product/${productId}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (productId) => {
        return {
          url: `/product/${productId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Product"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
} = productApi;
