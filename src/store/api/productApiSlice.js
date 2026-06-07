import { apiSlice } from './apiSlice';

export const productApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({

            query: ({ keyword = '', pageNumber = 1, category, subCategory, collection, color, material, occasion, isFeatured, isNewArrival, minPrice, maxPrice, sort, limit, isOnOffer } = {}) => ({
                url: '/products',
                params: {
                    search: keyword,
                    page: pageNumber,
                    limit,
                    category,
                    subCategory,
                    collection,
                    'attributes.color': color,
                    'attributes.material': material,
                    'attributes.occasion': occasion,
                    isFeatured,
                    isNewArrival,
                    minPrice,
                    maxPrice,
                    sort,
                    isOnOffer // Pass isOnOffer
                },
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Product'],
        }),
        getProductDetails: builder.query({
            query: (productId) => ({
                url: `/products/${productId}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createProduct: builder.mutation({
            query: (data) => ({
                url: '/products',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation({
            query: ({ data, productId }) => ({
                url: `/products/${productId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Product'],
        }),
        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `/products/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
        createReview: builder.mutation({
            query: ({ rating, comment, productId }) => ({
                url: `/products/${productId}/reviews`,
                method: 'POST',
                body: { rating, comment },
            }),
            invalidatesTags: ['Product'],
        }),
        updateReview: builder.mutation({
            query: ({ rating, comment, productId }) => ({
                url: `/products/${productId}/reviews`,
                method: 'PUT',
                body: { rating, comment },
            }),
            invalidatesTags: ['Product'],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductDetailsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useCreateReviewMutation,
    useUpdateReviewMutation,
} = productApiSlice;
