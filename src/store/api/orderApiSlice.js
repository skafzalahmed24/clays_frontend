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
        getRazorpayConfig: builder.query({
            query: () => '/config/razorpay',
        }),
        createRazorpayOrder: builder.mutation({
            query: (orderId) => ({
                url: `/orders/${orderId}/razorpay-order`,
                method: 'POST',
            }),
        }),
        verifyRazorpayPayment: builder.mutation({
            query: ({ orderId, ...data }) => ({
                url: `/orders/${orderId}/razorpay-verify`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Order'],
        }),
        createDelhiveryShipment: builder.mutation({
            query: (id) => ({
                url: `/orders/${id}/shipment`,
                method: 'POST',
            }),
            invalidatesTags: ['Order'],
        }),
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
    useGetRazorpayConfigQuery,
    useCreateRazorpayOrderMutation,
    useVerifyRazorpayPaymentMutation,
    useCreateDelhiveryShipmentMutation,
} = orderApiSlice;
