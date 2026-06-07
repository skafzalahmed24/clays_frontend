import { apiSlice } from './apiSlice';

export const cartApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCart: builder.query({
            query: () => '/users/cart',
            providesTags: ['Cart'],
            keepUnusedDataFor: 5,
        }),
        addToCart: builder.mutation({
            query: (data) => ({
                url: '/users/cart',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Cart'],
        }),
        removeFromCart: builder.mutation({
            query: (id) => ({
                url: `/users/cart/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),
        // Ensure guest cart merge or other logic if backend supports it
        // For now mirroring existing endpoints
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
} = cartApiSlice;
