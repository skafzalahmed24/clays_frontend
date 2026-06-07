import React from 'react';
import { getMediaUrl } from '../../utils/apiConfig';

const PageHeader = ({ title, subtitle, eyebrow, backgroundImage, className = "" }) => {
    return (
        <div className={`relative h-[35vh] min-h-[300px] flex items-center justify-center overflow-hidden ${className}`}>
            {/* Background */}
            <div className="absolute inset-0">
                {backgroundImage ? (
                    <>
                        <img
                            src={getMediaUrl(backgroundImage)}
                            alt={title}
                            className="w-full h-full object-cover opacity-60 animate-pan-slow"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#050505]"></div>
                    </>
                ) : (
                    // Fallback Glow if no image provided
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 mt-12">
                {eyebrow && (
                    <span className="text-primary text-sm uppercase tracking-[0.3em] font-medium mb-4 block animate-fade-in">
                        {eyebrow}
                    </span>
                )}
                <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg animate-fade-in-up">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-white/70 max-w-2xl mx-auto text-lg font-light leading-relaxed animate-fade-in-up delay-100">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
