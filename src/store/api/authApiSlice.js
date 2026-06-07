import { apiSlice } from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/users/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
        verifyOtp: builder.mutation({
            query: (data) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: data,
            }),
        }),
        resendOtp: builder.mutation({
            query: (data) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: data,
            }),
        }),
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation({
            query: (data) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
        // Register/Login return new tokens so they naturally don't need refresh logic for *the request itself*,
        // but could be here for consistency. For now keeping them in thunks is fine as they are entry points.
    }),
});

export const {
    useUpdateProfileMutation,
    useLogoutMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = authApiSlice;
