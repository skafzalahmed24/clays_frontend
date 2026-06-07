import { apiSlice } from './apiSlice';

export const couponApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCoupons: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `/coupons?page=${page}&limit=${limit}`,
            providesTags: ['Coupon'],
        }),
        createCoupon: builder.mutation({
            query: (data) => ({
                url: '/coupons',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Coupon'],
        }),
        deleteCoupon: builder.mutation({
            query: (id) => ({
                url: `/coupons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Coupon'],
        }),
        validateCoupon: builder.mutation({
            query: (data) => ({
                url: '/coupons/validate',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetCouponsQuery,
    useCreateCouponMutation,
    useDeleteCouponMutation,
    useValidateCouponMutation,
} = couponApiSlice;
