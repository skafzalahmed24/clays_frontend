import React, { forwardRef, useState } from 'react';
import Icons from './Icons';

const Input = forwardRef(({ label, type = 'text', name, value, onChange, icon: Icon, required = false, placeholder, error, className, noSpaces = false, theme = 'dark', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const handleChange = (e) => {
        if (noSpaces && e.target.value.includes(' ')) {
            return;
        }
        onChange && onChange(e);
    };

    const handleKeyDown = (e) => {
        if (type === 'number') {
            // Block invalid characters for positive numbers: -, +, e, E
            if (['e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault();
            }
        }
    };

    const handleWheel = (e) => {
        // Prevent generic scrolling changing number values
        if (type === 'number') {
            e.target.blur();
        }
    };

    const extraProps = {};
    if (type === 'number') {
        extraProps.min = props.min !== undefined ? props.min : 0;
    }

    const darkClasses = `bg-white/5 border-white/10 text-white placeholder-light/40 focus:border-primary focus:ring-1 focus:ring-primary ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''}`;
    const lightClasses = `bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-300 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`;

    const themeClasses = theme === 'light' ? lightClasses : darkClasses;

    return (
        <div className="w-full">
            <div className="relative">
                <input
                    ref={ref}
                    type={inputType}
                    name={name}
                    id={name}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onWheel={handleWheel}
                    required={required}
                    autoCapitalize="none"
                    {...extraProps}
                    className={`block w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none ${themeClasses} ${Icon ? 'pl-11' : ''} ${isPassword || props.disabled ? 'pr-10' : ''} ${className || ''}`}
                    placeholder={placeholder || label}
                    {...props}
                />
                {Icon && (
                    <div className={`absolute left-4 top-3.5 transition-colors duration-300 pointer-events-none ${theme === 'light' ? 'text-gray-400' : 'text-light/30'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                {isPassword && !props.disabled && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 top-3.5 transition-colors duration-300 focus:outline-none ${theme === 'light' ? 'text-gray-400 hover:text-gray-600' : 'text-light/30 hover:text-primary'}`}
                    >
                        {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                    </button>
                )}

                {props.disabled && (
                    <div className={`absolute right-4 top-3.5 transition-colors duration-300 pointer-events-none ${theme === 'light' ? 'text-gray-400' : 'text-light/30'}`}>
                        <Icons.Lock className="w-5 h-5" />
                    </div>
                )}
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
