import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; // Assuming useNavigate is imported
import { useState, useEffect } from 'react'; // Assuming useState and useEffect are imported
import * as ProductService from '../services/productService'; // Assuming ProductService is imported

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalOrders: 0 });

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            // 1. Fetch Real Products
            try {
                const fetchedProducts = await ProductService.getAllProducts();
                setProducts(fetchedProducts || []);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }

            // 2. Fetch Real Orders via Supabase
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);

                // Calculate Analytics
                const revenue = (data || []).reduce((sum, o) => sum + (o.total_price || 0), 0);
                setAnalytics({
                    totalRevenue: revenue,
                    totalOrders: (data || []).length
                });

            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Optional: Real-time subscription could go here
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const handleStatusChange = async (orderId, newStatus, order) => {
        const previousStatus = order.order_status;
        if (previousStatus === newStatus) return;

        const confirmChange = window.confirm(`Update status to "${newStatus}"?`);
        if (!confirmChange) return;

        // Optimistic Update
        setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));

        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // AUTOMATION: Trigger Email if Shipped
            if (newStatus === 'shipped' && previousStatus !== 'shipped') {
                try {
                    console.log("Triggering Shipping Email...");
                    await fetch('/api/admin/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: 'delivered@resend.dev', // Use safe sink or order.customer_email in prod
                            // email: order.customer_email, // REAL PROD LINE
                            name: order.customer_name,
                            orderId: order.order_number,
                            type: 'shipping_confirmation'
                        })
                    });
                    alert(`Status updated to ${newStatus} & Shipping Email sent!`);
                } catch (emailErr) {
                    console.error("Failed to trigger email", emailErr);
                    alert(`Status updated, but email failed: ${emailErr.message}`);
                }
            }

        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update status in database.");
            // Revert
            setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: previousStatus } : o));
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h2>Admin Dashboard</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="analytics-pill" style={{ backgroundColor: '#e0f2f1', padding: '0.5rem 1rem', borderRadius: '20px', color: '#00695c', fontWeight: 'bold' }}>
                        Revenue: ₱{analytics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="analytics-pill" style={{ backgroundColor: '#fff3e0', padding: '0.5rem 1rem', borderRadius: '20px', color: '#e65100', fontWeight: 'bold' }}>
                        Orders: {analytics.totalOrders}
                    </div>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="admin-content">
                <section className="dashboard-section">
                    <h3>Live Orders</h3>
                    {loading ? (
                        <div className="loading">Loading data...</div>
                    ) : (
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No active orders found.</td></tr>
                                    ) : orders.map(order => (
                                        <tr key={order.id}>
                                            <td>{order.order_number}</td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>{order.customer_name}</td>
                                            <td>
                                                <select
                                                    className={`status-select ${order.order_status}`}
                                                    value={order.order_status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                                                    style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>₱{order.total_price?.toLocaleString()}</td>
                                            <td>
                                                <button className="action-btn" onClick={() => alert(order.notes)}>View Items</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="dashboard-section" style={{ marginTop: '3rem' }}>
                    <h3>Inventory (Real Data)</h3>
                    {loading ? (
                        <div className="loading">Loading inventory...</div>
                    ) : (
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Product Name</th>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Handle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr><td colSpan="4">No products found in Supabase.</td></tr>
                                    ) : (
                                        products.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.title}</td>
                                                <td>
                                                    {product.variants[0]?.inventory_quantity > 0
                                                        ? `${product.variants[0].inventory_quantity} in stock`
                                                        : <span style={{ color: 'red' }}>Out of Stock</span>}
                                                </td>
                                                <td>
                                                    ₱{product.variants[0]?.price?.amount?.toLocaleString()}
                                                </td>
                                                <td>{product.handle}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
