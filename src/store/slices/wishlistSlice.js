import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApiSlice } from '../api/wishlistApiSlice';
import { logoutUser } from './authSlice';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const result = await dispatch(wishlistApiSlice.endpoints.getWishlist.initiate()).unwrap();
            return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to fetch wishlist');
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/addToWishlist',
    async (product, { dispatch, rejectWithValue }) => {
        try {
            const productId = product.id || product._id;
            const result = await dispatch(wishlistApiSlice.endpoints.addToWishlist.initiate({ productId })).unwrap();
            return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to add to wishlist');
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const targetId = typeof id === 'object' ? (id.id || id._id) : id;
            const result = await dispatch(wishlistApiSlice.endpoints.removeFromWishlist.initiate(targetId)).unwrap();
            return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Failed to remove from wishlist');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.items = action.payload; // Backend returns updated list
            })
            // Remove
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.items = action.payload;
            })
            // Clear on Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.items = [];
                state.error = null;
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
