import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../utils/apiConfig';

export const loginAdmin = createAsyncThunk(
    'adminAuth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            };
            const { data } = await axios.post(
                `${API_URL}/admin/login`,
                { email, password },
                config
            );

            if (data.refreshToken) {
                localStorage.setItem('adminRefreshToken', data.refreshToken);
            }
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            );
        }
    }
);

export const logoutAdmin = createAsyncThunk('adminAuth/logout', async () => {
    try {
        // Need to use axios with credentials or client to send cookie
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true 
        };
        await axios.post(`${API_URL}/admin/logout`, {}, config);
    } catch (error) {
        console.error('Logout failed', error);
    }
    // Redux Persist state is cleared by the 'logoutAdmin.fulfilled' action in extraReducers
    localStorage.removeItem('adminRefreshToken');
    return;
});

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState: {
        adminInfo: null,
        loading: false,
        error: null,
    },
    reducers: {
        setAdminCredentials: (state, action) => {
            state.adminInfo = action.payload;

        },
        clearAdminError: (state) => {
            state.error = null;
        },
        logOutLocal: (state) => {
            state.adminInfo = null;
            state.error = null;
            localStorage.removeItem('adminRefreshToken');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.adminInfo = action.payload;
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(logoutAdmin.fulfilled, (state) => {
                state.adminInfo = null;
            });
    },
});

export const { clearAdminError, setAdminCredentials, logOutLocal } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
