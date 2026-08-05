import React, { useEffect } from 'react';
import Icons from './Icons';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColors = {
        success: 'bg-white border-black/20 text-black',
        error: 'bg-red-500/10 border-red-500/20 text-red-600 bg-white',
        info: 'bg-white border-primary/20 text-primary',
    };

    const icons = {
        success: Icons.Check,
        error: Icons.Close, // Using Close as a generic error icon replacement or we could add AlertTriangle
        info: Icons.Box, // Using Box as generic info or add Info icon
    };

    const Icon = icons[type] || icons.info;

    return (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-4 rounded-sm border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 ${bgColors[type] || bgColors.info}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="font-heading text-sm uppercase tracking-wide pr-4">{message}</p>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <Icons.Close className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
