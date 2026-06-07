import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import { authApiSlice } from '../api/authApiSlice';

// Thunks
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await client.post('/auth/login', { email, password });
            // Save token separately for API client

            if (data.data.refreshToken) {
                localStorage.setItem('refreshToken', data.data.refreshToken);
            }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const { data } = await client.post('/auth/register', { name, email, password });

            if (data.data.refreshToken) {
                localStorage.setItem('refreshToken', data.data.refreshToken);
            }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (userData, { dispatch, rejectWithValue }) => {
        try {
            const result = await dispatch(authApiSlice.endpoints.updateProfile.initiate(userData)).unwrap();
            return result;
        } catch (error) {
            return rejectWithValue(error?.data?.message || error?.message || 'Update failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        try {
            await dispatch(authApiSlice.endpoints.logout.initiate()).unwrap();
            localStorage.removeItem('refreshToken');
        } catch (error) {
            console.error('Logout failed', error);
        }
    }
);

// Initial state is managed by Redux Persist (User starts null until rehydration)
const initialState = {
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            // Handle updates where we might just be setting the token
            if (user) state.user = user;
            if (token) state.user = { ...state.user, token }; 
        },
        clearError: (state) => {
            state.error = null;
        },
        logOutLocal: (state) => {
            state.user = null;
            state.error = null;
            localStorage.removeItem('refreshToken');
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                // No need to manually setItem('user'), redux-persist handles it
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user = null; // Force logout even if API fails
                state.error = null;
                localStorage.removeItem('refreshToken');
            });
    },
});

export const { setCredentials, clearError, logOutLocal } = authSlice.actions;
export default authSlice.reducer;
