import React from 'react';
import Icons from './Icons';

const Select = ({ label = "", name = "", value, onChange, options = [], disabled, required = false, placeholder, error, className, icon: Icon }) => {
    // Select component using atomic styling
    return (
        <div className="w-full">
            <div className="relative">
                <select
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`block w-full px-4 py-3 bg-white/5 border rounded-sm text-text-main appearance-none focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300 ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-primary'
                        } ${Icon ? 'pl-11' : ''} ${className || ''} ${!value ? 'text-light/40' : 'text-light'}`}
                >
                    <option value="" disabled className="bg-dark text-light/40">{placeholder || `Select ${label}`}</option>
                    {options.map((opt) => (
                        <option
                            key={opt.value || opt}
                            value={opt.value || opt}
                            className="bg-dark text-light"
                        >
                            {typeof (opt.label || opt) === 'object' ? `[Invalid Object]` : (opt.label || opt)}
                        </option>
                    ))}
                </select>

                {Icon && (
                    <div className="absolute left-3.5 top-3.5 text-light/30 pointer-events-none">
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-light/30">
                    <Icons.ChevronDown className="w-4 h-4" />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};

export default Select;
