import { apiSlice } from './apiSlice';

export const blogApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBlogs: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => `/blogs?page=${page}&limit=${limit}`,
            providesTags: ['Blog'],
            keepUnusedDataFor: 5,
        }),
        getBlogById: builder.query({
            query: (id) => `/blogs/${id}`,
            providesTags: ['Blog'],
            keepUnusedDataFor: 5,
        }),
        createBlog: builder.mutation({
            query: (data) => ({
                url: '/blogs',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Blog'],
        }),
        updateBlog: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/blogs/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Blog'],
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({
                url: `/blogs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Blog'],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogByIdQuery,
    useGetBlogByIdQuery: useGetBlogDetailsQuery, // Alias for compatibility
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogApiSlice;
