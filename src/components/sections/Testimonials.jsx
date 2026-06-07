import React from 'react';
import { useGetTestimonialsQuery } from '../../store/api/contentApiSlice';

const Testimonials = ({ title = "Voices of Elegance" }) => {
    const { data: testimonials, isLoading: loading } = useGetTestimonialsQuery();

    if (loading) return null;
    if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="w-full px-6 md:px-12 text-center">
                <h2 className="text-3xl md:text-4xl font-heading text-primary mb-16">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t) => (
                        <div key={t._id} className="p-8 border border-accent/50 bg-gradient-to-br from-accent/5 to-transparent hover:border-primary/30 transition-all duration-300">
                            <div className="text-accent text-4xl mb-4 font-serif">"</div>
                            <p className="italic mb-6 text-lg relative z-10 opacity-80">{t.text}</p>
                            <div className="w-10 h-0.5 bg-primary/30 mx-auto mb-4"></div>
                            <p className="font-heading uppercase tracking-wider text-xs">{t.author}</p>
                            {t.role && <p className="text-[10px] text-light/50 uppercase tracking-widest mt-1">{t.role}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
