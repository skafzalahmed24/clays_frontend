import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useDispatch } from 'react-redux';
import { logoutAdmin } from '../../../store/slices/adminAuthSlice';
import { useConfirm } from '../../../context/ConfirmContext';
import Icons from '../../ui/Icons';

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { confirm } = useConfirm();

    const handleLogout = async () => {
        if (await confirm('Logout', 'Are you sure you want to log out?')) {
            await dispatch(logoutAdmin());
            navigate('/admin/login');
        }
    };

    // Using a distinct dark aesthetic for admin
    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin' || location.pathname === '/admin/';
        }
        return location.pathname.startsWith(path);
    };
    const linkClass = (path) => `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 ${isActive(path)
        ? 'bg-primary text-dark font-medium'
        : 'text-light/60 hover:text-light hover:bg-white/5'}`;

    return (
        <aside className={`fixed left-0 top-0 h-screen w-64 bg-dark-paper border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="p-6 border-b border-white/10 flex items-center justify-center relative">
                {/* Close Button for Mobile */}
                <button
                    onClick={onClose}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white md:hidden"
                >
                    <Icons.Close />
                </button>

                <Link to="/" className="flex flex-col items-center">
                    {/* Simplified Logo for Admin */}
                    <span className="font-script font-bold text-primary text-2xl tracking-widest">Clarysays</span>
                    <span className="text-[0.6rem] uppercase tracking-[0.3em] text-light/50 mt-1">Admin Panel</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4 font-heading tracking-wide text-sm overflow-y-auto custom-scrollbar">
                <Link to="/admin" className={linkClass('/admin')} onClick={onClose}>
                    <Icons.Dashboard />
                    <span>Dashboard</span>
                </Link>
                <Link to="/admin/products" className={linkClass('/admin/products')} onClick={onClose}>
                    <Icons.Box />
                    <span>Products</span>
                </Link>
                <Link to="/admin/orders" className={linkClass('/admin/orders')} onClick={onClose}>
                    <Icons.Bag />
                    <span>Orders</span>
                </Link>
                <Link to="/admin/customers" className={linkClass('/admin/customers')} onClick={onClose}>
                    <Icons.User />
                    <span>Customers</span>
                </Link>
                <Link to="/admin/requests" className={linkClass('/admin/requests')} onClick={onClose}>
                    <Icons.Email />
                    <span>Requests</span>
                </Link>
                <Link to="/admin/messages" className={linkClass('/admin/messages')} onClick={onClose}>
                    <Icons.ChatBubbleLeftRight /> {/* Using a chat icon if available, or fallback */}
                    <span>Messages</span>
                </Link>
                <Link to="/admin/attributes" className={linkClass('/admin/attributes')} onClick={onClose}>
                    <Icons.Filter /> {/* Reuse Filter icon or similar */}
                    <span>Attributes</span>
                </Link>
                <Link to="/admin/content" className={linkClass('/admin/content')} onClick={onClose}>
                    <Icons.Image />
                    <span>Content</span>
                </Link>
                <Link to="/admin/blogs" className={linkClass('/admin/blogs')} onClick={onClose}>
                    <Icons.Menu />
                    <span>Journal</span>
                </Link>
                <Link to="/admin/coupons" className={linkClass('/admin/coupons')} onClick={onClose}>
                    <Icons.Tag />
                    <span>Coupons</span>
                </Link>
                <div className="my-4 border-t border-white/10"></div>
                <Link to="/admin/settings" className={linkClass('/admin/settings')} onClick={onClose}>
                    <Icons.Settings />
                    <span>Settings</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-md w-full transition-colors"
                >
                    <Icons.LogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
