import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';
import { PRIVACY_POLICY_FALLBACK } from '../utils/defaultContent';

const PrivacyPolicy = () => {
    const { data: pageData, isLoading: loading } = useGetPageQuery('privacy-policy');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const data = pageData?.modules || {};
    const sections = data.sections || PRIVACY_POLICY_FALLBACK;
    const header = data.header || {};

    return (
        <div className="pt-0 min-h-screen bg-body text-black/80">
            <PageHeader
                title={header.title || "Privacy Policy"}
                eyebrow={header.eyebrow || "Legal"}
                subtitle={header.subtitle || "How we collect, use, and protect your data."}
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

export default PrivacyPolicy;
