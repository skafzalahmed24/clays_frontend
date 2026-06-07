import { apiSlice } from './apiSlice';

const ATTRIBUTES_URL = '/attributes';

export const attributeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAttributes: builder.query({
            query: () => ATTRIBUTES_URL,
            providesTags: ['Attribute'],
            keepUnusedDataFor: 5,
        }),
        addAttribute: builder.mutation({
            query: (data) => ({
                url: ATTRIBUTES_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Attribute'],
        }),
        updateAttribute: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${ATTRIBUTES_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Attribute'],
        }),
        deleteAttribute: builder.mutation({
            query: (id) => ({
                url: `${ATTRIBUTES_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Attribute'],
        }),
    }),
});

export const {
    useGetAttributesQuery,
    useAddAttributeMutation,
    useUpdateAttributeMutation,
    useDeleteAttributeMutation,
} = attributeApiSlice;
