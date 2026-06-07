import React from 'react';
import Icons from './Icons';

const ImageModal = ({ isOpen, onClose, imageUrl, altText }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity cursor-zoom-out"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 p-2 text-light/60 hover:text-primary transition-colors bg-white/5 rounded-full hover:bg-white/10"
                    title="Close"
                >
                    <Icons.Close className="w-8 h-8" />
                </button>

                {/* Image */}
                <div className="relative bg-dark-paper p-1 rounded-sm border border-primary/20 shadow-2xl overflow-hidden group">
                    <img
                        src={imageUrl}
                        alt={altText || 'Preview'}
                        className="max-w-full max-h-[80vh] object-contain rounded-sm"
                    />
                    
                    {/* Caption/Alt Text Overlay on Hover */}
                    {altText && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-light text-sm font-medium text-center">{altText}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageModal;
