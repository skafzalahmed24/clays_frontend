import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icons from '../components/ui/Icons';
import PageHeader from '../components/common/PageHeader';

const OrderSuccess = () => {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const orderId = location.state?.orderId || 'Unknown';

    return (
        <div className="min-h-screen bg-body text-text-main font-body">
            <PageHeader title="Order Confirmed" />

            <div className="w-full max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-24 text-center">
                <div className="bg-white/5 border border-light/10 p-8 md:p-12 rounded-sm animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.Check className="w-10 h-10 text-primary" />
                    </div>

                    <h2 className="font-heading text-3xl md:text-4xl text-light uppercase tracking-widest mb-4">Thank You!</h2>
                    <p className="text-lg text-text-main/80 mb-8">Your order <span className="text-primary font-bold">#{orderId}</span> has been confirmed.</p>

                    <div className="text-sm text-text-main/60 mb-10 max-w-md mx-auto">
                        We've sent a confirmation email to your provided address.
                        We will notify you when your order ships.
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link to="/account/orders" className="bg-white/5 border border-white/10 text-light font-heading uppercase tracking-widest px-8 py-3 hover:bg-white/10 transition-colors rounded-sm">
                            View Order
                        </Link>
                        <Link to="/shop" className="bg-primary text-dark font-heading font-bold uppercase tracking-widest px-8 py-3 hover:bg-light transition-colors rounded-sm">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
