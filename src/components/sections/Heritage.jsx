import React from 'react';
import { useGetHeritageQuery } from '../../store/api/contentApiSlice';
import { API_URL, BASE_URL, getMediaUrl } from '../../utils/apiConfig';
import { BRAND_CONFIG } from '../../utils/config';
import { Link } from 'react-router-dom';

const Heritage = () => {
    const { data: heritage, isLoading: loading } = useGetHeritageQuery();

    if (loading) {
        return (
            <section className="py-8 md:py-12">
                <div className="w-full px-6 md:px-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                </div>
            </section>
        );
    }

    // Fallback if no content is loaded yet
    const content = heritage || {
        title: "Mastery in Every Cut",
        subtitle: "Since 1985",
        description: `Our heritage is built on a foundation of uncompromised quality and artistic vision. Every piece of ${BRAND_CONFIG.brandName} jewelry tells a story of tradition, passion, and the pursuit of perfection.`,
        image: null,
        link: '/about',
        linkText: 'Read Our Story'
    };

    return (
        <section className="py-16 md:py-24 bg-body relative overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    
                    {/* Content Side */}
                    <div className="flex flex-col justify-center px-4 md:px-12 order-last md:order-first">
                        <span className="text-primary text-sm uppercase tracking-[0.3em] font-bold mb-4">{content.subtitle}</span>
                        <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-widest uppercase mb-6 text-dark">{content.title}</h2>
                        <div className="w-16 h-1 bg-primary mb-8"></div>
                        <p className="text-dark/70 text-lg font-light leading-relaxed mb-10">
                            {content.description}
                        </p>
                        <Link
                            to={content.link || '/about'}
                            className="bg-transparent border border-primary text-dark hover:bg-primary hover:text-white font-heading font-bold uppercase tracking-widest py-4 px-10 transition-all duration-300 w-fit"
                        >
                            {content.linkText || 'Read Our Story'}
                        </Link>
                    </div>

                    {/* Image Side */}
                    <div className="flex justify-center md:justify-start w-full order-first md:order-last">
                        <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl">
                            {content.image ? (
                                <img src={getMediaUrl(content.image)} alt="Heritage" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
                            ) : (
                                <div className="w-full h-full bg-dark flex items-center justify-center text-light/20">
                                    Heritage Image (4:3)
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Heritage;
