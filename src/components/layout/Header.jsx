import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Icons from '../ui/Icons';
import Image from '../ui/Image';
import { setCartOpen, addToCart } from '../../store/slices/cartSlice';
import { useGetSettingsQuery, useGetMegaMenuQuery } from '../../store/api/contentApiSlice';
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
    const subCategories = attributesData?.subCategories || [];

    const [activeMenu, setActiveMenu] = useState(null);
    const { data: currentMenuData, isFetching: isMegaMenuFetching } = useGetMegaMenuQuery(activeMenu, { skip: !activeMenu });
    const [isScrolledState, setIsScrolledState] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [expandedMobileCategories, setExpandedMobileCategories] = useState({});

    const toggleMobileCategory = (categoryId) => {
        setExpandedMobileCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };
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
    };

    const handleMouseLeave = () => {
        if (isGhost) return;
        menuTimer.current = setTimeout(() => {
            setActiveMenu(null);
        }, 200);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className={isGhost
            ? "relative w-full opacity-0 pointer-events-none -z-10"
            : "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300"
        }>
            {/* Search Overlay */}
            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

            {/* Main Nav */}
            <nav className="bg-[#FAF7F2] text-dark shadow-soft border-b border-[#a1824a]/10 transition-all duration-300">
                <div className="w-full px-4 md:px-8 lg:px-16 py-0">
                    {/* Header Layout when NOT scrolled */}
                    {!isScrolled ? (
                        <div className="flex items-center justify-between w-full py-4">
                            {/* Left: Logo & Brand Name */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="cursor-pointer flex flex-row items-center gap-3">
                                    <Image
                                        className="h-10 md:h-12 w-auto drop-shadow-sm transition-all duration-300 hover:scale-105"
                                        src={settings?.identity?.logo || BRAND_CONFIG.logo}
                                        alt={`${settings?.identity?.brandName || BRAND_CONFIG.brandName} Logo`}
                                        isStatic={!settings?.identity?.logo}
                                    />
                                    <span className="font-serif font-bold text-[#2A3F2C] tracking-wide text-xl md:text-2xl">
                                        {(settings?.identity?.brandName || BRAND_CONFIG.brandName).toUpperCase()}
                                    </span>
                                </Link>
                            </div>

                            {/* Center: Main Nav Links */}
                            <div className="hidden md:flex flex-1 mx-4">
                                <ul className="flex justify-center items-center text-[12px] md:text-[13px] font-heading font-medium tracking-widest text-[#2A3F2C] gap-6 lg:gap-8 w-full flex-wrap">
                                    <li className="py-1">
                                        <Link to="/shop" className={`uppercase ${isActive('/shop')}`}>Shop</Link>
                                    </li>

                                    {(categories && Array.isArray(categories) ? categories : []).slice(0, 8).map((cat) => (
                                        <li
                                            key={cat.id}
                                            className="cursor-pointer py-1 uppercase"
                                            onMouseEnter={() => handleMouseEnter(cat.name)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Link
                                                to={`/category/${cat.name.toLowerCase()}`}
                                                className={`flex items-center gap-1 ${isActive(`/category/${cat.name.toLowerCase()}`)}`}
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                {cat.name}
                                                <Icons.ChevronDown className="w-3 h-3 opacity-70" />
                                            </Link>
                                        </li>
                                    ))}
                                    <li
                                        className="py-1"
                                        onMouseEnter={() => handleMouseEnter("New Arrivals")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Link to="/new-arrivals" className={`uppercase ${isActive('/new-arrivals')}`}>New Arrivals</Link>
                                    </li>
                                    <li className="py-1">
                                        <Link to="/offers" className={`uppercase ${isActive('/offers')}`}>Offers</Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Right: Icons & Mobile Hamburger */}
                            <div className="flex items-center justify-end space-x-4 md:space-x-5">
                                <div className="hidden md:flex items-center space-x-5">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors"><Icons.Search /></button>
                                    <Link to="/wishlist" title="Wishlist" className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors relative">
                                        <Icons.Heart />
                                        {(Array.isArray(wishlistItems) && wishlistItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-[#a1824a] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors"><Icons.User /></Link>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors relative">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-[#a1824a] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile menu hamburger */}
                                <div className="md:hidden flex items-center gap-4">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-[#a1824a] hover:text-[#2A3F2C] relative">
                                        <Icons.Search />
                                    </button>
                                    <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors">
                                        <Icons.User />
                                    </Link>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-[#a1824a] hover:text-[#2A3F2C] relative">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && <span className="absolute -top-1 -right-1 bg-[#a1824a] text-white text-[10px] rounded-full h-3 w-3 block animate-pulse"></span>}
                                    </button>
                                    <button
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="p-2 rounded-md text-[#a1824a] hover:text-[#2A3F2C] focus:outline-none"
                                    >
                                        {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Header Layout when Scrolled (Compact View) */
                        <div className="flex items-center justify-between w-full py-2">
                            {/* Left: Compact Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="cursor-pointer flex flex-row items-center gap-2">
                                    <Image
                                        className="h-8 md:h-10 w-auto drop-shadow-sm transition-all duration-300 hover:scale-105"
                                        src={settings?.identity?.logo || BRAND_CONFIG.logo}
                                        alt={`${settings?.identity?.brandName || BRAND_CONFIG.brandName} Logo`}
                                        isStatic={!settings?.identity?.logo}
                                    />
                                    <span className="font-serif font-bold text-[#2A3F2C] tracking-wide text-lg md:text-xl">
                                        {(settings?.identity?.brandName || BRAND_CONFIG.brandName).toUpperCase()}
                                    </span>
                                </Link>
                            </div>

                            {/* Center: Main Nav Links (Compact) */}
                            <div className="hidden md:flex flex-1 mx-4">
                                <ul className="flex justify-center items-center text-[10px] md:text-[11px] font-heading font-medium tracking-widest text-[#2A3F2C] gap-4 lg:gap-6 w-full flex-wrap">
                                    <li className="py-1">
                                        <Link to="/shop" className={`uppercase ${isActive('/shop')}`}>Shop</Link>
                                    </li>

                                    {(categories && Array.isArray(categories) ? categories : []).slice(0, 5).map((cat) => (
                                        <li
                                            key={cat.id}
                                            className="cursor-pointer py-1 uppercase hidden lg:block"
                                            onMouseEnter={() => handleMouseEnter(cat.name)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <Link
                                                to={`/category/${cat.name.toLowerCase()}`}
                                                className={`flex items-center gap-1 ${isActive(`/category/${cat.name.toLowerCase()}`)}`}
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                {cat.name}
                                                <Icons.ChevronDown className="w-3 h-3 opacity-70" />
                                            </Link>
                                        </li>
                                    ))}
                                    <li
                                        className="py-1"
                                        onMouseEnter={() => handleMouseEnter("New Arrivals")}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <Link to="/new-arrivals" className={`uppercase ${isActive('/new-arrivals')}`}>New Arrivals</Link>
                                    </li>
                                    <li className="py-1">
                                        <Link to="/offers" className={`uppercase ${isActive('/offers')}`}>Offers</Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Right: Icons & Mobile Hamburger */}
                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center space-x-4">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors"><Icons.Search /></button>
                                    <Link to="/wishlist" title="Wishlist" className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors relative">
                                        <Icons.Heart />
                                        {(Array.isArray(wishlistItems) && wishlistItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-[#a1824a] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </Link>
                                    <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors"><Icons.User /></Link>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors relative">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && (
                                            <span className="absolute -top-2 -right-2 bg-[#a1824a] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Mobile Hamburger */}
                                <div className="md:hidden flex items-center gap-4">
                                    <button onClick={() => setSearchOpen(true)} title="Search" className="text-[#a1824a] hover:text-[#2A3F2C] relative">
                                        <Icons.Search />
                                    </button>
                                    <Link to={user ? "/account" : "/login"} title={user ? "Account" : "Login"} className="text-[#a1824a] hover:text-[#2A3F2C] transition-colors">
                                        <Icons.User />
                                    </Link>
                                    <button onClick={() => dispatch(setCartOpen(true))} title="Shopping Cart" className="text-[#a1824a] hover:text-[#2A3F2C] relative">
                                        <Icons.Cart />
                                        {(Array.isArray(cartItems) && cartItems.length > 0) && <span className="absolute -top-1 -right-1 bg-[#a1824a] text-white text-[10px] rounded-full h-3 w-3 block animate-pulse"></span>}
                                    </button>
                                    <button
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="p-2 rounded-md text-[#a1824a] hover:text-[#2A3F2C] focus:outline-none"
                                    >
                                        {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mega Menu Dropdown for specific parent categories */}
                {activeMenu && currentMenuData && currentMenuData.categories && currentMenuData.categories.length > 0 && (
                    <div 
                        className="absolute top-full left-0 w-full bg-light border-t border-b border-dark/10 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-300"
                        onMouseEnter={() => handleMouseEnter(activeMenu)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8">
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Left Column: Subcategories */}
                                <div className="w-full md:w-1/4 lg:w-1/5 border-r border-dark/10 pr-6">
                                    <h3 className="font-heading text-primary font-bold text-sm tracking-widest mb-6">Shop by Category</h3>
                                    <ul className="space-y-4">
                                        {currentMenuData.categories.map((sub, idx) => (
                                            <li key={idx}>
                                                <Link 
                                                    to={sub.link} 
                                                    className="text-dark hover:text-primary font-medium transition-colors text-sm"
                                                    onClick={() => setActiveMenu(null)}
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Right Column: Featured Products */}
                                <div className="w-full md:w-3/4 lg:w-4/5">
                                    {currentMenuData.featuredProducts && currentMenuData.featuredProducts.length > 0 ? (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {currentMenuData.featuredProducts.map((product) => (
                                                <div key={product.id} className="group flex flex-col">
                                                    <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden mb-4 bg-dark/5 rounded-sm" onClick={() => setActiveMenu(null)}>
                                                        <img src={product.img || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    </Link>
                                                    <div className="flex flex-col flex-1 items-center text-center">
                                                        <Link to={`/product/${product.id}`} className="text-dark font-heading font-medium text-xs tracking-widest group-hover:text-primary transition-colors mb-2 line-clamp-2" onClick={() => setActiveMenu(null)}>
                                                            {product.name}
                                                        </Link>
                                                        <p className="text-dark/80 font-medium text-sm mb-4">₹{product.price.toFixed(2)}</p>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                dispatch(addToCart({ product, qty: 1, isGuest: !user }));
                                                            }}
                                                            className="mt-auto w-[80%] py-2 bg-primary/20 text-primary hover:bg-primary hover:text-light transition-colors font-heading font-bold text-xs uppercase tracking-widest rounded-sm"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-dark/50 font-heading tracking-widest uppercase">
                                            No Featured Products
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden bg-[#FAF7F2] border-b border-[#a1824a]/10 overflow-y-auto transition-all duration-300 ${mobileMenuOpen ? 'max-h-[85vh]' : 'max-h-0'}`}>
                    <div className="px-4 py-4 space-y-2 text-center text-dark">
                        <Link to="/shop" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/shop')}`}>Shop</Link>
                        
                        {/* Dynamic Categories */}
                        <div className="border-t border-b border-dark/10 my-2 py-2 text-center">
                            {(categories && Array.isArray(categories) ? categories : []).map((cat) => {
                                const catSubCategories = (subCategories && Array.isArray(subCategories) ? subCategories : []).filter(sub => sub.value === cat.name);
                                return (
                                    <div key={cat.id} className="py-2 border-b border-dark/5 last:border-0">
                                        <div className="flex items-center justify-center relative">
                                            <Link 
                                                to={`/category/${cat.name.toLowerCase()}`} 
                                                onClick={closeMobileMenu} 
                                                className={`flex-1 block py-1 text-sm font-heading font-bold hover:text-primary tracking-widest uppercase ${isActive(`/category/${cat.name.toLowerCase()}`)}`}
                                            >
                                                {cat.name}
                                            </Link>
                                            {catSubCategories.length > 0 && (
                                                <button 
                                                    onClick={() => toggleMobileCategory(cat.id)}
                                                    className="absolute right-0 p-2 text-dark/70 hover:text-primary transition-colors"
                                                >
                                                    <Icons.ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedMobileCategories[cat.id] ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                        {catSubCategories.length > 0 && expandedMobileCategories[cat.id] && (
                                            <div className="pl-4 mt-1 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {catSubCategories.map(sub => (
                                                    <Link
                                                        key={sub.id}
                                                        to={`/category/${cat.name.toLowerCase()}/${sub.name.toLowerCase()}`}
                                                        onClick={closeMobileMenu}
                                                        className={`block py-1 text-xs font-heading font-medium text-dark/70 hover:text-primary tracking-widest uppercase ${isActive(`/category/${cat.name.toLowerCase()}/${sub.name.toLowerCase()}`)}`}
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <Link to="/new-arrivals" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/new-arrivals')}`}>New Arrivals</Link>
                        <Link to="/offers" onClick={closeMobileMenu} className={`block py-2 text-sm font-heading font-medium hover:text-primary tracking-widest uppercase ${isActive('/offers')}`}>Offers</Link>
                    </div>
                </div>
            </nav>
        </div >
    );
};

export default Header;
