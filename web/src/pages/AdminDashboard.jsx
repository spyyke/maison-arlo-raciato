
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ProductService } from '../services/productService';
import { ORDER_STATUSES, STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants/orderStatus'; // Shared Constants
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Analytics State
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        aov: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orderStatusData, setOrderStatusData] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState('overview'); // overview, orders, products

    // Filter State
    const [orderFilterStatus, setOrderFilterStatus] = useState('all');
    const [orderSearch, setOrderSearch] = useState('');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showManualOrderModal, setShowManualOrderModal] = useState(false);

    // Inventory Editing State
    const [editingVariantId, setEditingVariantId] = useState(null); // Track ID of explicit variant/row
    const [editValues, setEditValues] = useState({});

    // New Product State
    const [newProduct, setNewProduct] = useState({
        title: '',
        description: '',
        price: '',
        quantity: '',
        tags: '',
        imageUrl: '',
        size: '50ml',
        category: 'Signature', // Default category
        handle: '' // Optional override or for adding variant to existing
    });

    // Manual Order State
    const [manualOrder, setManualOrder] = useState({
        customerName: '',
        customerEmail: '',
        items: [],
        notes: '',
        status: ORDER_STATUSES.PAID
    });
    const [manualOrderItemId, setManualOrderItemId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }

        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Products (Now returns grouped products with variants)
            const fetchedProducts = await ProductService.getAllProducts();
            setProducts(fetchedProducts || []);

            // 2. Fetch Orders
            const { data: orderData, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const fetchedOrders = orderData || [];
            setOrders(fetchedOrders);

            processAnalytics(fetchedOrders);

        } catch (error) {
            console.error("Dashboard data fetch failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const processAnalytics = (orderList) => {
        // --- Basic Metrics ---
        const revenue = orderList.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const count = orderList.length;
        const aov = count > 0 ? revenue / count : 0;

        setAnalytics({
            totalRevenue: revenue,
            totalOrders: count,
            aov: aov
        });

        // --- Revenue Trends (Last 7 Days) ---
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const chartData = last7Days.map(date => {
            const dayOrders = orderList.filter(o => o.created_at.startsWith(date));
            const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue
            };
        });
        setSalesData(chartData);

        // --- Top Selling Products ---
        const productSales = {};
        orderList.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    // Create a unique key for grouping (Title + Size/ID usually good, mainly Title for aggregate)
                    const key = item.title;
                    if (!productSales[key]) productSales[key] = { name: key, qty: 0, revenue: 0 };
                    productSales[key].qty += (item.quantity || 1);
                    productSales[key].revenue += ((item.price || 0) * (item.quantity || 1));
                });
            }
        });
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);
        setTopProducts(sortedProducts);

        // --- Order Status Distribution ---
        const statusCounts = {};
        orderList.forEach(order => {
            const status = order.order_status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const pieData = Object.keys(statusCounts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCounts[status],
            color: STATUS_COLORS[status] || '#95a5a6'
        }));
        setOrderStatusData(pieData);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const exportOrdersToCSV = () => {
        if (!orders || orders.length === 0) {
            alert("No orders to export.");
            return;
        }

        const headers = ["Order #", "Date", "Customer Name", "Email", "Status", "Total Price", "Items"];
        const csvRows = [headers.join(",")];

        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString();
            const itemsString = order.items
                ? order.items.map(i => `${i.title} (x${i.quantity})`).join("; ")
                : "";

            // Escape quotes and commas in fields
            const cleanField = (field) => `"${String(field || '').replace(/"/g, '""')}"`;

            const row = [
                cleanField(order.order_number),
                cleanField(date),
                cleanField(order.customer_name),
                cleanField(order.customer_email),
                cleanField(order.order_status),
                cleanField(order.total_price),
                cleanField(itemsString)
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- Order Logic ---
    const handleStatusChange = async (orderId, newStatus) => {
        const previousOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));

        try {
            const { error } = await supabase
                .from('orders')
                .update({ order_status: newStatus })
                .eq('id', orderId);
            if (error) throw error;
            // Re-process analytics for status chart
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o);
            processAnalytics(updatedOrders);
        } catch (err) {
            console.error("Update status failed:", err);
            setOrders(previousOrders);
        }
    };

    // Flatten logic for manual order selection if needed, or just work with variants directly
    const flatVariants = useMemo(() => {
        return products.flatMap(p =>
            p.variants.map(v => ({
                id: v.id, // Supabase row ID
                title: `${p.title} (${v.title})`, // "Midnight Oud (50ml)"
                price: v.price.amount,
                stock: v.inventory_quantity,
                parentHandle: p.handle
            }))
        );
    }, [products]);

    // Low stock calculation
    const lowStockAlerts = useMemo(() => {
        return flatVariants.filter(v => v.stock < 10);
    }, [flatVariants]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus = orderFilterStatus === 'all' || (order.order_status || 'pending') === orderFilterStatus;
            const searchLower = orderSearch.toLowerCase();
            const matchesSearch =
                (order.customer_name || '').toLowerCase().includes(searchLower) ||
                (order.order_number || '').toLowerCase().includes(searchLower) ||
                (order.customer_email || '').toLowerCase().includes(searchLower);

            return matchesStatus && matchesSearch;
        });
    }, [orders, orderFilterStatus, orderSearch]);


    // --- Inventory Logic ---
    const startEditing = (variant) => {
        setEditingVariantId(variant.id);
        setEditValues({
            quantity: variant.inventory_quantity || 0,
            price: variant.price?.amount || 0
        });
    };

    const saveEditing = async (variant) => {
        if (!editingVariantId) return;
        try {
            const updates = {
                quantity_available: parseInt(editValues.quantity),
                price: parseFloat(editValues.price)
            };
            // Currently ProductService.updateProduct expects ID. Luckily our variants ARE rows with IDs.
            const updatedProduct = await ProductService.updateProduct(variant.id, updates);
            if (updatedProduct) {
                // Refresh all data because updating one row might affect the grouped structure logic
                // Or selectively update local state. For safety, re-fetch.
                await fetchData();
                setEditingVariantId(null);
            }
        } catch (error) {
            alert("Error saving inventory changes.");
        }
    };

    // --- Product Logic ---
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            // Logic to support adding to existing handle?
            // User can manually set handle for now in a simpler flow via API but UI restricts it.
            // For now, this creates a NEW product handle unless we check existence.

            // Note: If newProduct.handle is provided (e.g. for creating variant), use it.

            const created = await ProductService.createProduct(newProduct);
            if (created) {
                // We should re-fetch to let the grouping logic run if we added a variant to existing handle
                await fetchData();
                setShowAddProductModal(false);
                setShowAddProductModal(false);
                setNewProduct({ title: '', description: '', price: '', quantity: '', tags: '', imageUrl: '', size: '50ml', category: 'Signature', handle: '' });
                alert("Product created successfully!");
            }
        } catch (error) {
            alert("Failed to create product.");
        }
    };

    // Quick helper to pre-fill 'Add Variant' form
    const openAddVariant = (product) => {
        setNewProduct({
            title: product.title,
            description: product.description,
            price: '',
            quantity: '',
            tags: product.tags.join(', ').replace(/Note: /g, ''),
            imageUrl: product.images[0]?.url || '',
            size: '100ml', // Default to next common size
            category: product.category || 'Signature',
            handle: product.handle // Critical: Link to existing handle
        });
        setShowAddProductModal(true);
    };


    // --- Manual Order Logic ---
    const addManualItem = () => {
        if (!manualOrderItemId) return;
        const variantItem = flatVariants.find(v => v.id === manualOrderItemId);
        if (!variantItem) return;

        const existingItem = manualOrder.items.find(i => i.id === variantItem.id);
        if (existingItem) {
            setManualOrder({
                ...manualOrder,
                items: manualOrder.items.map(i => i.id === variantItem.id ? { ...i, quantity: i.quantity + 1 } : i)
            });
        } else {
            setManualOrder({
                ...manualOrder,
                items: [...manualOrder.items, {
                    id: variantItem.id,
                    title: variantItem.title,
                    price: variantItem.price,
                    quantity: 1
                }]
            });
        }
        setManualOrderItemId('');
    };

    const removeManualItem = (id) => {
        setManualOrder({
            ...manualOrder,
            items: manualOrder.items.filter(i => i.id !== id)
        });
    };

    const handleCreateManualOrder = async (e) => {
        e.preventDefault();
        if (manualOrder.items.length === 0) {
            alert("Please add at least one item.");
            return;
        }

        const totalPrice = manualOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            await ProductService.createManualOrder({
                ...manualOrder,
                totalPrice
            });
            setShowManualOrderModal(false);
            setManualOrder({ customerName: '', customerEmail: '', items: [], notes: '', status: 'paid' }); // Reset
            fetchData(); // Refresh all data to see new order and updated stocks
            alert("Order created successfully!");
        } catch (error) {
            alert("Failed to create manual order.");
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-left">
                    <h2>Maison Arlo Raciàto</h2>
                    <span className="badge-admin">Admin Portal</span>
                </div>
                <div className="admin-controls">
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="admin-content-wrapper">
                {/* KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <h3>Total Revenue</h3>
                        <div className="kpi-value">₱{analytics.totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className="kpi-card">
                        <h3>Total Orders</h3>
                        <div className="kpi-value">{analytics.totalOrders}</div>
                    </div>
                    <div className="kpi-card">
                        <h3>Avg. Order Value</h3>
                        <div className="kpi-value">₱{Math.round(analytics.aov).toLocaleString()}</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-grid">
                    {/* Left Column: Analytics & Quick Actions */}
                    <div className="analytics-column">
                        {/* 1. Revenue Chart */}
                        <section className="dashboard-card chart-card">
                            <div className="card-header">
                                <h3>Revenue Trends (Last 7 Days)</h3>
                            </div>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#666' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            hide={true}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#C5A47E"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* 2. Order Status Chart */}
                        <section className="dashboard-card chart-card">
                            <div className="card-header">
                                <h3>Order Status Distribution</h3>
                            </div>
                            <div className="chart-container" style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={orderStatusData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="middle" align="bottom" layout="horizontal" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* 3. Top Products */}
                        <section className="dashboard-card">
                            <div className="card-header">
                                <h3>Top Selling Products</h3>
                            </div>
                            <div className="top-products-list">
                                {topProducts.map((p, idx) => (
                                    <div key={idx} className="top-product-item">
                                        <div className="top-product-left">
                                            <span className="rank-badge">#{idx + 1}</span>
                                            <span className="font-medium">{p.name}</span>
                                        </div>
                                        <div className="top-product-right">
                                            <div className="qty-sold">{p.qty} sold</div>
                                            <div className="revenue-sub">₱{p.revenue.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {topProducts.length === 0 && <p className="empty-state">No sales data yet.</p>}
                            </div>
                        </section>

                        <section className="dashboard-card">
                            <div className="card-header">
                                <h3>Quick Actions</h3>
                            </div>
                            <div className="quick-actions">
                                <button className="primary-btn full-width spacer-bottom" onClick={() => setShowManualOrderModal(true)}>
                                    + Create Manual Order (POS)
                                </button>
                                <button className="secondary-btn full-width" onClick={() => {
                                    setNewProduct({ title: '', description: '', price: '', quantity: '', tags: '', imageUrl: '', size: '50ml', category: 'Signature', handle: '' });
                                    setShowAddProductModal(true);
                                }}>
                                    + Add New Product
                                </button>
                                <button className="secondary-btn full-width spacer-top text-muted border-muted" onClick={exportOrdersToCSV}>
                                    ⬇ Export Orders to CSV
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Key Operational Tables */}
                    <div className="operations-column">

                        {/* Low Stock Alert */}
                        {lowStockAlerts.length > 0 && (
                            <section className="dashboard-card alert-card">
                                <div className="card-header">
                                    <h3 className="alert-header-text">⚠️ Low Stock Alerts</h3>
                                </div>
                                <div className="low-stock-list">
                                    {lowStockAlerts.map(item => (
                                        <div key={item.id} className="stock-alert-chip">
                                            <div className="alert-title">{item.title}</div>
                                            <div className="alert-qty">Only {item.stock} left</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Orders Section */}
                        <section className="dashboard-card">
                            <div className="card-header with-controls">
                                <h3>Recent Orders</h3>
                                <div className="header-filters">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                        className="search-input"
                                    />
                                    <select
                                        value={orderFilterStatus}
                                        onChange={(e) => setOrderFilterStatus(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="all">All</option>
                                        {Object.values(ORDER_STATUSES).map(status => (
                                            <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Detail</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.slice(0, 10).map(order => (
                                            <tr key={order.id}>
                                                <td className="font-mono">#{order.order_number}</td>
                                                <td>
                                                    <div className="customer-cell">
                                                        <span className="customer-name">{order.customer_name}</span>
                                                        <small>{new Date(order.created_at).toLocaleDateString()}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className={`status-chip ${order.order_status || 'pending'}`}
                                                        value={order.order_status || 'pending'}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    >
                                                        {Object.values(ORDER_STATUSES).map(status => (
                                                            <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="font-medium">₱{order.total_price?.toLocaleString()}</td>
                                                <td>
                                                    <button className="icon-btn" onClick={() => setSelectedOrder(order)}>👁️</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="empty-state">No orders found matching your filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {filteredOrders.length > 10 && (
                                <div className="table-footer">
                                    Showing last 10 of {filteredOrders.length} orders
                                </div>
                            )}
                        </section>

                        {/* Inventory Section (Updated for Variants) */}
                        <section className="dashboard-card">
                            <div className="card-header">
                                <h3>Inventory & Variants</h3>
                            </div>
                            <div className="table-wrapper">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Product / Variant</th>
                                            <th>Stock</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <>
                                                {/* Parent Header Row (Optional, maybe just group visually) */}
                                                <tr key={`header-${product.handle}`} className="product-header-row">
                                                    <td colSpan="4">
                                                        {product.title}
                                                        <span className="text-muted font-normal"> ({product.handle})</span>
                                                        {product.category && <span className="category-badge-list">{product.category}</span>}
                                                    </td>
                                                </tr>
                                                {/* Variant Rows */}
                                                {product.variants.map(variant => {
                                                    const isEditing = editingVariantId === variant.id;
                                                    return (
                                                        <tr key={variant.id} className="variant-row">
                                                            <td style={{ paddingLeft: '2rem' }}>
                                                                <span className="variant-badge">{variant.title}</span>
                                                            </td>
                                                            <td>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        className="edit-input"
                                                                        value={editValues.quantity}
                                                                        onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                                                                    />
                                                                ) : (
                                                                    <span className={variant.inventory_quantity < 10 ? 'text-warn' : 'text-good'}>
                                                                        {variant.inventory_quantity}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="number"
                                                                        className="edit-input"
                                                                        value={editValues.price}
                                                                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                                                                    />
                                                                ) : (
                                                                    `₱${variant.price?.amount?.toLocaleString()}`
                                                                )}
                                                            </td>
                                                            <td>
                                                                {isEditing ? (
                                                                    <div className="action-group">
                                                                        <button className="save-btn-small" onClick={() => saveEditing(variant)}>Save</button>
                                                                        <button className="cancel-btn-small" onClick={() => setEditingVariantId(null)}>✕</button>
                                                                    </div>
                                                                ) : (
                                                                    <button className="edit-btn-text" onClick={() => startEditing(variant)}>Edit</button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {/* Add Variant Quick Action */}
                                                <tr key={`add-${product.handle}`}>
                                                    <td colSpan="4" className="add-variant-cell">
                                                        <button
                                                            onClick={() => openAddVariant(product)}
                                                            className="add-variant-btn"
                                                        >
                                                            + Add Variant (e.g. 100ml)
                                                        </button>
                                                    </td>
                                                </tr>
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* View Order Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content slide-in-bottom" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div><h3>Order #{selectedOrder.order_number}</h3></div>
                            <button className="close-modal" onClick={() => setSelectedOrder(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-meta-grid">
                                <div className="meta-box"><label>Customer</label><p>{selectedOrder.customer_name}</p></div>
                                <div className="meta-box"><label>Total</label><p>₱{selectedOrder.total_price?.toLocaleString()}</p></div>
                            </div>
                            <div className="order-items-list-v2">
                                <label>Items</label>
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <span>{item.title}</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{newProduct.handle ? `Add Variant to ${newProduct.title}` : 'Add New Product'}</h3>
                            <button className="close-modal" onClick={() => setShowAddProductModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateProduct} className="create-product-form modal-body">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    required
                                    value={newProduct.title}
                                    onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                    disabled={!!newProduct.handle} // Lock name if adding variant
                                />
                            </div>

                            {!newProduct.handle && (
                                <div className="form-group">
                                    <label>Collection / Category</label>
                                    <select
                                        className="filter-select full-width"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option value="Signature">Signature Collection</option>
                                        <option value="Men">Men's Collection</option>
                                        <option value="Women">Women's Collection</option>
                                        <option value="Limited">Limited Edition</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Size / Variant Name</label>
                                    <input
                                        required
                                        placeholder="e.g. 50ml"
                                        value={newProduct.size}
                                        onChange={e => setNewProduct({ ...newProduct, size: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number" required
                                        value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number" required
                                        value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!newProduct.handle && (
                                <>
                                    <div className="form-group"><label>Description</label><textarea rows="2" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}></textarea></div>
                                    <div className="form-group"><label>Scent Notes</label><input value={newProduct.tags} onChange={e => setNewProduct({ ...newProduct, tags: e.target.value })} /></div>
                                </>
                            )}

                            <button type="submit" className="primary-btn full-width" style={{ marginTop: '1rem' }}>
                                {newProduct.handle ? 'Add Variant' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Order (POS) Modal */}
            {
                showManualOrderModal && (
                    <div className="modal-overlay" onClick={() => setShowManualOrderModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header"><h3>New Manual Order</h3><button className="close-modal" onClick={() => setShowManualOrderModal(false)}>&times;</button></div>
                            <form onSubmit={handleCreateManualOrder} className="modal-body">
                                <div className="form-group"><label>Customer Name</label><input required value={manualOrder.customerName} onChange={e => setManualOrder({ ...manualOrder, customerName: e.target.value })} /></div>

                                <div className="form-group" style={{ background: '#fafafa', padding: '1rem' }}>
                                    <label>Add Items</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select value={manualOrderItemId} onChange={e => setManualOrderItemId(e.target.value)} style={{ flex: 1 }}>
                                            <option value="">Select Product...</option>
                                            {flatVariants.map(v => <option key={v.id} value={v.id}>{v.title} (Stock: {v.stock})</option>)}
                                        </select>
                                        <button type="button" onClick={addManualItem} className="primary-btn">Add</button>
                                    </div>
                                    <div className="manual-items-list" style={{ marginTop: '0.5rem' }}>
                                        {manualOrder.items.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <small>{item.title} (x{item.quantity})</small>
                                                <small>₱{item.price * item.quantity}</small>
                                            </div>
                                        ))}
                                    </div>
                                    {manualOrder.items.length > 0 && <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: '0.5rem' }}>Total: ₱{manualOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString()}</div>}
                                </div>
                                <button type="submit" className="primary-btn full-width" style={{ marginTop: '1rem' }}>Complete Order</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
