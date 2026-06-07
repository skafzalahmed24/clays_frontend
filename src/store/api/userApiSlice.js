import { apiSlice } from './apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: (params) => ({
                url: '/users',
                params,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['User'],
        }),
        getUserDetails: builder.query({
            query: (id) => ({
                url: `/users/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserDetailsQuery,
} = userApiSlice;
