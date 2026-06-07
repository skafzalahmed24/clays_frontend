import React from 'react';
import Icons from './Icons';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-dark-paper border border-primary/20 rounded-sm w-full max-w-md p-6 shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            {isDangerous ? <Icons.Trash className="w-6 h-6" /> : <Icons.Settings className="w-6 h-6" />}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-heading text-light tracking-wide">{title}</h3>
                            <p className="text-light/60 text-sm leading-relaxed font-body">{message}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-light/60 hover:text-light transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-300 ${isDangerous
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    : 'bg-primary hover:bg-primary/90 text-dark shadow-lg shadow-primary/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
