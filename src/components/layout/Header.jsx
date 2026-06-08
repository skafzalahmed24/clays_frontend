import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Icons from '../ui/Icons';
import Image from '../ui/Image';
import { setCartOpen } from '../../store/slices/cartSlice';
import { useGetSettingsQuery } from '../../store/api/contentApiSlice';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import { BRAND_CONFIG } from '../../utils/config';

import SearchOverlay from '../common/SearchOverlay';

const Header = ({
    mobileMenuOpen,
    setMobileMenuOpen,
    isGhost = false
}) => {
    const dispatch = useDispatch();
    const { items: cartItems } = useSelector(state => state.cart);
    const { items: wishlistItems } = useSelector(state => state.wishlist);
    const { user } = useSelector(state => state.auth);

    // Get dynamic settings & content
    const { data: settings } = useGetSettingsQuery();
    const { data: attributesData } = useGetAttributesQuery();

    // Derived categories
    const categories = attributesData?.categories || [];

    // Helper to fetch mega menu on hover
    // const [triggerMegaMenu, { data: megaMenuData }] = useLazyGetMegaMenuQuery();

    // Assistant cleanup: activeMenu used to be used for Mega Menu
    const [activeMenu, setActiveMenu] = useState(null);
    const [isScrolledState, setIsScrolledState] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const menuTimer = useRef(null);
    const location = useLocation();

    // Helper to check active state
    const isActive = (path) => {
        const currentPath = decodeURIComponent(location.pathname).replace(/\/$/, '').toLowerCase();
        const targetPath = path.replace(/\/$/, '').toLowerCase();
        return currentPath === targetPath ? "font-bold underline underline-offset-4 decoration-primary" : "";
    };

    // Force expanded state for ghost header to maintain spacing
    const isScrolled = isGhost ? false : isScrolledState;

    useEffect(() => {
        if (isGhost) return;

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 200) {
                        setIsScrolledState(true);
                    } else if (window.scrollY < 50) {
                        setIsScrolledState(false);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isGhost]);

    const handleMouseEnter = (menu) => {
        if (isGhost) return;
        if (menuTimer.current) clearTimeout(menuTimer.current);
        setActiveMenu(menu);
        // Fetch dynamic menu if trigger available
        // if (menu) {
        //     triggerMegaMenu(menu);
        // }
    };

    const handleMouseLeave = () => {
        if (isGhost) return;
        menuTimer.current = setTimeout(() => {
            setActiveMenu(null);
        }, 200);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Resolve Menu Data (using local state or just the hook result if active)
    // const currentMenuData = activeMenu && megaMenuData && megaMenuData[activeMenu] ? megaMenuData[activeMenu] : null;
    // Resolve Menu Data (disabled)
    // const currentMenuData = null;

    return (
        <div className={isGhost
            ? "relative w-full opacity-0 pointer-events-none -z-10"
            : "fixed top-0 left-0 right-0 xl:left-[60px] xl:right-[60px] w-full xl:w-[calc(100%-120px)] z-50 transition-all duration-300"
        }>
            {/* Search Overlay */}
            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

            {/* Top Announcement Bar */}
            <div className={`bg-primary text-dark px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-xs font-heading tracking-wider gap-2 transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-12 py-1.5 opacity-100'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex gap-3">
                        <a href={settings?.socialLinks?.instagram || "https://www.instagram.com"} target="_blank" rel="noreferrer" className="hover:text-dark transition-colors"><Icons.Instagram /></a>
                        <a href={settings?.socialLinks?.facebook || "https://www.facebook.com"} target="_blank" rel="noreferrer" className="hover:text-dark transition-colors"><Icons.Facebook /></a>
                        {settings?.socialLinks?.youtube && (
                            <a href={settings.socialLinks.youtube || "https://www.youtube.com"} target="_blank" rel="noreferrer" className="hover:text-dark transition-colors"><Icons.YouTube /></a>
                        )}
                    </div>
                    <span className="hidden md:inline border-r border-dark/20 h-3"></span>
                    <a href={`tel:${(settings?.contactPhone || "+91 98765 43210").replace(/\s/g, '')}`} className="hover:text-dark transition-colors flex items-center gap-1">
                        <Icons.Phone /> {settings?.contactPhone || "+91 98765 43210"}
                    </a>
                </div>
                <p>
                    {settings?.announcement?.text || "Unlock Joy with Extra Discounts on eGift Cards"}
                    <Link to={settings?.announcement?.link || "/shop"} className="underline font-bold ml-1 hover:text-dark">Shop Now</Link>
                </p>
            </div>

            {/* Main Nav */}
            <nav className="bg-dark text-light border-b border-light/10 transition-all duration-300">
                <div className="w-full px-4 md:px-6 lg:px-12 py-2">
                    <div className="flex gap-2 lg:gap-8">
                        {/* LEFT PANEL: Logo & Brand */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className={`cursor-pointer flex items-center transition-all duration-300 ${isScrolled ? 'flex-row gap-2' : 'flex-row md:flex-col gap-2 md:gap-0'}`}>
                                <Image
                                    className={`w-auto drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.8)] transition-all duration-300 hover:drop-shadow-[0_0_16px_rgba(var(--color-primary-rgb),0.8)] ${isScrolled ? 'h-16 py-1' : 'h-16 md:h-24 py-1 md:py-0'}`}
                                    src={settings?.identity?.logo || BRAND_CONFIG.logo}
                                    alt={`${settings?.identity?.brandName || BRAND_CONFIG.brandName} Logo`}
                                    isStatic={!settings?.identity?.logo}
                                />
                                <span className={`font-script font-bold text-light tracking-widest transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-xl md:text-3xl'}`}>{(settings?.identity?.brandName || BRAND_CONFIG.brandName).toUpperCase()}</span>
                            </Link>
                        </div>

                        {/* RIGHT PANEL: Navigation Rows */}
                        <div className="flex flex-col flex-1 ">
                            {/* TOP ROW: Main Nav + Icons */}
                            <div className="flex-1 flex items-center justify-end md:justify-between w-full">
                                {/* Desktop Navigation */}
                                <div className="hidden md:flex space-x-2 lg:space-x-6 items-center flex-1 justify-center">
                                    <Link to="/shop" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/shop')}`}>Shop</Link>
                                    <Link to="/categories" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/categories')}`}>Categories</Link>
                                    <Link to="/collections" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/collections')}`}>Collections</Link>
                                    <Link to="/about" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/about')}`}>About</Link>
                                    <Link to="/journal" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/journal')}`}>Journal</Link>
                                    <Link to="/track-order" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/track-order')}`}>Track Order</Link>
                                    <Link to="/contact" className={`hover:text-primary transition-colors duration-300 font-heading md:text-[10px] lg:text-xs md:tracking-wide lg:tracking-widest uppercase ${isActive('/contact')}`}>Contact us</Link>
                                </div>

                                {/* Icons */}
                                <div className="hidden md:flex items-center space-x-2 lg:space-x-5 flex-shrink-0">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-light/80 hover:text-primary transition-colors mb-0.5"><Icons.Search /></button>
                                    <Link to="/wishlist" title="Wishlist" className="text-light/80 hover:text-primary transition-colors relative mb-0.5">
                                        <Icons.Heart />
                                        {(Array.isArray(wishlistItems) && wishlistItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-light/80 hover:text-primary transition-colors mb-0.5"><Icons.User /></Link>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-light/80 hover:text-primary transition-colors relative mb-0.5">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile menu button */}
                                <div className="md:hidden flex items-center gap-4">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-light/80 hover:text-primary relative">
                                        <Icons.Search />
                                    </button>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-light/80 hover:text-primary relative">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && <span className="absolute -top-1 -right-1 bg-primary text-dark text-[10px] rounded-full h-3 w-3 block animate-pulse"></span>}
                                    </button>
                                    <button
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="p-2 rounded-md text-light/70 hover:text-primary focus:outline-none"
                                    >
                                        {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
                                    </button>
                                </div>
                            </div>
                            <hr className={`border-light/5 hidden md:block ${isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-12 py-1 opacity-100'}`} />
                            {/* BOTTOM ROW: Categories (Hidden on Scroll) */}
                            <div className={`flex-1 hidden md:block relative z-40 transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-12 py-1 opacity-100'}`}>
                                <ul className="flex h-full justify-between items-center text-[14px] font-heading tracking-widest text-primary w-full">
                                    <li
                                        className="block py-1"
                                        onMouseEnter={() => handleMouseEnter("New Arrivals")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Link to="/new-arrivals" className="block px-2 hover:text-light transition-colors">New Arrivals</Link>
                                    </li>
                                    {(categories && Array.isArray(categories) ? categories : []).slice(0, 13).map((cat) => (
                                        <li
                                            key={cat.id}
                                            className="hidden lg:block cursor-pointer hover:text-light transition-colors py-1"
                                            onMouseEnter={() => handleMouseEnter(cat.name)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Link
                                                to={`/category/${cat.name.toLowerCase()}`} // Assuming name is usable in URL
                                                className={`block px-2 ${isActive(`/category/${cat.name.toLowerCase()}`)}`}
                                            >
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li className="bg-primary text-dark px-2 py-0.5 font-bold cursor-pointer hover:bg-light transition-colors">
                                        <Link to="/offers" className="block">Offers</Link>
                                    </li>
                                    <li><Link to="/categories" className="hover:text-light transition-colors px-2">More</Link></li>
                                </ul>

                                {/* Mega Menu Overlay - DISABLED */}
                                {/* {currentMenuData && (
                                    <div
                                        className="absolute left-0 top-full w-full bg-body/95 backdrop-blur-xl border-b border-text-main/10 shadow-2xl py-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200 mt-2 rounded-b-xl"
                                        onMouseEnter={() => handleMouseEnter(activeMenu)}
                                        onMouseLeave={handleMouseLeave}
                                        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', left: '50%' }} // Center full width relative to viewport
                                    >
                                        <div className="w-full px-6 md:px-12 max-w-[1400px] mx-auto">
                                            <div className="flex gap-12">
                                                <div className="flex-1 grid grid-cols-4 gap-8">
                                                    {currentMenuData.categories.map((cat, idx) => (
                                                        <div key={idx}>
                                                            <h4 className="font-heading text-accent mb-4 text-sm uppercase tracking-widest border-b border-text-main/10 pb-2">{cat.title}</h4>
                                                            <ul className="space-y-2">
                                                                {cat.items.map((link, i) => (
                                                                    <li key={i}><Link to="/shop" className="text-text-main/70 hover:text-primary hover:translate-x-1 transition-all text-sm block">{link}</Link></li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="w-1/4">
                                                    <div className="relative aspect-[3/4] overflow-hidden group rounded-sm">
                                                        <Image src={currentMenuData.featured.img} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-dark/40 flex flex-col justify-end p-6">
                                                            <span className="text-light font-heading text-lg mb-2">{currentMenuData.featured.title}</span>
                                                            <Link to="/shop" className="text-primary text-xs uppercase tracking-widest group-hover:underline">{currentMenuData.featured.link} &rarr;</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden bg-dark border-b border-light/10 overflow-y-auto transition-all duration-300 ${mobileMenuOpen ? 'max-h-[85vh]' : 'max-h-0'}`}>
                    <div className="px-4 py-4 space-y-2 text-center">
                        <Link to="/new-arrivals" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/new-arrivals')}`}>New Arrivals</Link>
                        <Link to="/offers" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium text-primary hover:text-light tracking-widest uppercase ${isActive('/offers')}`}>Offers</Link>
                        <Link to="/shop" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/shop')}`}>Shop</Link>
                        <Link to="/categories" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/categories')}`}>Categories</Link>
                        <Link to="/collections" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/collections')}`}>Collections</Link>
                        <Link to="/about" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/about')}`}>About</Link>
                        <Link to="/journal" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/journal')}`}>Journal</Link>
                        <Link to="/track-order" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/track-order')}`}>Track Order</Link>
                        <Link to="/contact" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/contact')}`}>Contact us</Link>
                        <Link to={user ? "/account" : "/login"} onClick={closeMobileMenu} className="block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase">Account</Link>
                    </div>
                </div>
            </nav >
        </div >
    );
};

export default Header;
