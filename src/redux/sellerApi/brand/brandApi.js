import { api } from "../../baseApi";

const brandApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllBrand: builder.query({
      query: () => {
        return {
          url: `/brand`,
          method: "GET",
        };
      },
      providesTags: ["brand"],
    }),

    getBrandById: builder.query({
      query: (id) => {
        return {
          url: `/brand/single/${id}`,
          method: "GET",
        };
      },
      providesTags: ["brand"],
    }),

    createBrand: builder.mutation({
      query: (data) => {
        return {
          url: `/brand/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["brand"],
    }),

    updateCetgory: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/brand/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["brand"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => {
        return {
          url: `/brand/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["brand"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllBrandQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateCetgoryMutation,
  useDeleteCategoryMutation,
} = brandApi;
