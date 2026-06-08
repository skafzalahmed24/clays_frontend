import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND_CONFIG } from '../../utils/config';

const SEO = ({ title, description, image, url }) => {
    // const { data: settings } = useGetSettingsQuery(); // No longer needed for SEO

    const siteTitle = BRAND_CONFIG.meta.title || "Clarysays";
    const defaultDescription = BRAND_CONFIG.meta.description || "Clarysays offers a curated collection of dark luxury jewelry, crafted for moments of elegance.";
    const defaultImage = BRAND_CONFIG.meta.image || "https://Clarysays.com/og-image.jpg";
    const siteUrl = BRAND_CONFIG.meta.url || "https://Clarysays.com";

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={url || siteUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || siteUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
