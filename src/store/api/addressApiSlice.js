import { apiSlice } from './apiSlice';

export const addressApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAddresses: builder.query({
            query: () => '/users/addresses',
            providesTags: ['Address'],
        }),
        addAddress: builder.mutation({
            query: (addressData) => ({
                url: '/users/addresses',
                method: 'POST',
                body: addressData,
            }),
            invalidatesTags: ['Address'],
        }),
        updateAddress: builder.mutation({
            query: ({ addressId, ...addressData }) => ({
                url: `/users/addresses/${addressId}`,
                method: 'PUT',
                body: addressData,
            }),
            invalidatesTags: ['Address'],
        }),
        deleteAddress: builder.mutation({
            query: (addressId) => ({
                url: `/users/addresses/${addressId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Address'],
        }),
        setDefaultAddress: builder.mutation({
            query: (addressId) => ({
                url: `/users/addresses/${addressId}/default`,
                method: 'PUT',
            }),
            invalidatesTags: ['Address'],
        }),
    }),
});

export const {
    useGetAddressesQuery,
    useAddAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useSetDefaultAddressMutation,
} = addressApiSlice;
