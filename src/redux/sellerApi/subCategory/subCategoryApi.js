import { api } from '../../baseApi';

const subCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllSubCategory: builder.query({
      query: () => {
        return {
          url: `/subcategory`,
          method: "GET",
        };
      },
      providesTags: ['subcategory'],
    }),

    getSubCategoryById: builder.query({
      query: (id) => {
        return {
          url: `/subcategory/single/${id}`,
          method: "GET",
        };
      },
      providesTags: ['subcategory'],
    }),

    getSubCategoryReletedToCategory: builder.query({
      query: (id) => {
        return {
          url: `/subcategory/${id}`,
          method: "GET",
        };
      },
      providesTags: ['subcategory'],
    }),

    createSubcategory: builder.mutation({
      query: (data) => {
        return {
          url: `/subcategory/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ['subcategory'],
    }),

    updateSubcategory: builder.mutation({
      query: ({ data, id }) => {
        return {
          url: `/subcategory/${id}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ['subcategory'],
    }),

    deleteSubcategory: builder.mutation({
      query: (id) => {
        return {
          url: `/subcategory/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ['subcategory'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllSubCategoryQuery,
  useGetSubCategoryByIdQuery,
  useGetSubCategoryReletedToCategoryQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subCategoryApi;