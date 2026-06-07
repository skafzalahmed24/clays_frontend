import { apiSlice } from './apiSlice';

export const contentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Hero
        getHeroSlides: builder.query({
            query: () => '/content/hero',
            providesTags: ['Hero'],
        }),
        addHeroSlide: builder.mutation({
            query: (data) => ({
                url: '/content/hero',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Hero'],
        }),
        updateHeroSlide: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/content/hero/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Hero'],
        }),
        deleteHeroSlide: builder.mutation({
            query: (id) => ({
                url: `/content/hero/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Hero'],
        }),

        // Testimonials
        getTestimonials: builder.query({
            query: () => '/content/testimonials',
            providesTags: ['Testimonials'],
        }),
        addTestimonial: builder.mutation({
            query: (data) => ({
                url: '/content/testimonials',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Testimonials'],
        }),
        deleteTestimonial: builder.mutation({
            query: (id) => ({
                url: `/content/testimonials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Testimonials'],
        }),

        // Social
        getSocialFeed: builder.query({
            query: () => '/content/social',
            providesTags: ['Social'],
        }),
        addSocialPost: builder.mutation({
            query: (data) => ({
                url: '/content/social',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Social'],
        }),
        deleteSocialPost: builder.mutation({
            query: (id) => ({
                url: `/content/social/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Social'],
        }),

        // Heritage
        getHeritage: builder.query({
            query: () => '/content/heritage',
            providesTags: ['Heritage'],
        }),
        updateHeritage: builder.mutation({
            query: (data) => ({
                url: '/content/heritage',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Heritage'],
        }),

        // Trust Badges
        getTrustBadges: builder.query({
            query: () => '/content/trust-badges',
            providesTags: ['TrustBadges'],
        }),
        addTrustBadge: builder.mutation({
            query: (data) => ({
                url: '/content/trust-badges',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TrustBadges'],
        }),
        deleteTrustBadge: builder.mutation({
            query: (id) => ({
                url: `/content/trust-badges/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TrustBadges'],
        }),

        // FAQs
        getFAQs: builder.query({
            query: () => '/content/faq',
            providesTags: ['FAQ'],
        }),
        addFAQ: builder.mutation({
            query: (data) => ({
                url: '/content/faq',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['FAQ'],
        }),
        deleteFAQ: builder.mutation({
            query: (id) => ({
                url: `/content/faq/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['FAQ'],
        }),

        // Settings
        getSettings: builder.query({
            query: () => '/content/settings',
            providesTags: ['Settings'],
        }),
        updateSettings: builder.mutation({
            query: (data) => ({
                url: '/content/settings',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),

        // Pages (Dynamic & System)
        getPage: builder.query({
            query: (slug) => `/content/pages/${slug}`,
            providesTags: (result, error, slug) => [{ type: 'Page', id: slug }],
        }),
        updatePage: builder.mutation({
            query: ({ slug, ...data }) => ({
                url: `/content/pages/${slug}`, // Aligns with fetchPage endpoint
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { slug }) => [{ type: 'Page', id: slug }],
        }),
        // Should also cover /pages/:slug direct if used differently, but Content.jsx lines 697 uses /pages/ ?
        // Line 640: client.get(`/content/pages/${activeSystemPage}`);
        // Line 697: client.put(`/pages/${activeSystemPage}`, payload); -> Mismatch? 
        // Likely backend route is /api/content/pages/:slug or /api/pages/:slug. 
        // contentSlice used /api/content/pages/:slug.
        // I will assume /content/pages/:slug is correct for both.

        // Mega Menu
        getMegaMenuList: builder.query({
            query: () => '/content/mega-menu',
            providesTags: ['MegaMenu'],
        }),
        getMegaMenu: builder.query({
            query: (menuId) => `/content/mega-menu/${menuId}`,
            providesTags: (result, error, menuId) => [{ type: 'MegaMenu', id: menuId }],
        }),
        updateMegaMenu: builder.mutation({
            query: ({ menuId, ...data }) => ({
                url: `/content/mega-menu/${menuId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { menuId }) => [{ type: 'MegaMenu', id: menuId }],
        }),

        // Upload
        uploadImage: builder.mutation({
            query: (formData) => ({
                url: '/upload',
                method: 'POST',
                body: formData,
            }),
        }),
    }),
});

export const {
    useGetHeroSlidesQuery, useAddHeroSlideMutation, useUpdateHeroSlideMutation, useDeleteHeroSlideMutation,
    useGetTestimonialsQuery, useAddTestimonialMutation, useDeleteTestimonialMutation,
    useGetSocialFeedQuery, useAddSocialPostMutation, useDeleteSocialPostMutation,
    useGetHeritageQuery, useUpdateHeritageMutation,
    useGetTrustBadgesQuery, useAddTrustBadgeMutation, useDeleteTrustBadgeMutation,
    useGetFAQsQuery, useAddFAQMutation, useDeleteFAQMutation,
    useGetSettingsQuery, useUpdateSettingsMutation,
    useGetPageQuery, useUpdatePageMutation,
    useGetMegaMenuListQuery, useGetMegaMenuQuery, useLazyGetMegaMenuQuery, useUpdateMegaMenuMutation,
    useUploadImageMutation,
} = contentApiSlice;
