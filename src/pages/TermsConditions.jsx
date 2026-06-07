import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader'; // Using consistent layout Header

const TermsConditions = () => {
    const { data: pageData } = useGetPageQuery('terms-conditions');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const data = pageData?.modules || {};
    const sections = data.sections || [
        {
            title: "1. Introduction",
            content: "Welcome to Mershai. These Terms and Conditions govern your use of our website and services. By accessing or using our site, you agree to be bound by these terms."
        },
        {
            title: "2. Intellectual Property",
            content: "The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights."
        },
        {
            title: "3. Use License",
            content: "Permission is granted to temporarily download one copy of the materials (information or software) on Mershai's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
        }
    ];

    return (
        <div className="pt-0 min-h-screen bg-[#050505] text-white/80">
            <PageHeader
                title="Terms & Conditions"
                eyebrow="Legal"
                subtitle="Guidelines for using our services."
            />

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-8 font-light leading-relaxed text-sm md:text-base">
                {sections.map((section, index) => (
                    <section key={index}>
                        <h3 className="text-xl font-serif text-white mb-4">{section.title}</h3>
                        <div className="whitespace-pre-wrap">{section.content}</div>
                    </section>
                ))}

                <section className="border-t border-white/10 pt-8 mt-12">
                    <p className="text-white/50 text-xs">Last Updated: {data.lastUpdated || "December 2025"}</p>
                </section>
            </div>
        </div>
    );
};

export default TermsConditions;
