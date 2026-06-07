import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAttributesQuery } from '../store/api/attributeApiSlice';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';
import { getMediaUrl } from '../utils/apiConfig';
import SEO from '../components/common/SEO';
import heroImg from '../assets/hero.png';

const Collections = () => {
    const { data: attributesData } = useGetAttributesQuery();
    const { data: pageData } = useGetPageQuery('collections');

    const collections = attributesData?.collections || [];

    const header = pageData?.modules?.header || {
        title: "Our Collections",
        eyebrow: "Curated Elegance",
        subtitle: "Discover themes that resonate with your style, from heritage classics to contemporary masterpieces.",
        bannerImage: heroImg
    };

    // We now iterate over dynamic collections
    // Note: The original code filtered by checking if category exists. 
    // Now the "Collection" IS the entity. We assume it links to a category with same name.

    // Safety check if collections is empty
    if (!collections.length) {
        // Optional: Loading state or default static fallback if needed.
        // For dynamic request, we just show what's there.
    }
    return (
        <div className="pt-0 min-h-screen bg-[#050505]">
            <SEO
                title={pageData?.seo?.title || "Our Collections"}
                description={pageData?.seo?.description || "Discover themes that resonate with your style."}
            />
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage || heroImg}
            />

            {/* Collections Grid */}
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {collections.map((collection) => (
                        <Link
                            to={`/shop?collection=${encodeURIComponent(collection.name)}`}
                            key={collection.id || collection._id}
                            className="group cursor-pointer relative aspect-[4/5] overflow-hidden rounded-sm"
                        >
                            <img
                                src={getMediaUrl(collection.img || 'https://via.placeholder.com/800')}
                                alt={collection.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 text-center transition-opacity duration-500">
                                <h2 className="text-3xl font-serif text-white mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {collection.name}
                                </h2>
                                <div className="h-0.5 w-12 bg-primary mx-auto mb-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100"></div>
                                <p className="text-white/70 font-light text-sm tracking-wide opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                    {collection.description}
                                </p>
                                <button className="mt-8 mx-auto px-6 py-2 border border-white/20 text-white text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black hover:border-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 delay-300">
                                    Explore Collection
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Collections;
