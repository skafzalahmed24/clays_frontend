import React from 'react';
import { useGetTrustBadgesQuery } from '../../store/api/contentApiSlice';

const TrustBarriers = () => {
    const { data: trustBadges, isLoading: loading } = useGetTrustBadgesQuery();

    const displayBadges = trustBadges?.length > 0 ? trustBadges : [
        { text: "Ethically Sourced", icon: "✦" },
        { text: "Handcrafted Excellence", icon: "✦" },
        { text: "Lifetime Warranty", icon: "✦" },
        { text: "Secure Shipping", icon: "✦" }
    ];

    if (loading && (!trustBadges || trustBadges.length === 0)) {
        return null; // Or a subtle skeleton
    }

    return (
        <section className="py-12 border-y border-white/10 bg-dark-paper/50">
            <div className="w-full px-6 md:px-12 flex flex-wrap justify-center md:justify-around items-center gap-8 text-center text-light/80">
                {displayBadges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-primary text-xl">{badge.icon || '✦'}</span>
                        <span className="font-heading text-sm tracking-widest uppercase">{badge.text}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TrustBarriers;
