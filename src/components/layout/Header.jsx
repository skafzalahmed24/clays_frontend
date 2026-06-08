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

            {/* Main Nav */}
            <nav className="bg-dark text-light border-b border-light/10 transition-all duration-300">
                <div className="w-full px-4 md:px-6 lg:px-12 py-2">
                    {/* Header Layout when NOT scrolled */}
                    {!isScrolled ? (
                        <div className="flex flex-col w-full">
                            {/* Top row: Left (Brand tag), Center (Logo), Right (Icons) */}
                            <div className="grid grid-cols-3 items-center w-full pt-1 pb-3">
                                {/* Left: Brand tagline */}
                                <div className="hidden md:flex items-center space-x-4">
                                    <span className="text-[11px] font-heading tracking-widest text-light/50 uppercase">Clarysays Luxury</span>
                                </div>
                                <div className="md:hidden"></div> {/* Mobile spacer */}

                                {/* Center: Logo & Brand Name */}
                                <div className="flex justify-center items-center">
                                    <Link to="/" className="cursor-pointer flex flex-col items-center gap-1">
                                        <Image
                                            className="h-24 md:h-32 w-auto drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.8)] transition-all duration-300 hover:drop-shadow-[0_0_16px_rgba(var(--color-primary-rgb),0.8)]"
                                            src={settings?.identity?.logo || BRAND_CONFIG.logo}
                                            alt={`${settings?.identity?.brandName || BRAND_CONFIG.brandName} Logo`}
                                            isStatic={!settings?.identity?.logo}
                                        />
                                        <span className="font-script font-bold text-light tracking-[0.2em] text-2xl md:text-3xl mt-2">
                                            {(settings?.identity?.brandName || BRAND_CONFIG.brandName).toUpperCase()}
                                        </span>
                                    </Link>
                                </div>

                                {/* Right: Icons & Mobile Hamburger */}
                                <div className="flex items-center justify-end space-x-4 md:space-x-5">
                                    <div className="hidden md:flex items-center space-x-5">
                                        <button onClick={() => setSearchOpen(true)} title="Search" className="text-light/80 hover:text-primary transition-colors"><Icons.Search /></button>
                                        <Link to="/wishlist" title="Wishlist" className="text-light/80 hover:text-primary transition-colors relative">
                                            <Icons.Heart />
                                            {(Array.isArray(wishlistItems) && wishlistItems.length > 0) && (
                                                <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                    {wishlistItems.length}
                                                </span>
                                            )}
                                        </Link>
                                        <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-light/80 hover:text-primary transition-colors"><Icons.User /></Link>
                                        <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-light/80 hover:text-primary transition-colors relative">
                                            <Icons.Cart />
                                            {(Array.isArray(cartItems) && cartItems.length > 0) && (
                                                <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Mobile menu hamburger */}
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
                            </div>

                            {/* Line Full (Full width horizontal divider line) */}
                            <hr className="border-light/10 w-full" />

                            {/* Middle row: Desktop Navigation Links centered */}
                            <div className="hidden md:flex justify-center items-center py-3 space-x-6">
                                <Link to="/shop" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/shop')}`}>Shop</Link>
                                <Link to="/categories" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/categories')}`}>Categories</Link>
                                <Link to="/collections" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/collections')}`}>Collections</Link>
                                <Link to="/about" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/about')}`}>About</Link>
                                <Link to="/journal" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/journal')}`}>Journal</Link>
                                <Link to="/track-order" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/track-order')}`}>Track Order</Link>
                                <Link to="/contact" className={`hover:text-primary transition-colors duration-300 font-heading text-xs tracking-widest uppercase ${isActive('/contact')}`}>Contact us</Link>
                            </div>

                            {/* Divider above bottom category bar */}
                            <hr className="border-light/5 w-full hidden md:block" />

                            {/* Bottom row: Category list (New Arrivals, etc.) */}
                            <div className="hidden md:block py-2">
                                <ul className="flex justify-center items-center text-[12px] font-heading tracking-widest text-primary gap-8 w-full">
                                    <li
                                        className="py-1"
                                        onMouseEnter={() => handleMouseEnter("New Arrivals")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Link to="/new-arrivals" className="hover:text-light transition-colors">New Arrivals</Link>
                                    </li>
                                    {(categories && Array.isArray(categories) ? categories : []).slice(0, 8).map((cat) => (
                                        <li
                                            key={cat.id}
                                            className="cursor-pointer hover:text-light transition-colors py-1"
                                            onMouseEnter={() => handleMouseEnter(cat.name)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Link
                                                to={`/category/${cat.name.toLowerCase()}`}
                                                className={`${isActive(`/category/${cat.name.toLowerCase()}`)}`}
                                            >
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li className="bg-primary text-dark px-2 py-0.5 font-bold cursor-pointer hover:bg-light transition-colors">
                                        <Link to="/offers" className="block">Offers</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        /* Header Layout when Scrolled (Compact View) */
                        <div className="flex items-center justify-between w-full py-1">
                            {/* Left: Compact Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="cursor-pointer flex items-center gap-2">
                                    <Image
                                        className="h-12 w-auto drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.8)]"
                                        src={settings?.identity?.logo || BRAND_CONFIG.logo}
                                        alt={`${settings?.identity?.brandName || BRAND_CONFIG.brandName} Logo`}
                                        isStatic={!settings?.identity?.logo}
                                    />
                                    <span className="font-script font-bold text-light tracking-widest text-lg">
                                        {(settings?.identity?.brandName || BRAND_CONFIG.brandName).toUpperCase()}
                                    </span>
                                </Link>
                            </div>

                            {/* Center: Main Nav Links */}
                            <div className="hidden md:flex space-x-5 items-center justify-center">
                                <Link to="/shop" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/shop')}`}>Shop</Link>
                                <Link to="/categories" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/categories')}`}>Categories</Link>
                                <Link to="/collections" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/collections')}`}>Collections</Link>
                                <Link to="/about" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/about')}`}>About</Link>
                                <Link to="/journal" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/journal')}`}>Journal</Link>
                                <Link to="/track-order" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/track-order')}`}>Track Order</Link>
                                <Link to="/contact" className={`hover:text-primary transition-colors duration-300 font-heading text-[10px] tracking-widest uppercase ${isActive('/contact')}`}>Contact us</Link>
                            </div>

                            {/* Right: Icons & Mobile Hamburger */}
                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center space-x-4">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-light/80 hover:text-primary transition-colors"><Icons.Search /></button>
                                    <Link to="/wishlist" title="Wishlist" className="text-light/80 hover:text-primary transition-colors relative">
                                        <Icons.Heart />
                                        {(Array.isArray(wishlistItems) && wishlistItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-light/80 hover:text-primary transition-colors"><Icons.User /></Link>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-light/80 hover:text-primary transition-colors relative">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-primary text-dark text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile Hamburger */}
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
                        </div>
                    )}
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
            </nav>
        </div >
    );
};

export default Header;
