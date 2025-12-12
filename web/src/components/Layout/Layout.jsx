import Navbar from './Navbar';
import CartDrawer from '../Cart/CartDrawer';
import Footer from './Footer';

import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <>
            {!isAdmin && <Navbar />}
            {!isAdmin && <CartDrawer />}
            <main>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
};

export default Layout;
