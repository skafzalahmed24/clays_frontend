import React from 'react';
import { Link } from 'react-router-dom';

const BeautyRoutine = () => {
    return (
        <section className="relative py-12 md:py-20 bg-body flex items-center justify-center overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
            
            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
                <span className="inline-block py-1 px-4 border border-primary/50 rounded-full text-primary text-xs uppercase tracking-[0.3em] mb-6 font-bold">
                    Elevate Your Ritual
                </span>
                <h2 className="text-4xl md:text-7xl font-heading font-bold text-dark mb-6 leading-tight drop-shadow-sm font-serif">
                    Discover Your <br/><span className="text-primary italic">Ultimate Glow</span>
                </h2>
                <p className="text-lg md:text-xl text-dark/70 font-light mb-10 max-w-2xl mx-auto">
                    Curate a bespoke skincare routine tailored to your unique needs. Unveil skin that is visibly firmer, deeply hydrated, and luminous.
                </p>
                <Link to="/shop">
                    <button className="bg-transparent border border-primary text-dark font-heading font-bold uppercase tracking-widest py-4 px-12 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105">
                        Shop The Ritual
                    </button>
                </Link>
            </div>
        </section>
    );
};
export default BeautyRoutine;
