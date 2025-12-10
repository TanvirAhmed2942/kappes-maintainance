import { api } from "../../baseApi";

const CategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategory: builder.query({
      query: () => {
        return {
          url: `/category`,
          method: "GET",
        };
      },
      providesTags: ["category"],
    }),

    getCategoryById: builder.query({
      query: (id) => {
        return {
          url: `/category/single/${id}`,
          method: "GET",
        };
      },
      providesTags: ["category"],
    }),

    getAllSubCategoryOfCategory: builder.query({
      query: (id) => {
        return {
          url: `/category/subcategory/${id}`,
          method: "GET",
        };
      },
      providesTags: ["category"],
    }),

    createCategory: builder.mutation({
      query: (data) => {
        return {
          url: `/category/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["category"],
    }),

    updateCetgory: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/category/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["category"],
    }),

    updateCetgoryStatus: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/category/${id}`,
          method: "PUT",
          body: data,
        };
      },
      invalidatesTags: ["category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => {
        return {
          url: `/category/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["category"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllCategoryQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCetgoryMutation,
  useUpdateCetgoryStatusMutation,
  useDeleteCategoryMutation,
} = CategoryApi;
