import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Icons from '../components/ui/Icons';
import { useGetBlogByIdQuery } from '../store/api/blogApiSlice';
import { useGetSettingsQuery } from '../store/api/contentApiSlice';
import { BRAND_CONFIG } from '../utils/config';
import DOMPurify from 'dompurify';
import SEO from '../components/common/SEO';

const JournalDetails = () => {
    const { id } = useParams();
    const { data: post, isLoading: loading, error } = useGetBlogByIdQuery(id);
    const { data: settings } = useGetSettingsQuery();

    // Use dynamic settings if available, else fallback to BRAND_CONFIG
    const socialLinks = settings?.socialLinks || BRAND_CONFIG.socialHandles;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-body flex items-center justify-center text-white/50">Loading...</div>;
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-body text-text-main font-body flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-heading text-primary mb-4">Article Not Found</h2>
                    <Link to="/journal" className="text-light hover:text-white underline">Return to Journal</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-body text-text-main font-body">
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.image}
            />
            <PageHeader
                title={post.title}
                eyebrow={post.category}
                backgroundImage={post.image}
            />

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-light/60 mb-12 uppercase tracking-widest border-b border-light/10 pb-6">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                    <span>By {post.author || 'Admin'}</span>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-lg max-w-none mb-16 font-light leading-relaxed text-light/80">
                    <div dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            (() => {
                                const txt = document.createElement("textarea");
                                txt.innerHTML = post.content;
                                return txt.value;
                            })()
                        )
                    }} />
                </div>

                {/* Footer / Navigation */}
                <div className="border-t border-light/10 pt-12 flex justify-between items-center">
                    <Link to="/journal" className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm uppercase tracking-widest font-heading">
                        <span className="rotate-180">➜</span> Back to Journal
                    </Link>

                    <div className="flex gap-4">
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-primary hover:text-dark transition-colors">
                                <Icons.Instagram className="w-4 h-4" />
                            </a>
                        )}
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-primary hover:text-dark transition-colors">
                                <Icons.Facebook className="w-4 h-4" />
                            </a>
                        )}
                        {socialLinks.youtube && (
                            <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-primary hover:text-dark transition-colors">
                                <Icons.YouTube className="w-4 h-4" />
                            </a>
                        )}
                        {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary hover:bg-primary hover:text-dark transition-colors">
                                <Icons.Twitter className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalDetails;
