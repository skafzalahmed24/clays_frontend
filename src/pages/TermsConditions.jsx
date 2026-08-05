import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader'; // Using consistent layout Header
import { TERMS_CONDITIONS_FALLBACK } from '../utils/defaultContent';

const TermsConditions = () => {
    const { data: pageData } = useGetPageQuery('terms-conditions');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const data = pageData?.modules || {};
    const sections = data.sections || TERMS_CONDITIONS_FALLBACK;
    const header = data.header || {};

    return (
        <div className="pt-0 min-h-screen bg-body text-black/80">
            <PageHeader
                title={header.title || "Terms & Conditions"}
                eyebrow={header.eyebrow || "Legal"}
                subtitle={header.subtitle || "Guidelines for using our services."}
                backgroundImage={header.bannerImage}
            />

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-8 font-light leading-relaxed text-sm md:text-base">
                {sections.map((section, index) => (
                    <section key={index}>
                        <h3 className="text-xl font-serif text-black mb-4">{section.title}</h3>
                        <div className="whitespace-pre-wrap">{section.content}</div>
                    </section>
                ))}

                <section className="border-t border-black/10 pt-8 mt-12">
                    <p className="text-black/50 text-xs">Last Updated: {data.lastUpdated || "December 2025"}</p>
                </section>
            </div>
        </div>
    );
};

export default TermsConditions;
