import { apiSlice } from './apiSlice';

export const shippingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        checkPincode: builder.query({
            query: (pincode) => `/shipping/pincode/${pincode}`,
            keepUnusedDataFor: 60,
        }),
        getShippingEstimate: builder.mutation({
            query: (data) => ({
                url: '/shipping/estimate',
                method: 'POST',
                body: data,
            }),
        }),
        getShippingSettings: builder.query({
            query: () => '/shipping/settings',
            providesTags: ['Settings'],
            keepUnusedDataFor: 30,
        }),
        updateShippingSettings: builder.mutation({
            query: (data) => ({
                url: '/shipping/settings',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
        trackWaybill: builder.query({
            query: (waybill) => `/shipping/track/${waybill}`,
            keepUnusedDataFor: 30,
        }),
        getShippingLabel: builder.query({
            query: (waybill) => `/shipping/label/${waybill}`,
        }),
        cancelShipment: builder.mutation({
            query: (waybill) => ({
                url: `/shipping/cancel/${waybill}`,
                method: 'POST',
            }),
            invalidatesTags: ['Order'],
        }),
        testDelhiveryConnection: builder.mutation({
            query: (data) => ({
                url: '/shipping/test-connection',
                method: 'POST',
                body: data,
            }),
        }),
        getLiveRate: builder.mutation({
            query: (data) => ({
                url: '/shipping/live-rate',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useCheckPincodeQuery,
    useLazyCheckPincodeQuery,
    useGetShippingEstimateMutation,
    useGetShippingSettingsQuery,
    useUpdateShippingSettingsMutation,
    useTrackWaybillQuery,
    useLazyTrackWaybillQuery,
    useGetShippingLabelQuery,
    useLazyGetShippingLabelQuery,
    useCancelShipmentMutation,
    useTestDelhiveryConnectionMutation,
    useGetLiveRateMutation,
} = shippingApiSlice;
