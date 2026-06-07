import axios from 'axios';

// Create an Axios instance with base configuration
const client = axios.create({
    baseURL: '/api', // Vite proxy handles the routing to localhost:5000
    withCredentials: true, // Important for cookies/sessions if you're using them
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token if needed
client.interceptors.request.use(
    (config) => {
        // Example: If using localStorage for token
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login or clear state)
            console.error('Unauthorized access - please log in again.');
        }
        return Promise.reject(error);
    }
);

let store;
export const injectStore = (_store) => {
    store = _store;
};

export default client;
