import { api } from '../../baseApi';


const overviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: (id) => {
        return {
          url: `/shop/overview/${id}`,
          method: "GET",
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOverviewQuery,
} = overviewApi;
