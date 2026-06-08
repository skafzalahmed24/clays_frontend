import React, { useEffect, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import heroImg from '../assets/hero-3.png';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../utils/apiConfig';
import client from '../api/client';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import SEO from '../components/common/SEO';

const Journal = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch page data using hook
    const { data: pageData } = useGetPageQuery('journal');

    const header = pageData?.modules?.header || {
        title: "Stories & Style",
        eyebrow: "The Clarysays Journal",
        bannerImage: heroImg
    };

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogsRes = await client.get('/blogs');
                setBlogs(blogsRes.data.blogs || []);
            } catch (error) {
                console.error('Failed to fetch journal data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <div className="pt-0 min-h-screen bg-[#050505]">
            <SEO
                title={pageData?.seo?.title || "Journal"}
                description={pageData?.seo?.description || "Read our latest stories."}
            />
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage || heroImg}
            />

            {/* Blog Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                {loading ? (
                    <div className="text-center text-white/50">Loading articles...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(blogs && Array.isArray(blogs) ? blogs : []).map((post) => (
                            <article key={post._id} className="group cursor-pointer flex flex-col h-full">
                                <div className="relative aspect-[3/2] overflow-hidden mb-6 rounded-sm">
                                    <img
                                        src={getMediaUrl(post.image)}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-1 text-xs text-white uppercase tracking-widest border border-white/10">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-4 text-xs text-white/40 mb-3 uppercase tracking-wider">
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                        <span>By {post.author || 'Admin'}</span>
                                    </div>
                                    <h2 className="text-2xl font-serif text-white mb-3 leading-tight group-hover:text-primary transition-colors duration-300">
                                        {post.title}
                                    </h2>
                                    <p className="text-white/60 font-light leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="mt-auto">
                                    <Link to={`/journal/${post._id}`} className="inline-flex items-center text-primary text-xs uppercase tracking-[0.2em] group-hover:underline">
                                        Read Article <span className="ml-2 text-lg">→</span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Journal;
