import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';

const PrivacyPolicy = () => {
    const { data: pageData, isLoading: loading } = useGetPageQuery('privacy-policy');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const data = pageData?.modules || {};
    const sections = data.sections || [
        {
            title: "1. Introduction",
            content: "Mershai (\"we\", \"our\", \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website."
        },
        {
            title: "2. Information We Collect",
            content: "We may collect information about you in a variety of ways. The information we may collect on the Site includes:\n\n• Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number that you voluntarily give to us when you register or make a purchase.\n• Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site."
        },
        {
            title: "3. Use of Your Information",
            content: "Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:\n\n• Process your payments and fulfill your orders.\n• Create and manage your account.\n• Email you regarding your account or order.\n• Perform business analysis to understand how our users use the website."
        },
        {
            title: "4. Security of Your Information",
            content: "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse."
        }
    ];

    return (
        <div className="pt-0 min-h-screen bg-[#050505] text-white/80">
            <PageHeader
                title="Privacy Policy"
                eyebrow="Legal"
                subtitle="How we collect, use, and protect your data."
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

export default PrivacyPolicy;
