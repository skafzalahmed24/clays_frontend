import { apiSlice } from './apiSlice';

export const wishlistApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWishlist: builder.query({
            query: () => '/users/wishlist',
            providesTags: ['Wishlist'],
            keepUnusedDataFor: 5,
        }),
        addToWishlist: builder.mutation({
            query: (data) => ({
                url: '/users/wishlist',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Wishlist'],
        }),
        removeFromWishlist: builder.mutation({
            query: (id) => ({
                url: `/users/wishlist/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Wishlist'],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = wishlistApiSlice;
