import Navbar from './Navbar';
import CartDrawer from '../Cart/CartDrawer';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <CartDrawer />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
};

export default Layout;
