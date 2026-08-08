import React from 'react';
import { useGetSocialFeedQuery, useGetSettingsQuery } from '../../store/api/contentApiSlice';
import Icons from '../ui/Icons';
import { BRAND_CONFIG } from '../../utils/config';
import { API_URL, BASE_URL, getMediaUrl } from '../../utils/apiConfig';
import { REGEX } from '../../utils/regex';

const SocialFeed = ({ title, followLink }) => {
    const { data: socialFeed, isLoading: loading } = useGetSocialFeedQuery();
    useGetSettingsQuery();

    if (loading) return null;
    if (!socialFeed || !Array.isArray(socialFeed) || socialFeed.length === 0) return null;

    const displayTitle = title || "@ClarysaysOfficial";
    const followUrl = followLink || "https://www.instagram.com";

    return (
        <section className="py-6 md:py-8">
            <div className="w-full px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 gap-4">
                    <h2 className="text-xl md:text-3xl font-heading text-center md:text-left">{displayTitle}</h2>
                    <a href={followUrl} className="flex items-center gap-2 text-accent hover:opacity-70 transition-opacity text-sm uppercase tracking-widest">
                        Follow Us <span className="text-xl">&rarr;</span>
                    </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {socialFeed.slice(0, 4).map((post) => (
                        <a href={post.link || '#'} key={post._id} className="relative group overflow-hidden aspect-square block">
                            {REGEX.IS_VIDEO.test(post.media) ? (
                                <video
                                    src={getMediaUrl(post.media)}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : (
                                <img src={getMediaUrl(post.media)} alt={post.platform} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            )}
                            <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="text-black">
                                    {post.platform === 'Facebook' ? <Icons.Facebook /> : <Icons.Instagram />}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialFeed;
