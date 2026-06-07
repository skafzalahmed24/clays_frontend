import React, { useEffect } from 'react';
import { useGetFAQsQuery, useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';
import { MEGA_MENU_DATA } from '../utils/constants';
import SEO from '../components/common/SEO';

const FAQ = () => {
    const { data: faqs, isLoading: loading } = useGetFAQsQuery();
    const { data: pageData } = useGetPageQuery('faq');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const displayFAQs = faqs || [];

    const header = pageData?.modules?.header || {
        title: "Frequently Asked Questions",
        eyebrow: "Help Center",
        subtitle: "Answers to common questions about our products and services.",
        bannerImage: MEGA_MENU_DATA["Rings"]?.featured?.img
    };

    return (
        <div className="pt-0 min-h-screen bg-[#050505] text-white/80">
            <SEO
                title={pageData?.seo?.title || "FAQ"}
                description={pageData?.seo?.description}
            />
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage || MEGA_MENU_DATA["Rings"]?.featured?.img}
            />

            <div className="max-w-3xl mx-auto px-6 md:px-12 py-16">
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-8 text-light/50">Loading FAQs...</div>
                    ) : displayFAQs.length === 0 ? (
                        <div className="text-center py-8 text-light/50">No FAQs found.</div>
                    ) : (
                        displayFAQs.map((faq, index) => (
                            <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-sm hover:border-primary/30 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                <h4 className="text-lg font-serif text-white mb-3">{faq.question || faq.q}</h4>
                                <p className="font-light text-white/70 leading-relaxed text-sm whitespace-pre-wrap">
                                    {faq.answer || faq.a}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-12 text-center text-white/50 text-sm">
                    <p>Still have questions?</p>
                    <a href="/contact" className="text-primary hover:underline mt-2 inline-block">Contact Support</a>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
