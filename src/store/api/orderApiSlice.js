import { apiSlice } from './apiSlice';

export const orderApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (data) => ({
                url: '/orders',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order'],
        }),
        getMyOrders: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: '/orders/myorders',
                params: { page, limit },
            }),
            providesTags: ['Order'],
            keepUnusedDataFor: 5,
        }),
        getOrders: builder.query({
            query: ({ search, status, page, limit }) => ({
                url: '/orders',
                params: { search, status, page, limit },
            }),
            providesTags: ['Order'],
            keepUnusedDataFor: 5,
        }),
        getOrderDetails: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: ['Order'],
            keepUnusedDataFor: 5,
        }),
        cancelOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/cancel`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order'],
        }),
        trackOrder: builder.mutation({
            query: (data) => ({
                url: '/orders/track',
                method: 'POST',
                body: data,
            }),
        }),
        deliverOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/deliver`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order'],
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/orders/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: ['Order'],
        }),
        // Add verifyPayment if needed, though usually standard axios might be used if external, 
        // but for internal callbacks use this.
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrdersQuery,
    useGetOrderDetailsQuery,
    useCancelOrderMutation,
    useTrackOrderMutation,
    useDeliverOrderMutation,
    useUpdateOrderStatusMutation,
} = orderApiSlice;
