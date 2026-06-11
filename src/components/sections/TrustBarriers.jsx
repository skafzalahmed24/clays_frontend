import React from 'react';
import { useGetTrustBadgesQuery } from '../../store/api/contentApiSlice';

const TrustBarriers = () => {
    const { data: trustBadges, isLoading: loading } = useGetTrustBadgesQuery();

    const badges = trustBadges?.length > 0
        ? trustBadges
        : [
            { text: "Ethically Sourced", icon: "✦" },
            { text: "Handcrafted Excellence", icon: "✦" },
            { text: "Lifetime Warranty", icon: "✦" },
            { text: "Secure Shipping", icon: "✦" }
        ];

    if (loading && (!trustBadges || trustBadges.length === 0)) {
        return null;
    }

    return (
        <section className="relative overflow-hidden py-5 border-y border-white/10 bg-dark-paper/50">
            <div className="trust-ribbon flex items-center whitespace-nowrap">
                {[...badges, ...badges].map((badge, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 px-10 flex-shrink-0"
                    >
                        <span className="text-primary text-xl">
                            {badge.icon || '✦'}
                        </span>
                        <span className="font-heading text-sm tracking-[0.2em] uppercase text-light/80">
                            {badge.text}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TrustBarriers;