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
        phone: '',
        password: ''
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Disallow spaces for password
        const newValue = name === 'password' ? value.replace(/\s/g, '') : value;

        setFormData({ ...formData, [name]: newValue });
        if (localError) setLocalError('');
        if (authError) dispatch(clearError());
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        if (val.startsWith('+91')) {
            val = val.slice(3);
        } else if (val.startsWith('+')) {
            setLocalError('Only Indian (+91) mobile numbers are accepted');
            return;
        }
        let digitsOnly = val.replace(/\D/g, '');
        if (digitsOnly.startsWith('91') && digitsOnly.length > 10) {
            digitsOnly = digitsOnly.slice(2);
        } else if (digitsOnly.startsWith('0') && digitsOnly.length > 10) {
            digitsOnly = digitsOnly.slice(1);
        }
        digitsOnly = digitsOnly.slice(0, 10);
        setFormData(prev => ({ ...prev, phone: digitsOnly }));
        if (localError) setLocalError('');
        if (authError) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanDigits = (formData.phone || '').replace(/\D/g, '');
        if (!cleanDigits || !formData.password) {
            setLocalError('Please enter both your mobile number and password');
            return;
        }

        if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
            setLocalError('Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9');
            return;
        }

        // Clear Admin session before attempting User login
        dispatch(logoutAdminLocal());

        const fullPhone = `+91${cleanDigits}`;
        const loginPayload = {
            phone: fullPhone,
            password: formData.password
        };

        const resultAction = await dispatch(loginUser(loginPayload));
        if (loginUser.fulfilled.match(resultAction)) {
            // Broadcast to other tabs
            const channel = new BroadcastChannel('auth_sync_channel');
            channel.postMessage({ type: 'LOGIN_USER' });
            channel.close();

            dispatch(fetchCart());
            dispatch(fetchWishlist());
            showToast(`Welcome back, ${resultAction.payload.name}!`, 'success');
            navigate('/account');
        } else {
            const payload = resultAction.payload;
            const errorMessage = payload?.message || (typeof payload === 'string' ? payload : resultAction.error.message) || 'Login failed';

            if (payload?.isVerified === false) {
                const userPhone = payload?.phone || fullPhone;
                navigate(`/verify-otp?phone=${encodeURIComponent(userPhone)}`, {
                    state: { message: payload?.message || 'Please verify your mobile number with the OTP sent to your phone.' }
                });
                return;
            }

            setLocalError(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Indian Mobile Number with locked +91 country code */}
            <div>
                <label htmlFor="login-phone" className="block text-xs font-medium text-gray-700 mb-1.5">
                    Mobile Number (India +91) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex rounded-lg shadow-sm">
                    <div className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-700 text-sm font-medium select-none space-x-1.5">
                        <span role="img" aria-label="India Flag">🇮🇳</span>
                        <span>+91</span>
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        id="login-phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="98765 43210"
                        maxLength={10}
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-r-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-300 transition-all duration-300 focus:outline-none text-base"
                    />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                    Enter the 10-digit mobile number linked to your account.
                </p>
            </div>

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
