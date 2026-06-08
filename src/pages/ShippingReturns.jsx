import React, { useEffect } from 'react';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/layout/PageHeader';
import { MEGA_MENU_DATA } from '../utils/constants';

const ShippingReturns = () => {
    const { data: pageData } = useGetPageQuery('shipping-returns');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const data = pageData?.modules || {};
    const sections = data.sections || [
        {
            title: "Shipping Policy",
            content: "At Clarysays, we ensure that your jewellery reaches you in perfect condition. We offer free secure shipping on all orders within India.\n\n• All orders are shipped via insured couriers.\n• Standard delivery time is 5-7 business days.\n• Express delivery options are available at checkout for select PIN codes.\n• You will receive a tracking number via email once your order is dispatched.\n• We require a signature upon delivery for security purposes."
        },
        {
            title: "Return & Exchange Policy",
            content: "We want you to love your purchase. If for any reason you are not completely satisfied, we offer a hassle-free return policy.\n\n30-Day Returns: You may return unworn, undamaged items within 30 days of delivery.\n\n• Items must be returned in their original packaging with all tags and certificates.\n• Custom-made or personalized jewellery is not eligible for return.\n• Refunds will be processed to the original method of payment within 7-10 business days after inspection.\n\nTo initiate a return, please contact our support team."
        }
    ];

    return (
        <div className="pt-0 min-h-screen bg-[#050505] text-white/80">
            <PageHeader
                title="Shipping & Returns"
                eyebrow="Customer Service"
                subtitle="Everything you need to know about our delivery and return policies."
                backgroundImage={MEGA_MENU_DATA["New Arrivals"]?.featured?.img}
            />

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-12">
                {sections.map((section, index) => (
                    <section key={index}>
                        <h3 className="text-2xl font-serif text-white mb-6">{section.title}</h3>
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
