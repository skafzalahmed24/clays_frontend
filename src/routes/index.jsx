import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/admin/layout/AdminLayout';
import RedirectIfAuthenticated from '../components/auth/RedirectIfAuthenticated';

// Common
import Loading from '../components/common/Loading';

// Public Pages (Lazy Loaded)
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const Collections = lazy(() => import('../pages/Collections'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Categories = lazy(() => import('../pages/Categories'));
const CategoryDetails = lazy(() => import('../pages/CategoryDetails'));
const Journal = lazy(() => import('../pages/Journal'));
const JournalDetails = lazy(() => import('../pages/JournalDetails'));
const NewArrivals = lazy(() => import('../pages/NewArrivals'));
const Offers = lazy(() => import('../pages/Offers'));
const ShippingReturns = lazy(() => import('../pages/ShippingReturns'));
const CareGuide = lazy(() => import('../pages/CareGuide'));
const FAQ = lazy(() => import('../pages/FAQ'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Account = lazy(() => import('../pages/Account'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const VerifyOTP = lazy(() => import('../pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const TermsConditions = lazy(() => import('../pages/TermsConditions'));
const OrderTracking = lazy(() => import('../pages/OrderTracking'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin Pages (Lazy Loaded)
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/Products'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const AdminCustomers = lazy(() => import('../pages/admin/Customers'));
const AdminCustomerDetails = lazy(() => import('../pages/admin/CustomerDetails'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const AdminAttributes = lazy(() => import('../pages/admin/Attributes'));
const AdminRequests = lazy(() => import('../pages/admin/Requests'));
const AdminOrderDetails = lazy(() => import('../pages/admin/OrderDetails'));
const AdminAddProduct = lazy(() => import('../pages/admin/AddProduct'));
const AdminEditProduct = lazy(() => import('../pages/admin/EditProduct'));
const AdminBlogs = lazy(() => import('../pages/admin/Blogs'));
const AdminBlogForm = lazy(() => import('../pages/admin/BlogForm'));
const AdminContent = lazy(() => import('../pages/admin/Content'));
const AdminCoupons = lazy(() => import('../pages/admin/Coupons'));
const AdminMessages = lazy(() => import('../pages/admin/Messages'));
const AdminMessageDetails = lazy(() => import('../pages/admin/MessageDetails'));


const AppRoutes = ({
    setMobileMenuOpen,
    mobileMenuOpen,
}) => {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* PUBLIC STORE ROUTES */}
                <Route element={
                    <PublicLayout
                        setMobileMenuOpen={setMobileMenuOpen}
                        mobileMenuOpen={mobileMenuOpen}
                    />
                }>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/category/:categoryName" element={<CategoryDetails />} />
                    <Route path="/category/:categoryName/:subCategoryName" element={<CategoryDetails />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/journal/:id" element={<JournalDetails />} />
                    <Route path="/new-arrivals" element={<NewArrivals />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/shipping-returns" element={<ShippingReturns />} />
                    <Route path="/care-guide" element={<CareGuide />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/product/:id" element={<ProductDetails />} />

                    {/* Guest Only Routes */}
                    <Route element={<RedirectIfAuthenticated />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<VerifyOTP />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>

                    <Route path="/account/*" element={<Account />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/track-order" element={<OrderTracking />} />
                    <Route path="/track-order/:id" element={<OrderTracking />} />
                </Route>

                {/* ADMIN LOGIN */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminAddProduct />} />
                    <Route path="products/edit/:id" element={<AdminEditProduct />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetails />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="customers/:id" element={<AdminCustomerDetails />} />
                    <Route path="attributes" element={<AdminAttributes />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="blogs/new" element={<AdminBlogForm />} />
                    <Route path="blogs/edit/:id" element={<AdminBlogForm />} />
                    <Route path="content" element={<AdminContent />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="messages/:id" element={<AdminMessageDetails />} />
                </Route>

                {/* 404 CATCH-ALL (Uses Public Layout) */}
                <Route element={<PublicLayout
                    setMobileMenuOpen={setMobileMenuOpen}
                    mobileMenuOpen={mobileMenuOpen}
                />}>
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Suspense>
    );
};


export default AppRoutes;
