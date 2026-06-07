import React, { forwardRef, useState } from 'react';
import Icons from './Icons';

const Input = forwardRef(({ label, type = 'text', name, value, onChange, icon: Icon, required = false, placeholder, error, className, noSpaces = false, ...props }, ref) => {
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
                    className={`block w-full px-4 py-3 bg-white/5 border rounded-sm text-white placeholder-light/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300 ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-primary'
                        } ${Icon ? 'pl-11' : ''} ${isPassword || props.disabled ? 'pr-10' : ''} ${className || ''}`}
                    placeholder={placeholder || label}
                    {...props}
                />
                {Icon && (
                    <div className="absolute left-3.5 top-3.5 text-light/30 transition-colors duration-300 pointer-events-none">
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                {isPassword && !props.disabled && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-light/30 hover:text-primary transition-colors duration-300 focus:outline-none"
                    >
                        {showPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                    </button>
                )}

                {props.disabled && (
                    <div className="absolute right-3.5 top-3.5 text-light/30 transition-colors duration-300 pointer-events-none">
                        <Icons.Lock className="w-5 h-5" />
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
