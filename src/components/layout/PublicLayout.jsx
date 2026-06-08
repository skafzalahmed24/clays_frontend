import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

const PublicLayout = ({
    setMobileMenuOpen,
    mobileMenuOpen,
}) => {
    return (
        <div className="min-h-screen font-body selection:bg-primary selection:text-dark relative">
            {/* Left Decorative Border */}
            <div className="hidden xl:block fixed left-0 top-0 bottom-0 w-[60px] bg-primary z-50 select-none pointer-events-none border-decor-left"></div>

            {/* Right Decorative Border */}
            <div className="hidden xl:block fixed right-0 top-0 bottom-0 w-[60px] bg-primary z-50 select-none pointer-events-none border-decor-right"></div>

            {/* Main content wrapper with horizontal margins on desktop to fit between the side borders */}
            <div className="xl:pl-[60px] xl:pr-[60px]">
                <Header
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />
                {/* Ghost header for spacing */}
                <Header
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                    isGhost={true}
                />

                <CartDrawer />

                <main>
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default PublicLayout;
