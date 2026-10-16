import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';
import Icons from '../ui/Icons';
import Input from '../ui/Input';
import { REGEX } from '../../utils/regex';

const RegisterForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error: authError } = useSelector(state => state.auth);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Disallow spaces for password and confirmPassword
        const newValue = (name === 'password' || name === 'confirmPassword') ? value.replace(/\s/g, '') : value;

        setFormData({ ...formData, [name]: newValue });
        if (localError) setLocalError('');
        if (authError) dispatch(clearError());
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        // Handle pastes or inputs with +91 or 91
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
        // Limit to 10 digits
        digitsOnly = digitsOnly.slice(0, 10);
        setFormData(prev => ({ ...prev, phone: digitsOnly }));
        if (localError) setLocalError('');
        if (authError) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
            setLocalError('Please fill in all required fields (Name, Mobile Number, Password)');
            return;
        }

        // Strictly Indian mobile number (+91): exactly 10 digits starting with 6, 7, 8, or 9
        const cleanDigits = formData.phone.replace(/\D/g, '');
        if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
            setLocalError('Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        // Strong Password Validation
        if (!REGEX.PASSWORD_STRONG.test(formData.password)) {
            setLocalError('Password must be at least 8 chars, include Upper, Lower, Number & Special char');
            return;
        }

        const fullPhone = `+91${cleanDigits}`;

        const resultAction = await dispatch(registerUser({
            name: formData.name.trim(),
            phone: fullPhone,
            password: formData.password
        }));

        if (registerUser.fulfilled.match(resultAction)) {
            const userPhone = resultAction.payload?.phone || fullPhone;
            showToast('Account created! Please verify your mobile number with the OTP.', 'success');
            
            // Redirect to verify-otp page with mobile phone
            navigate(`/verify-otp?phone=${encodeURIComponent(userPhone)}`, { replace: true });
        } else {
            if (resultAction.payload) {
                setLocalError(resultAction.payload);
            } else {
                setLocalError(resultAction.error?.message || 'Registration failed');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Full Name *"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={Icons.User}
                required
                theme="light"
            />

            {/* Indian Mobile Number with locked +91 country code */}
            <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1.5">
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
                        id="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="98765 43210"
                        maxLength={10}
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-r-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-300 transition-all duration-300 focus:outline-none text-base"
                    />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                    Only Indian mobile numbers (+91) with 10 digits starting with 6, 7, 8, or 9 are accepted.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Password *"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    theme="light"
                />
                <Input
                    label="Confirm Password *"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    theme="light"
                />
            </div>

            {localError && <p className="text-red-500 text-sm text-center">{localError}</p>}

            <button
                type="submit"
                className="w-full bg-primary text-white font-heading font-medium py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
                Create Account
            </button>

            <div className="text-center text-sm text-gray-600">
                Already have an account? <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">Login Here</Link>
            </div>
        </form>
    );
};

export default RegisterForm;
