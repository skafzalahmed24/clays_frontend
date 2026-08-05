/* eslint-disable */
import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';
import { BRAND_CONFIG } from '../utils/config';
import storyImgDefault from '../assets/story.png';
// eslint-disable-next-line
import heroImg from '../assets/hero-3.png';
import { API_URL, BASE_URL, getMediaUrl } from '../utils/apiConfig';
import SEO from '../components/common/SEO';

function About() {
    const { data: pageData } = useGetPageQuery('about');

    const pages = { about: pageData }; // Adapt to existing structure or refactor below
    // Actually, let's just use pageData directly if the API returns the module structure directly
    // The API probably returns { status: 1, data: { ...pageObject } }

    // Based on slice logic, fetchPage('about') put data into pages['about']
    // So pageData here corresponds to pages['about']

    const aboutData = pageData?.modules || {};

    // Helper to get image URL (dynamic or default)
    const getStoryImage = () => {
        if (aboutData.story?.image) {
            return getMediaUrl(aboutData.story.image);
        }
        return storyImgDefault;
    };

    const hasValues = aboutData.values && aboutData.values.length > 0 && aboutData.values.some(v => v.title);

    return (
        <div className="pt-0 min-h-screen bg-body text-black">
            <SEO
                title={pageData?.seo?.title}
                description={pageData?.seo?.description}
            />
            <PageHeader
                title={aboutData.header?.title ? (
                    <span dangerouslySetInnerHTML={{ __html: aboutData.header.title }} />
                ) : (
                    <span>The Essence of <br /><span className="italic text-primary">{BRAND_CONFIG.brandName}</span></span>
                )}
                eyebrow={aboutData.header?.eyebrow || "Since 19832345"}
                subtitle={aboutData.header?.subtitle}
                backgroundImage={aboutData.header?.bannerImage || heroImg}
            />

            {/* Our Story */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                            {aboutData.story?.title ? (
                                <span dangerouslySetInnerHTML={{ __html: aboutData.story.title }} />
                            ) : (
                                <>Nurturing beauty through <br /><span className="text-primary italic">nature's purity.</span></>
                            )}
                        </h2>
                        <div className="w-24 h-0.5 bg-primary/50 mb-8"></div>
                        <p className="text-black/70 text-lg font-light leading-relaxed mb-6 whitespace-pre-wrap">
                            {aboutData.story?.content ||
                                "Born from a profound respect for nature, we believe in the healing power of earth's finest botanicals. For over a decade, we have been crafting herbal skin and hair care products that blend ancient Ayurvedic wisdom with modern science.\n\nEvery formulation is a testament to purity, crafted without harsh chemicals or synthetics. We believe that true luxury lies in authentic, natural ingredients that nourish your skin, strengthen your hair, and revitalize your soul."
                            }
                        </p>
                    </div>
                    <div className="order-1 md:order-2 relative aspect-[4/5] md:aspect-[3/4]">
                        <img
                            src={getStoryImage()}
                            alt="Our Story"
                            className="w-full h-full object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute -bottom-8 -left-8 w-48 h-48 border border-primary/30 z-[-1] hidden md:block"></div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-black/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {hasValues ? (
                            // Dynamic Values
                            aboutData.values.map((val, idx) => (
                                val.title && (
                                    <div key={idx} className="p-8 border border-black/5 hover:border-primary/30 transition-colors duration-500">
                                        <h3 className="text-2xl font-serif text-black mb-4">{val.title}</h3>
                                        <p className="text-black/60 font-light">{val.description}</p>
                                    </div>
                                )
                            ))
                        ) : (
                            // Static Fallback
                            <>
                                <div className="p-8 border border-black/5 hover:border-primary/30 transition-colors duration-500">
                                    <h3 className="text-2xl font-serif text-black mb-4">100% Natural</h3>
                                    <p className="text-black/60 font-light">Crafted purely from organically grown herbs and botanical extracts.</p>
                                </div>
                                <div className="p-8 border border-black/5 hover:border-primary/30 transition-colors duration-500">
                                    <h3 className="text-2xl font-serif text-black mb-4">Cruelty Free</h3>
                                    <p className="text-black/60 font-light">Ethically tested and never tested on animals. Good for you, kind to earth.</p>
                                </div>
                                <div className="p-8 border border-black/5 hover:border-primary/30 transition-colors duration-500">
                                    <h3 className="text-2xl font-serif text-black mb-4">Holistic Wellness</h3>
                                    <p className="text-black/60 font-light">Formulas designed to balance your inner health and outer radiance.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Founder/Signature */}
            <section className="py-32 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <p className="text-2xl md:text-3xl font-serif italic text-black/90 leading-relaxed mb-12">
                        "{aboutData.founder?.quote || "True beauty is a reflection of wellness. When we nurture our bodies with nature's gifts, our skin glows and our hair flourishes."}"
                    </p>
                    <p className="text-primary uppercase tracking-[0.2em] text-sm">Founder, {BRAND_CONFIG.brandName}</p>
                </div>
            </section>
        </div>
    );
}

export default About;

