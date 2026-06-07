import React from 'react';
import { useGetHeritageQuery } from '../../store/api/contentApiSlice';
import { API_URL, BASE_URL, getMediaUrl } from '../../utils/apiConfig';
import { BRAND_CONFIG } from '../../utils/config';
import { Link } from 'react-router-dom';

const Heritage = () => {
    const { data: heritage, isLoading: loading } = useGetHeritageQuery();

    if (loading) {
        return (
            <section className="py-24">
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
        <section className="py-24">
            <div className="w-full px-6 md:px-12">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 transform rotate-1 rounded-3xl -z-10 hidden md:block"></div>
                    <div className="overflow-hidden flex flex-col md:flex-row shadow-2xl bg-current-surface">
                        <div className="md:w-1/2 h-[500px]">
                            {content.image ? (
                                <img src={getMediaUrl(content.image)} alt="Heritage" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-dark-paper flex items-center justify-center text-light/20">
                                    Heritage Image
                                </div>
                            )}
                        </div>
                        <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
                            <span className="text-accent text-sm uppercase tracking-widest mb-4">{content.subtitle}</span>
                            <h2 className="text-3xl md:text-5xl font-heading mb-6">{content.title}</h2>
                            <p className="opacity-80 text-lg leading-relaxed mb-8 font-light">
                                {content.description}
                            </p>
                            <Link
                                to={content.link || '/about'}
                                className="self-start px-8 py-3 border border-accent text-accent hover:border-primary hover:text-primary transition-colors uppercase tracking-widest text-sm"
                            >
                                {content.linkText || 'Read Our Story'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Heritage;
