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
        <div className="min-h-screen font-body selection:bg-primary selection:text-dark">
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
    );
};

export default PublicLayout;
