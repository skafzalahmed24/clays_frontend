// Minimal Mutex to serialize refresh calls
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logoutUser as logout } from '../slices/authSlice'; 
import { logoutAdmin, setAdminCredentials } from '../slices/adminAuthSlice';

class Mutex {
    constructor() {
        this._locking = Promise.resolve();
        this._locked = false;
    }

    isLocked() {
        return this._locked;
    }

    acquire() {
        let unlock;
        const lock = new Promise(resolve => unlock = resolve);
        
        const previousLocking = this._locking;
        this._locking = previousLocking.then(() => lock);
        
        return previousLocking.then(() => {
            this._locked = true;
            return () => {
                this._locked = false;
                unlock();
            };
        });
    }
}

const mutex = new Mutex();

import { API_URL } from '../../utils/apiConfig';

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    // credentials: 'include', // Cookies no longer needed
    prepareHeaders: (headers, { getState, endpoint }) => {
        const state = getState();
        const userToken = state.auth.user?.token;
        const adminToken = state.adminAuth?.adminInfo?.token;

        // Valid endpoints that require Admin authentication
        // This prevents using a User token for Admin actions if both are logged in
        const adminEndpoints = [
            'createProduct', 'updateProduct', 'deleteProduct',
            'getUsers', 'getOrders', 'deliverOrder', 'updateOrderStatus',
            'getAnalytics',
            'getRequests', 'updateRequest', 'deleteRequest',
            'addAttribute', 'updateAttribute', 'deleteAttribute',
            'createCoupon', 'deleteCoupon',
            'getSettings', 'updateSettings',
            'getHeroSlides', 'addHeroSlide', 'deleteHeroSlide',
            'getTestimonials', 'addTestimonial', 'deleteTestimonial',
            'getSocialFeed', 'addSocialPost', 'deleteSocialPost',
            'getHeritage', 'updateHeritage',
            'getTrustBadges', 'addTrustBadge', 'deleteTrustBadge',
            'getFAQs', 'addFAQ', 'deleteFAQ',
            'getBlogs', 'getBlogById', 'createBlog', 'updateBlog', 'deleteBlog',
            'updatePage', 'uploadImage',
            'getContacts', 'deleteContact'
        ];

        let token = userToken;

        if (adminToken) {
            // Prioritize Admin token for Admin endpoints
            if (adminEndpoints.includes(endpoint)) {
                token = adminToken;
            }
            // Fallback to Admin token if no User token is present
            else if (!userToken) {
                token = adminToken;
            }
        }
        
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        } else {
            // Use default public token if no user/admin is logged in
            const defaultToken = import.meta.env.VITE_DEFAULT_PUBLIC_TOKEN;
            if (defaultToken) {
                headers.set('authorization', `Bearer ${defaultToken}`);
            }
        }
        return headers;
    },
    paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        for (const key in params) {
            const value = params[key];
            if (value === undefined || value === null) continue;
            
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, v));
            } else {
                searchParams.append(key, value);
            }
        }
        return searchParams.toString();
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    // Wait until mutex is available without locking it yet
    await mutex._locking;
    
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // If mutex is locked, it means another request is refreshing the token
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const state = api.getState();
                let refreshResult;
                let isAdminRefresh = false;

                if (state.adminAuth?.adminInfo?.token) {
                    const refreshToken = localStorage.getItem('adminRefreshToken');
                    if (refreshToken) {
                        refreshResult = await baseQuery({ 
                            url: '/admin/refresh', 
                            method: 'POST',
                            body: { refreshToken }
                        }, api, extraOptions);
                        isAdminRefresh = true;
                    }
                } else if (state.auth?.user?.token) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        refreshResult = await baseQuery({ 
                            url: '/auth/refresh', 
                            method: 'POST',
                            body: { refreshToken }
                        }, api, extraOptions);
                    }
                }

                if (refreshResult?.data && refreshResult.data.status === 1) {
                     const newToken = refreshResult.data.data.token;
                     const newRefreshToken = refreshResult.data.data.refreshToken;
                     
                     // Update Redux state
                     if (isAdminRefresh) {
                         if (newRefreshToken) localStorage.setItem('adminRefreshToken', newRefreshToken);
                         api.dispatch(setAdminCredentials({
                             ...state.adminAuth.adminInfo,
                             token: newToken,
                             refreshToken: newRefreshToken || state.adminAuth.adminInfo.refreshToken 
                         }));
                     } else {
                         if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
                         api.dispatch(setCredentials({ 
                             ...state.auth.user, 
                             token: newToken,
                             refreshToken: newRefreshToken || state.auth.user.refreshToken
                         }));
                     }
                     
                     // Retry original request (with new token in state)
                     result = await baseQuery(args, api, extraOptions);
                } else {
                     // Refresh failed - Logout
                     api.dispatch(logout());
                     api.dispatch(logoutAdmin());
                     localStorage.removeItem('refreshToken');
                     localStorage.removeItem('adminRefreshToken');
                     
                     // Retry original request one last time (as guest)
                     result = await baseQuery(args, api, extraOptions);
                }
            } catch (err) {
                console.error('Re-auth error:', err);
            } finally {
                release();
            }
        } else {
            // Wait for the other thread to finish refreshing
            await mutex._locking;
            // Retry request with fresh token
            result = await baseQuery(args, api, extraOptions);
        }
    }

    if (result.data) {
        // Unwrap standardized response
        if (result.data.status === 1) {
            return { data: result.data.data };
        } else if (result.data.status === 0) {
            return {
                error: {
                    status: result.meta?.response?.status || 400,
                    data: result.data
                }
            };
        }
    }
    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Product', 'Order', 'User', 'Category', 'Attribute', 'Blog', 'Review', 'Contact'],
    endpoints: () => ({}),
});
