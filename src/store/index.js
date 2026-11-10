import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { encryptTransform } from 'redux-persist-transform-encrypt';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';

import orderReducer from './slices/orderSlice';


const secretKey = import.meta.env.VITE_REDUX_PERSIST_KEY || 'my-secret-key';

const encryptor = encryptTransform({
    secretKey,
    onError: function (error) {
        console.error('Encryption Error:', error);
    },
});

// Transform to prevent transient UI state (loading, error) from persisting in localStorage
const authFilterTransform = createTransform(
    (inboundState, key) => {
        if (key === 'adminAuth') {
            return {
                ...inboundState,
                loading: false,
                error: null,
            };
        }
        if (key === 'auth') {
            return {
                ...inboundState,
                loading: false,
                error: null,
            };
        }
        return inboundState;
    },
    (outboundState, key) => {
        if (key === 'adminAuth') {
            return {
                ...outboundState,
                loading: false,
                error: null,
            };
        }
        if (key === 'auth') {
            return {
                ...outboundState,
                loading: false,
                error: null,
            };
        }
        return outboundState;
    },
    { whitelist: ['adminAuth', 'auth'] }
);

const persistConfig = {
    key: 'root',
    storage,
    transforms: [authFilterTransform, encryptor],
    whitelist: ['auth', 'adminAuth', 'cart', 'wishlist'] // Persist these slices
};

// Combine reducers logic if needed, but we can pass object to configureStore
import { combineReducers } from 'redux';
import adminAuthReducer from './slices/adminAuthSlice';

import { apiSlice } from './api/apiSlice';

const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    adminAuth: adminAuthReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,

});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore non-serializable checks for persist actions
            },
        }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);
