import { apiSlice } from './apiSlice';

export const requestApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRequests: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: `/requests?page=${page}&limit=${limit}`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Request'],
        }),
        createRequest: builder.mutation({
            query: (data) => ({
                url: '/requests',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Request'],
        }),
        updateRequest: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/requests/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Request'],
        }),
        deleteRequest: builder.mutation({
            query: (id) => ({
                url: `/requests/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Request'],
        }),
    }),
});

export const {
    useGetRequestsQuery,
    useCreateRequestMutation,
    useUpdateRequestMutation,
    useDeleteRequestMutation,
} = requestApiSlice;
