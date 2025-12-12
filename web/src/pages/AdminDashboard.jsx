import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }

        // Mock fetching orders
        const fetchOrders = async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock Data
            setOrders([
                { id: 'ORD-001', customer: 'Lorelle Doe', total: 1200, status: 'Pending', date: '2025-12-12' },
                { id: 'ORD-002', customer: 'Louis Smith', total: 450, status: 'Shipped', date: '2025-12-11' },
                { id: 'ORD-003', customer: 'Angelo Ray', total: 2300, status: 'Delivered', date: '2025-12-10' },
            ]);
            setLoading(false);
        };

        fetchOrders();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h2>Admin Dashboard</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </header>

            <main className="admin-content">
                <h3>Recent Orders</h3>
                {loading ? (
                    <div className="loading">Loading orders...</div>
                ) : (
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Status</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.date}</td>
                                        <td>{order.customer}</td>
                                        <td>
                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>₱{order.total.toLocaleString()}</td>
                                        <td>
                                            <button className="action-btn">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
