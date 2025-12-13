import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../Cart/CartDrawer';
import { ToastProvider } from '../UI/Toast';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <ToastProvider>
            {!isAdmin && <Navbar />}
            {!isAdmin && <CartDrawer />}
            <main>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </ToastProvider>
    );
};

export default Layout;
