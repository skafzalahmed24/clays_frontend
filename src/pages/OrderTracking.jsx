import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import heroImg from '../assets/hero.png';
import Icons from '../components/ui/Icons';
import Skeleton from '../components/ui/Skeleton';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import { useTrackOrderMutation } from '../store/api/orderApiSlice';
import SEO from '../components/common/SEO';
import Input from '../components/ui/Input';
import { usePrice } from '../hooks/usePrice';

const OrderTracking = () => {
    const { id } = useParams();
    const [orderId, setOrderId] = useState(id || '');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState(null); // null, 'loading', 'found', 'error'
    const [orderData, setOrderData] = useState(null);
    const { data: pageData } = useGetPageQuery('track-order');
    const [trackOrder] = useTrackOrderMutation();
    const { format } = usePrice();


    const header = pageData?.modules?.header || {
        title: "Track Your Order",
        eyebrow: "Order Management",
        subtitle: "Enter your order details below to check the current status.",
        bannerImage: heroImg
    };

    const handleTrack = async (e, overrideId) => {
        if (e) e.preventDefault();
        const searchId = overrideId || orderId;

        if (!searchId) return;
        if (!email && !phone && !overrideId) return;

        setStatus('loading');
        setOrderData(null);

        try {
            const data = await trackOrder({
                orderId: searchId,
                email: email,
                phone: phone
            }).unwrap();

            setStatus('found');
            setOrderData({
                id: data.id,
                status: data.status,
                date: new Date(data.date).toLocaleDateString(),
                items: data.items,
                total: format(data.total),
                timeline: data.timeline.map(step => ({
                    ...step,
                    date: step.date ? new Date(step.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : null
                }))
            });
        } catch (error) {
            console.error("Tracking error", error);
            setStatus('error');
        }
    };

    // Auto-track if ID is provided in URL
    useEffect(() => {
        if (id) {
            handleTrack(null, id);
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-body text-text-main font-body">
            <SEO
                title={pageData?.seo?.title || "Track Order"}
                description={pageData?.seo?.description}
            />
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage || heroImg}
            />

            <div className="max-w-2xl mx-auto px-6 py-16">
                {/* Tracking Form */}
                {status !== 'found' && (
                    <div className="bg-white/5 border border-light/10 p-8 md:p-12 rounded-sm mb-12 animate-in fade-in slide-in-from-bottom-4">
                        {status === 'loading' ? (
                            <div className="space-y-6">
                                <Skeleton className="w-full h-8 mb-4" />
                                <Skeleton className="w-full h-12" />
                                <Skeleton className="w-full h-8 mb-4 mt-6" />
                                <Skeleton className="w-full h-12" />
                                <Skeleton className="w-full h-14 mt-8" />
                            </div>
                        ) : (
                            <form onSubmit={handleTrack} className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-light/60 mb-2">Order ID</label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder="#MRS-..."
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        className="bg-dark/50 border-light/10 text-light focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-light/60 mb-2">Billing Email</label>
                                    <Input
                                        type="email"
                                        required={!phone}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-dark/50 border-light/10 text-light focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-light/60 mb-2">Mobile Number</label>
                                    <Input
                                        type="tel"
                                        required={!email}
                                        placeholder="+91 ..."
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-dark/50 border-light/10 text-light focus:border-primary"
                                    />
                                    <p className="text-[10px] text-light/40 mt-1 italic italic">Provide either your email or mobile number used during checkout.</p>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-dark font-heading font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Track Order
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-center rounded-sm animate-in fade-in slide-in-from-top-2">
                        Order not found. Please check your details and try again.
                    </div>
                )}

                {/* Order Status Result */}
                {status === 'found' && orderData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <button
                                onClick={() => { setStatus(null); setOrderId(''); setOrderData(null); }}
                                className="text-sm text-light/60 hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <span>&larr;</span> Track Another Order
                            </button>
                        </div>
                        <h3 className="text-xl font-heading text-light mb-6 border-b border-light/10 pb-4 flex justify-between items-center">
                            <span>Order {orderData.id}</span>
                            <span className="text-primary text-sm bg-primary/10 px-3 py-1 rounded-full">{orderData.status}</span>
                        </h3>

                        <div className="relative border-l-2 border-light/10 ml-3 space-y-8 pl-8 py-2">
                            {orderData.timeline.map((step, idx) => (
                                <div key={idx} className="relative">
                                    <span className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-2 ${step.completed ? 'bg-primary border-primary' : 'bg-dark border-light/30'}`}>
                                        {step.completed && <Icons.Check className="w-3 h-3 text-dark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                    </span>
                                    <h4 className={`text-sm font-bold uppercase tracking-wide ${step.completed ? 'text-light' : 'text-light/40'}`}>{step.status}</h4>
                                    {step.date && <p className="text-xs text-light/50 mt-1">{step.date}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
