import React, { useState } from 'react';
import ImageModal from './ImageModal';
import { BASE_URL, getMediaUrl } from '../../utils/apiConfig';

const PreviewableImage = ({ src, alt, className, containerClassName }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!src) return null;

    // Derived source handling (similar to Image.jsx)
    if (!src) return null;
    const finalSrc = getMediaUrl(src);

    return (
        <>
            <div 
                className={`cursor-zoom-in group relative overflow-hidden ${containerClassName || ''}`}
                onClick={() => setIsModalOpen(true)}
            >
                <img 
                    src={finalSrc} 
                    alt={alt} 
                    className={`transition-transform duration-500 group-hover:scale-110 ${className || 'w-full h-full object-cover'}`} 
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-dark/80 p-2 rounded-full border border-primary/30 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                </div>
            </div>

            <ImageModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                imageUrl={finalSrc} 
                altText={alt} 
            />
        </>
    );
};

export default PreviewableImage;
