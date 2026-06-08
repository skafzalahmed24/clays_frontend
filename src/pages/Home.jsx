import React, { useEffect } from 'react';
import SEO from '../components/common/SEO';
import Hero from '../components/sections/Hero';
import TrustBarriers from '../components/sections/TrustBarriers';
import Categories from '../components/sections/Categories';
import FeaturedCollection from '../components/sections/FeaturedCollection';
import Heritage from '../components/sections/Heritage';
import Testimonials from '../components/sections/Testimonials';
import SocialFeed from '../components/sections/SocialFeed';
import { useGetPageQuery } from '../store/api/contentApiSlice';

const Home = () => {
    const { data: pageData } = useGetPageQuery('home');

    useEffect(() => {
        if (pageData && window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                // Delay to allow children components to fully render and calculate heights
                const timer = setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [pageData]);

    return (
        <>
            <SEO
                title={pageData?.seo?.title || "Home"}
                description={pageData?.seo?.description || "Clarysays offers a curated collection of dark luxury jewelry, crafted for moments of elegance."}
            />
            <div id="hero"><Hero /></div>
            <div id="trustbadges"><TrustBarriers /></div>
            <div id="categories"><Categories title={pageData?.modules?.categories?.title} /></div>
            <div id="featured"><FeaturedCollection title={pageData?.modules?.featured?.title} /></div>
            <div id="heritage"><Heritage /></div>
            <div id="testimonials"><Testimonials title={pageData?.modules?.testimonials?.title} /></div>
            <div id="socialfeed"><SocialFeed title={pageData?.modules?.social?.title} followLink={pageData?.modules?.social?.link} /></div>
        </>
    );
};

export default Home;
