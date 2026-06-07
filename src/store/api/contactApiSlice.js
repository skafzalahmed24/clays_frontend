import { apiSlice } from './apiSlice';

export const contactApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitContact: builder.mutation({
            query: (data) => ({
                url: '/contact',
                method: 'POST',
                body: data,
            }),
        }),
        getContacts: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `/contact?page=${page}&limit=${limit}`,
            providesTags: ['Contact'],
        }),
        getContactById: builder.query({
            query: (id) => `/contact/${id}`,
            providesTags: ['Contact'],
        }),
        deleteContact: builder.mutation({
            query: (id) => ({
                url: `/contact/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Contact'],
        }),
    }),
});

export const {
    useSubmitContactMutation,
    useGetContactsQuery,
    useGetContactByIdQuery,
    useDeleteContactMutation,
} = contactApiSlice;
