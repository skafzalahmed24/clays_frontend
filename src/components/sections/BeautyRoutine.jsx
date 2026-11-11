import React from 'react';
import { Link } from 'react-router-dom';
import { useGetDiscoverSectionQuery } from '../../store/api/contentApiSlice';

const BeautyRoutine = () => {
    const { data: discover } = useGetDiscoverSectionQuery();

    const content = discover || {
        badge: "Elevate Your Ritual",
        title: "Discover Your",
        highlightText: "Ultimate Glow",
        description: "Curate a bespoke skincare routine tailored to your unique needs. Unveil skin that is visibly firmer, deeply hydrated, and luminous.",
        link: "/shop",
        linkText: "Shop The Ritual"
    };

    return (
        <section className="relative py-8 md:py-12 bg-body flex items-center justify-center overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
            
            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
                {content.badge && (
                    <span className="inline-block py-1 px-4 border border-primary/50 rounded-full text-primary text-xs uppercase tracking-[0.3em] mb-6 font-bold">
                        {content.badge}
                    </span>
                )}
                <h2 className="text-4xl md:text-6xl font-heading font-bold text-dark mb-6 leading-tight drop-shadow-sm font-serif">
                    {content.title}{content.title && ' '}
                    {content.highlightText && (
                        <>
                            <br />
                            <span className="text-primary italic">{content.highlightText}</span>
                        </>
                    )}
                </h2>
                {content.description && (
                    <p className="text-lg md:text-xl text-dark/70 font-light mb-10 max-w-2xl mx-auto whitespace-pre-line">
                        {content.description}
                    </p>
                )}
                <Link to={content.link || "/shop"} className="block md:inline-block">
                    <button className="bg-transparent border border-primary text-dark font-heading font-bold uppercase tracking-widest py-4 px-12 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 w-full md:w-fit">
                        {content.linkText || "Shop The Ritual"}
                    </button>
                </Link>
            </div>
        </section>
    );
};

export default BeautyRoutine;
