import { apiSlice } from './apiSlice';

export const analyticsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardStats: builder.query({
            query: () => '/analytics/dashboard',
            keepUnusedDataFor: 5,
        }),
        getSalesData: builder.query({
            query: () => '/analytics/sales',
            keepUnusedDataFor: 5,
        }),
    }),
});

export const { useGetDashboardStatsQuery, useGetSalesDataQuery } = analyticsApiSlice;
