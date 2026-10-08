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
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Disallow spaces for email, password, and phone
        const newValue = (name === 'email' || name === 'password' || name === 'confirmPassword') ? value.replace(/\s/g, '') : value;

        setFormData({ ...formData, [name]: newValue });
        if (localError) setLocalError('');
        if (authError) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setLocalError('Please fill in all required fields');
            return;
        }

        // Email Validation
        if (!REGEX.EMAIL.test(formData.email)) {
            setLocalError('Please enter a valid email address');
            return;
        }

        // Phone validation if entered
        if (formData.phone && !/^(\+91[\s\-]?)?[6-9]\d{9}$|^91[6-9]\d{9}$|^0[6-9]\d{9}$/.test(formData.phone.trim())) {
            setLocalError('Please enter a valid 10-digit Indian mobile number (+91)');
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

        const resultAction = await dispatch(registerUser({
            name: formData.name,
            email: formData.email.toLowerCase(),
            phone: formData.phone ? formData.phone.trim() : undefined,
            password: formData.password
        }));

        if (registerUser.fulfilled.match(resultAction)) {
            const userEmail = resultAction.payload?.data?.email || formData.email;
            const userPhone = resultAction.payload?.data?.phone || formData.phone;
            showToast('Account created! Please verify the OTP.', 'success');
            
            let verifyUrl = `/verify-otp?email=${encodeURIComponent(userEmail)}`;
            if (userPhone) {
                verifyUrl += `&phone=${encodeURIComponent(userPhone)}`;
            }
            navigate(verifyUrl);
        } else {
            if (resultAction.payload) {
                setLocalError(resultAction.payload);
            } else {
                setLocalError(resultAction.error.message || 'Registration failed');
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

            <Input
                label="Mobile Number (India +91) - Optional"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                icon={Icons.Phone}
                theme="light"
            />

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
