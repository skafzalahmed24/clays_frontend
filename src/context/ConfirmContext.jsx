/* eslint-disable */
import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ConfirmContext = createContext();

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
};

export const ConfirmProvider = ({ children }) => {
    const [dialogState, setDialogState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isDangerous: false,
    });

    const [fn, setFn] = useState(null);

    const confirm = useCallback((title, message, options = {}) => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                title,
                message,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                isDangerous: options.isDangerous || false,
            });
            setFn(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        if (fn) fn(true);
    }, [fn]);

    const handleCancel = useCallback(() => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
        if (fn) fn(false);
    }, [fn]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                isOpen={dialogState.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={dialogState.title}
                message={dialogState.message}
                confirmText={dialogState.confirmText}
                cancelText={dialogState.cancelText}
                isDangerous={dialogState.isDangerous}
            />
        </ConfirmContext.Provider>
    );
};
