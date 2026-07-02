import React, { useState, useEffect } from 'react';
import { useGetTestimonialsQuery } from '../../store/api/contentApiSlice';

const Testimonials = ({ title = "Voices of Elegance" }) => {
    const { data: testimonials, isLoading: loading } = useGetTestimonialsQuery();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!testimonials || testimonials.length <= 1) return;
        const timer = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(timer);
    }, [testimonials, currentIndex]);

    const handleNext = () => {
        if (isAnimating || !testimonials) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating || !testimonials) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    if (loading) return null;
    if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-body relative overflow-hidden">
            {/* Soft background accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            
            <div className="w-full max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
                <div className="flex flex-col items-center mb-16">
                    <span className="text-xs uppercase tracking-[0.3em] text-primary mb-4 font-bold">Reviews</span>
                    <h2 className="text-3xl md:text-5xl font-heading text-dark font-bold tracking-widest uppercase">{title}</h2>
                    <div className="w-16 h-1 bg-primary mt-6"></div>
                </div>

                <div className="relative h-[300px] md:h-[250px] flex items-center justify-center">
                    {/* Navigation Arrows */}
                    {testimonials.length > 1 && (
                        <>
                            <button onClick={handlePrev} className="absolute left-0 md:-left-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg hidden md:flex">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <button onClick={handleNext} className="absolute right-0 md:-right-12 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg hidden md:flex">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </>
                    )}

                    {/* Slides */}
                    {testimonials.map((t, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div 
                                key={t._id} 
                                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                                    isActive ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-12 scale-95 z-0'
                                }`}
                            >
                                <div className="text-primary text-6xl mb-6 font-serif opacity-40 leading-none">"</div>
                                <p className="italic mb-8 text-xl md:text-3xl text-dark/80 font-light max-w-3xl leading-relaxed">
                                    {t.text}
                                </p>
                                <p className="font-heading uppercase tracking-[0.2em] text-sm text-dark font-bold">{t.author}</p>
                                {t.role && <p className="text-[10px] text-dark/40 uppercase tracking-[0.3em] mt-2">{t.role}</p>}
                            </div>
                        );
                    })}
                </div>

                {/* Dots */}
                {testimonials.length > 1 && (
                    <div className="flex justify-center gap-3 mt-12">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-primary/30 hover:bg-primary/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;
