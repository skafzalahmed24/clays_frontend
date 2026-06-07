import React, { useRef, useEffect, useCallback } from 'react';

const Textarea = ({ label, name, value, onChange, rows = 4, required = false, placeholder, error, className, maxHeight = '400px' }) => {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, parseInt(maxHeight));
            textarea.style.height = `${newHeight}px`;
        }
    }, [maxHeight]);

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    return (
        <div className="w-full">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    required={required}
                    style={{ maxHeight, overflowY: 'auto' }}
                    className={`block w-full px-4 py-3 bg-white/5 border rounded-sm text-white placeholder-light/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300 resize-none ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-primary'
                        } ${className || ''}`}
                    placeholder={placeholder || label}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};

export default Textarea;
