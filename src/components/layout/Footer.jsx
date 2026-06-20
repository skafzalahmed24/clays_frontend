import React from 'react';
import { Link } from 'react-router-dom';
import { useGetSettingsQuery } from '../../store/api/contentApiSlice';
import Icons from '../ui/Icons';
import { BRAND_CONFIG } from '../../utils/config';
import Image from '../ui/Image';

const Footer = () => {
    const { data: settings } = useGetSettingsQuery();

    // Use dynamic settings if available, else fallback
    const socialLinks = settings?.socialLinks || {};

    return (
        <footer className="bg-dark text-light border-t border-light/10 pt-20 pb-10">
            <div className="w-full px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="inline-block">
                            <Image 
                                src={settings?.identity?.footerLogo || settings?.identity?.logo || BRAND_CONFIG.logo} 
                                alt={settings?.identity?.brandName || BRAND_CONFIG.brandName} 
                                className="h-32 mb-6" 
                                isStatic={!settings?.identity?.footerLogo && !settings?.identity?.logo}
                            />
                        </Link>
                        <p className="text-light/70 text-sm leading-relaxed mb-6">
                            {BRAND_CONFIG.meta.description}
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            {/* Social Icons */}
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-light/10 flex items-center justify-center hover:bg-primary hover:text-dark transition-colors"><Icons.Instagram /></a>
                            )}
                            {socialLinks.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-light/10 flex items-center justify-center hover:bg-primary hover:text-dark transition-colors"><Icons.Facebook /></a>
                            )}
                            {socialLinks.youtube && (
                                <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-light/10 flex items-center justify-center hover:bg-primary hover:text-dark transition-colors"><Icons.YouTube /></a>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Links */}
                    {settings?.footerLinks?.length > 0 ? (
                        settings.footerLinks.map((section, index) => (
                            <div key={index}>
                                <h4 className="font-heading text-light text-lg mb-6">{section.title}</h4>
                                <ul className="space-y-3 text-light/70 text-sm">
                                    {section.links.map((link, lIndex) => (
                                        <li key={lIndex}>
                                            <Link to={link.url} className="hover:text-primary transition-colors">{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <>
                            {/* Fallback Static Links if no dynamic data */}
                            <div>
                                <h4 className="font-heading text-light text-lg mb-6">Shop</h4>
                                <ul className="space-y-3 text-light/70 text-sm">
                                    <li><Link to="/new-arrivals" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-heading text-light text-lg mb-6">Support</h4>
                                <ul className="space-y-3 text-light/70 text-sm">
                                    <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                    <li><Link to="/journal" className="hover:text-primary transition-colors">Journal</Link></li>
                                    <li><Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
                                    <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                                    <li><Link to="/shipping-returns" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                                    <li><Link to="/care-guide" className="hover:text-primary transition-colors">Care Guide</Link></li>
                                    <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                                    <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                                    <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="border-t border-light/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-light/50">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <p>&copy; {new Date().getFullYear()} {settings?.identity?.brandName || settings?.storeName || BRAND_CONFIG.brandName}. All rights reserved.</p>
                        <span className="hidden md:inline text-light/20">|</span>
                        <p className="font-mono opacity-80">v{BRAND_CONFIG.version}</p>
                    </div>
                    <div className="flex gap-4">
                        <span>VISA</span>
                        <span>MASTERCARD</span>
                        {/* <span>AMEX</span>
                        <span>PAYPAL</span> */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
