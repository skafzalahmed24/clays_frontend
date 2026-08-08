import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { logoutAdmin, logOutLocal as logoutAdminLocal } from '../../store/slices/adminAuthSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import { useToast } from '../../context/ToastContext';
import Icons from '../ui/Icons';
import Input from '../ui/Input';

const LoginForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error: authError } = useSelector(state => state.auth);
    // const { showToast } = useToast(); // Handled in AuthContext - Now need to handle here or in slice? Plan said slices handle logic, but UI needs toast. Slice has error state.
    // Let's use local error state for now or map from slice error. 
    // Wait, the thunk returns promise. We can unwrap or check result payload.
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Disallow spaces for email and password
        const newValue = (name === 'email' || name === 'password') ? value.replace(/\s/g, '') : value;

        setFormData({ ...formData, [name]: newValue });
        if (localError) setLocalError('');
        if (authError) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setLocalError('Please fill in all fields');
            return;
        }

        // Clear Admin session before attempting User login
        dispatch(logoutAdminLocal());

        const resultAction = await dispatch(loginUser({ email: formData.email.toLowerCase(), password: formData.password }));
        if (loginUser.fulfilled.match(resultAction)) {
            // dispatch(logoutAdmin()); // Moved to before login

            // Broadcast to other tabs
            const channel = new BroadcastChannel('auth_sync_channel');
            channel.postMessage({ type: 'LOGIN_USER' });
            channel.close();

            dispatch(fetchCart());
            dispatch(fetchWishlist());
            showToast(`Welcome back, ${resultAction.payload.name}!`, 'success');
            navigate('/account');
        } else {
            // Error handled by reducer state or we can show toast here
            const payload = resultAction.payload;
            const errorMessage = payload?.message || (typeof payload === 'string' ? payload : resultAction.error.message) || 'Login failed';

            if (payload?.isVerified === false) {
                navigate(`/verify-otp?email=${encodeURIComponent(formData.email.toLowerCase())}`, {
                    state: { message: 'Your email is not verified. Please check your inbox for the code.' }
                });
                return;
            }

            setLocalError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Email Address *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                icon={Icons.Email}
                required
                theme="light"
            />

            <div>
                <Input
                    label="Password *"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    theme="light"
                />
                <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Forgot Password?</Link>
                </div>
            </div>

            {localError && <p className="text-red-500 text-sm text-center">{localError}</p>}

            <button
                type="submit"
                className="w-full bg-primary text-white font-heading font-medium py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
                Login
            </button>

            <div className="text-center text-sm text-gray-600">
                Don't have an account? <Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-medium">Create One</Link>
            </div>
        </form>
    );
};

export default LoginForm;
