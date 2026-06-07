import React, { useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { MEGA_MENU_DATA } from '../utils/constants';
import { useGetPageQuery } from '../store/api/contentApiSlice';

const CareGuide = () => {
    const { data } = useGetPageQuery('care-guide');

    const header = data?.modules?.header || {
        title: "Jewellery Care Guide",
        eyebrow: "Maintenance",
        subtitle: "Tips to keep your precious pieces shining forever.",
        bannerImage: MEGA_MENU_DATA["Necklaces"]?.featured?.img
    };

    const sections = data?.modules?.sections || [
        {
            title: "Gold Jewellery",
            content: "Gold is a timeless metal but can lose its luster over time if not cared for.",
            points: [
                "Clean regularly with mild soap and warm water.",
                "Use a soft-bristled brush to remove dirt from intricate designs.",
                "Avoid exposure to harsh chemicals like chlorine or bleach.",
                "Store separately in a soft cloth pouch to prevent scratches."
            ]
        },
        {
            title: "Diamond & Gemstones",
            content: "Precious stones require special attention to maintain their brilliance.",
            points: [
                "Clean diamonds with a mixture of ammonia and water or a specialized commercial cleaner.",
                "Check prong settings annually to ensure stones are secure.",
                "Avoid wearing gemstone jewellery while doing heavy manual work.",
                "Store gemstones separately as harder stones can scratch softer ones."
            ]
        },
        {
            title: "General Storage Tips",
            content: "Always store your jewellery in a dry place. Humidity can cause tarnishing. Using anti-tarnish strips in your jewellery box is highly recommended for silver and gold plated items. Fasten chains and clasps before storing to prevent tangling.",
            points: []
        }
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-0 min-h-screen bg-[#050505] text-white/80">
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage || MEGA_MENU_DATA["Necklaces"]?.featured?.img}
            />

            <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {sections.slice(0, 2).map((section, idx) => (
                        <section key={idx}>
                            <h3 className="text-xl font-serif text-primary mb-4">{section.title}</h3>
                            <p className="font-light leading-relaxed mb-4">
                                {section.content}
                            </p>
                            {section.points && section.points.length > 0 && (
                                <ul className="list-disc pl-5 space-y-2 text-sm marker:text-primary">
                                    {section.points.map((pt, pIdx) => (
                                        <li key={pIdx}>{pt}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                {sections.length > 2 && (
                    <div className="space-y-12">
                        {sections.slice(2).map((section, idx) => (
                            <section key={idx} className="bg-white/5 p-8 border border-white/10 rounded-sm">
                                <h3 className="text-2xl font-serif text-white mb-4">{section.title}</h3>
                                <p className="font-light leading-relaxed">
                                    {section.content}
                                </p>
                                {section.points && section.points.length > 0 && (
                                    <ul className="list-disc pl-5 mt-4 space-y-2 text-sm marker:text-primary">
                                        {section.points.map((pt, pIdx) => (
                                            <li key={pIdx}>{pt}</li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareGuide;
