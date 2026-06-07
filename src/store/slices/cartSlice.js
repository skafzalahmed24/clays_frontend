import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApiSlice } from '../api/cartApiSlice';
import { logoutUser } from './authSlice';

// Helper to calculate total (optional, or done in selector)
const calculateTotal = (items) => {
    // Implementation can be added if we store total in state
};

// Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            // Use initiate to trigger the RTK Query endpoint manually
            const result = await dispatch(cartApiSlice.endpoints.getCart.initiate()).unwrap();
            return result; 
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product, qty, isGuest }, { dispatch, rejectWithValue }) => {
        if (isGuest) {
            return { product, qty, isGuest: true };
        }
        try {
             const productId = product.id || product._id;
             const result = await dispatch(cartApiSlice.endpoints.addToCart.initiate({ productId, qty })).unwrap();
             return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to add to cart');
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async ({ id, isGuest }, { dispatch, rejectWithValue }) => {
        if (isGuest) {
            return { id, isGuest: true };
        }
        try {
             const result = await dispatch(cartApiSlice.endpoints.removeFromCart.initiate(id)).unwrap();
             return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to remove from cart');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    cartOpen: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartOpen: (state, action) => {
            state.cartOpen = action.payload;
        },
        clearCart: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : []; // Verify backend structure
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addToCart.pending, (state) => {
                 // Optimistic logic could go here, but let's wait for fulfilled for simplicity/sync first
                 state.loading = true; // Or partial loading
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                if (!action.payload) {
                    console.error('addToCart fulfilled but payload is missing');
                    return;
                }
                if (action.payload.isGuest) {
                    const { product, qty } = action.payload;
                    const existing = state.items.find(item => item.id === product.id);
                    if (existing) {
                        existing.qty += qty;
                    } else {
                        state.items.push({ ...product, qty });
                    }
                } else {
                    state.items = Array.isArray(action.payload) ? action.payload : []; // update from backend
                }
                state.cartOpen = true;
            })
            // Remove
            .addCase(removeFromCart.fulfilled, (state, action) => {
                if (!action.payload) {
                     console.error('removeFromCart fulfilled but payload is missing');
                     return;
                }
                if (action.payload.isGuest) {
                    state.items = state.items.filter(item => item.id !== action.payload.id);
                } else {
                    state.items = Array.isArray(action.payload) ? action.payload : [];
                }
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.items = [];
            });
    },
});

export const { setCartOpen, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
