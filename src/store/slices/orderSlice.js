import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApiSlice } from '../api/orderApiSlice';

// Create new order
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { dispatch, rejectWithValue }) => {
        try {
            const result = await dispatch(orderApiSlice.endpoints.createOrder.initiate(orderData)).unwrap();
            return result; 
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to create order');
        }
    }
);

// Get logged in user orders
export const fetchMyOrders = createAsyncThunk(
    'order/fetchMyOrders',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const result = await dispatch(orderApiSlice.endpoints.getMyOrders.initiate()).unwrap();
            return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to fetch orders');
        }
    }
);

// Get order details
export const fetchOrderDetails = createAsyncThunk(
    'order/fetchOrderDetails',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const result = await dispatch(orderApiSlice.endpoints.getOrderDetails.initiate(id)).unwrap();
            return result; // Previous code returned `data` (axios response body) directly, not `data.data`.
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to fetch order details');
        }
    }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async (orderId, { dispatch, rejectWithValue }) => {
        try {
            const result = await dispatch(orderApiSlice.endpoints.cancelOrder.initiate(orderId)).unwrap();
            return result; // Previous code returned `data` directly.
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to cancel order');
        }
    }
);

const initialState = {
    orders: [],
    order: null,
    loading: false,
    error: null,
    success: false,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetOrder: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.order = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.order = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch My Orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Order Details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Cancel Order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
                // Update orders list if it exists
                const index = state.orders.findIndex(o => o._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
