import React from 'react';
import { useSubmitContactMutation } from '../store/api/contactApiSlice';
import { useGetSettingsQuery, useGetPageQuery } from '../store/api/contentApiSlice';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/layout/PageHeader';
import { BRAND_CONFIG } from '../utils/config';
import Icons from '../components/ui/Icons';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import heroImg from '../assets/hero.png';
import SEO from '../components/common/SEO';

const Contact = () => {
    const { data: settings, isLoading: loading } = useGetSettingsQuery();
    const { data: pageData } = useGetPageQuery('contact');
    const { showToast } = useToast();
    const [submitContact, { isLoading: isSubmitting }] = useSubmitContactMutation();

    // Use dynamic settings if available, else fallback to BRAND_CONFIG
    const address = settings?.address || BRAND_CONFIG.contact.address;
    const phone = settings?.contactPhone || BRAND_CONFIG.contact.phone;
    const email = settings?.supportEmail || BRAND_CONFIG.contact.email;

    const header = pageData?.modules?.header || {};

    return (
        <div className="pt-0 min-h-screen bg-body text-black">
            <SEO
                title={pageData?.seo?.title || "Contact Us"}
                description={pageData?.seo?.description || "Get in touch with us."}
            />
            <PageHeader
                title={header.title || "Contact Us"}
                subtitle={header.subtitle || "We are here to assist you. Whether you have a question about a product, need styling advice, or want to discuss a custom commission."}
                eyebrow={header.eyebrow}
                backgroundImage={header.bannerImage || heroImg}
            />

            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        {loading && !settings ? (
                            <div className="text-black/50">Loading contact details...</div>
                        ) : (
                            <div className="space-y-12">
                                {settings?.addresses && settings.addresses.length > 0 ? (
                                    settings.addresses.map((addr, index) => (
                                        <div key={index}>
                                            <h3 className="text-primary text-sm uppercase tracking-[0.2em] mb-4 font-bold">Visit Our Boutique {settings.addresses.length > 1 ? `#${index + 1}` : ''}</h3>
                                            <p className="text-2xl font-serif mb-2">{addr.line1}</p>
                                            <p className="text-black/60 font-light">{addr.line2}</p>
                                            <p className="text-black/60 font-light">{addr.city}, {addr.pincode}</p>
                                            <p className="text-black/60 font-light uppercase tracking-widest text-xs mt-1">{addr.country}</p>
                                            <div className="mt-6 flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr.line1}, ${addr.city}, ${addr.pincode}, ${addr.country}`)}`;
                                                        window.open(addr.googleMapsUrl || searchUrl, '_blank');
                                                    }}
                                                    className="px-6 py-2 border border-black/20 text-sm hover:border-primary hover:text-primary transition-colors"
                                                >
                                                    Get Directions
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>
                                        <h3 className="text-primary text-sm uppercase tracking-[0.2em] mb-4 font-bold">Visit Our Boutique</h3>
                                        <p className="text-2xl font-serif mb-2">{address.line1}</p>
                                        <p className="text-black/60 font-light">{address.line2}</p>
                                        <p className="text-black/60 font-light">{address.city}, {address.pincode}</p>
                                        <p className="text-black/60 font-light uppercase tracking-widest text-xs mt-1">{address.country || 'India'}</p>
                                        <div className="mt-6 flex gap-4">
                                            <button
                                                onClick={() => {
                                                    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address.line1}, ${address.city}, ${address.pincode}, ${address.country || 'India'}`)}`;
                                                    window.open(address.googleMapsUrl || searchUrl, '_blank');
                                                }}
                                                className="px-6 py-2 border border-black/20 text-sm hover:border-primary hover:text-primary transition-colors"
                                            >
                                                Get Directions
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-primary text-sm uppercase tracking-[0.2em] mb-4 font-bold">Contact Details</h3>
                                    <div className="space-y-3">
                                        <a href={`tel:${phone}`} className="flex items-center gap-4 text-black/80 hover:text-primary transition-colors">
                                            <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-primary"><Icons.Phone /></span>
                                            {phone}
                                        </a>
                                        <a href={`mailto:${email}`} className="flex items-center gap-4 text-black/80 hover:text-primary transition-colors">
                                            <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-primary"><Icons.Email /></span>
                                            {email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}


                        <div>
                            <h3 className="text-primary text-sm uppercase tracking-[0.2em] mb-4 font-bold">Opening Hours</h3>
                            <div className="space-y-4 text-black/60 font-light text-sm">
                                {settings?.openingHours && settings.openingHours.length > 0 ? (
                                    settings.openingHours.map((hour, index) => (
                                        <div key={index}>
                                            <span className="block text-black mb-1">{hour.label}</span>
                                            {hour.value}
                                        </div>
                                    ))
                                ) : (
                                    // Fallback
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-black mb-1">Mon - Sat</span>
                                            11:00 AM - 8:00 PM
                                        </div>
                                        <div>
                                            <span className="block text-black mb-1">Sunday</span>
                                            11:00 AM - 6:00 PM
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-black/5 p-8 md:p-12 border border-black/5">
                        <h2 className="text-2xl font-serif mb-8">Send us a Message</h2>
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = {
                                firstName: formData.get('firstName'),
                                lastName: formData.get('lastName'),
                                email: formData.get('email').toLowerCase(),
                                subject: formData.get('subject'),
                                message: formData.get('message')
                            };

                            try {
                                await submitContact(data).unwrap();
                                showToast('Message sent successfully!', 'success');
                                e.target.reset();
                            } catch (err) {
                                showToast('Failed to send message: ' + (err.data?.message || err.message || 'Error occurred'), 'error');
                            }
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-black/60">
                                        First Name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input name="firstName" required type="text" placeholder="John" className="bg-white border-black/10 text-black placeholder:text-black/40" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-black/60">
                                        Last Name <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input
                                        name="lastName"
                                        required
                                        type="text"
                                        placeholder="Doe"
                                        className="bg-white border-black/10 text-black placeholder:text-black/40"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-black/60">
                                    Email Address <span className="text-red-500 ml-1">*</span>
                                </label>
                                <Input
                                    name="email"
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    className="bg-white border-black/10 text-black placeholder:text-black/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-black/60">
                                    Subject <span className="text-red-500 ml-1">*</span>
                                </label>
                                <Select
                                    name="subject"
                                    className="bg-white border-black/10 text-black"
                                    options={settings?.contactSubjects && settings.contactSubjects.length > 0
                                        ? settings.contactSubjects.map(s => ({ value: s, label: s }))
                                        : [
                                            { value: "General Inquiry", label: "General Inquiry" },
                                            { value: "Custom Order", label: "Custom Order" },
                                            { value: "Appointment Request", label: "Appointment Request" },
                                            { value: "Feedback", label: "Feedback" }
                                        ]
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-black/60">
                                    Message <span className="text-red-500 ml-1">*</span>
                                </label>
                                <Textarea name="message" required rows="5" placeholder="How can we help you?" className="bg-white border-black/10 text-black placeholder:text-black/40" />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-primary text-black py-4 font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
