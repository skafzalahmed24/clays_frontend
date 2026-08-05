import React from 'react';
import { useGetTestimonialsQuery } from '../../store/api/contentApiSlice';
import Icons from '../ui/Icons';

const Testimonials = ({ title = "Voices of Elegance" }) => {
    const { data: testimonials, isLoading: loading } = useGetTestimonialsQuery();

    if (loading) return null;
    if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) return null;

    return (
        <section className="py-8 md:py-10 bg-body relative overflow-hidden">
            {/* Soft background accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col items-center mb-10 text-center">
                    <span className="text-xs uppercase tracking-[0.3em] text-primary mb-2 font-bold">Reviews</span>
                    <h2 className="text-2xl md:text-4xl font-heading text-dark font-bold tracking-widest uppercase">{title}</h2>
                    <div className="w-12 h-1 bg-primary mt-4"></div>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style dangerouslySetInnerHTML={{__html: `
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                    <div className="flex gap-4 w-max hide-scrollbar">
                        {testimonials.map((t, index) => (
                            <div 
                                key={t._id || index} 
                                className="snap-start flex-none w-[85vw] md:w-[calc(33.333vw-1.5rem)] max-w-[400px] bg-white p-6 md:p-8 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.1)] border border-light/50 rounded-xl flex flex-col justify-between transform transition-transform hover:-translate-y-1"
                            >
                                <div>
                                    <div className="text-primary text-3xl mb-2 font-serif opacity-40 leading-none">"</div>
                                    <p className="italic mb-6 text-base text-dark/80 font-light leading-relaxed">
                                        {t.text}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-heading uppercase tracking-[0.2em] text-xs text-dark font-bold">{t.author}</p>
                                        {(t.author && t.author.charCodeAt(0) % 2 === 0) ? (
                                            <Icons.Female className="w-3.5 h-3.5 text-primary" />
                                        ) : (
                                            <Icons.Male className="w-3.5 h-3.5 text-primary" />
                                        )}
                                    </div>
                                    {t.role && <p className="text-[9px] text-dark/40 uppercase tracking-[0.3em] mt-1">{t.role}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
