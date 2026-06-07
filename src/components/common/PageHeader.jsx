import React from 'react';
import { Link } from 'react-router-dom';
import defaultBg from '../../assets/hero-3.png';

const PageHeader = ({ title, backgroundImage }) => {
    return (
        <div className="relative pt-24 pb-8 px-6 overflow-hidden border-b border-white/5">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-dark z-0">
                <div className="absolute inset-0">
                    <img src={backgroundImage || defaultBg} alt="" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-black/60"></div>
                </div>
                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                    {/* Decorative Top Line */}
                    <div className="w-px h-4 bg-gradient-to-b from-transparent via-primary/50 to-transparent mb-3"></div>

                    <h1 className="font-heading text-2xl md:text-3xl text-light tracking-[0.2em] uppercase mb-2 drop-shadow-2xl">
                        {title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-xs font-heading tracking-[0.2em] text-light/60 uppercase">
                        <Link
                            to="/"
                            className="hover:text-primary hover:tracking-[0.25em] transition-all duration-500 ease-out"
                        >
                            Home
                        </Link>
                        <span className="text-primary/40">•</span>
                        <span className="text-primary">{title}</span>
                    </div>

                    {/* Decorative Bottom Diamond */}
                    <div className="mt-4 opacity-50">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="0" width="8.48528" height="8.48528" transform="rotate(45 6 0)" fill="#D4AF37" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
