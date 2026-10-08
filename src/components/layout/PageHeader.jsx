import React from 'react';
import { getMediaUrl } from '../../utils/apiConfig';

const PageHeader = ({ title, subtitle, eyebrow, backgroundImage, theme, className = "" }) => {
    const hasImage = Boolean(backgroundImage && typeof backgroundImage === 'string' && backgroundImage.trim() !== '');

    return (
        <div className={`relative ${hasImage ? 'min-h-[220px] h-[32vw] xs:min-h-[250px] sm:min-h-[290px] md:h-[36vh] md:min-h-[340px] lg:min-h-[390px]' : 'min-h-[180px] xs:min-h-[200px] sm:min-h-[230px] md:min-h-[260px] py-12 md:py-16'} flex items-center justify-center overflow-hidden bg-[#0c0c0c] border-b border-white/5 ${className}`}>
            {/* Background */}
            <div className="absolute inset-0">
                {hasImage ? (
                    <>
                        <img
                            src={getMediaUrl(backgroundImage)}
                            alt={typeof title === 'string' ? title : 'Page Header'}
                            className="w-full h-full object-cover object-center opacity-90 animate-pan-slow"
                        />
                        {/* Soft gradient overlay for text readability over photo */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60"></div>
                    </>
                ) : (
                    // Clean, empty dark background with subtle ambient gold glow
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#080808]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6">
                {eyebrow && (
                    <span className="text-primary text-xs sm:text-sm uppercase tracking-[0.3em] font-medium mb-2 sm:mb-3 block animate-fade-in drop-shadow">
                        {eyebrow}
                    </span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] animate-fade-in-up">
                    {title}
                </h1>
                {subtitle && (
                    <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-light leading-relaxed animate-fade-in-up delay-100 text-white/75 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
