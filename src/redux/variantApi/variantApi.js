import { api } from "../baseApi";

const variantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createVariant: builder.mutation({
      query: (formData) => ({
        url: "/variant",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["variant"],
    }),
    getallVariant: builder.query({
      query: (subCategoryId) => {
        const params = new URLSearchParams();
        if (subCategoryId) {
          params.append("subCategoryId", subCategoryId);
        }
        const queryString = params.toString();
        return {
          url: `/variant${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["variant"],
    }),
    getVariantById: builder.query({
      query: (id) => {
        return {
          url: `/variant/single/${id}`,
        method: "GET",
        };
      },
      providesTags: ["variant"],
    }),
    updateVariant: builder.mutation({
      query: ({ id, data }) => {
        return {
          url: `/variant/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["variant"],
    }),
    deleteVariant: builder.mutation({
      query: (id) => {
        return {
          url: `/variant/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["variant"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateVariantMutation,
  useGetallVariantQuery,
  useGetVariantByIdQuery,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} = variantApi;
