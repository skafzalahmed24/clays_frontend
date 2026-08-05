import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';
import { MEGA_MENU_DATA } from '../utils/constants';
import { SHIPPING_RETURNS_FALLBACK } from '../utils/defaultContent';

const ShippingReturns = () => {
    const { data: pageData } = useGetPageQuery('shipping-returns');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const data = pageData?.modules || {};
    const sections = data.sections || SHIPPING_RETURNS_FALLBACK;
    const header = data.header || {};

    return (
        <div className="pt-0 min-h-screen bg-body text-black/80">
            <PageHeader
                title={header.title || "Shipping & Returns"}
                eyebrow={header.eyebrow || "Customer Service"}
                subtitle={header.subtitle || "Everything you need to know about our delivery and return policies."}
                backgroundImage={header.bannerImage || MEGA_MENU_DATA["New Arrivals"]?.featured?.img}
            />

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-12">
                {sections.map((section, index) => (
                    <section key={index}>
                        <h3 className="text-2xl font-serif text-black mb-6">{section.title}</h3>
                        <div className="space-y-4 font-light leading-relaxed whitespace-pre-wrap">
                            {section.content}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default ShippingReturns;
