
// Check for session cookie presence by trying an API call, 
// or simplified: just try to load data, if 401, redirect.

const API_BASE = '/api/admin';

async function fetchAPI(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (res.status === 401) {
        window.location.href = '/admin/';
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || res.statusText);
    }
    return res.json();
}

async function syncProducts() {
    if (!confirm('This will delete all existing products and re-import from local inventory. Continue?')) return;

    try {
        const btn = document.querySelector('.sync-btn');
        btn.textContent = 'Syncing...';
        btn.disabled = true;

        const products = window.INVENTORY_DATA.map(p => ({
            name: p.title,
            description: p.description,
            price: parseFloat(p.price.amount),
            quantity_available: 100,
            image_url: p.images[0]?.url,
            scent_profile: p.scent_notes.join(', '),
            status: 'active'
        }));

        const result = await fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify({ action: 'sync', payload: { products } }),
            headers: { 'Content-Type': 'application/json' }
        });

        alert(`Success! Sync complete. Inserted ${result.count || 'all'} products.`);
        loadProducts();

    } catch (e) {
        console.error(e);
        alert('Sync failed: ' + e.message);
    } finally {
        const btn = document.querySelector('.sync-btn');
        if (btn) {
            btn.textContent = 'Sync Products';
            btn.disabled = false;
        }
    }
}

async function loadOrders() {
    try {
        const data = await fetchAPI('/orders');
        displayOrders(data);
        updateStats(data);
    } catch (error) {
        console.error('Error loading orders:', error);
        if (error.message !== 'Unauthorized') {
            document.getElementById('ordersTable').innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading orders: ${error.message}</td></tr>`;
        }
    }
}

async function loadProducts() {
    try {
        const data = await fetchAPI('/products');

        document.getElementById('totalProducts').textContent = data.length;

        // Calculate Analytics
        calculateAnalytics(data);

        const tbody = document.getElementById('productsTable');
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No products found.</td></tr>';
        } else {
            tbody.innerHTML = data.map(p => `
            <tr>
                <td><input type="checkbox" class="product-checkbox" value="${p.id}" onclick="updateBulkActionVisibility()"></td>
                <td style="font-size:10px; font-family:monospace">${p.id}</td>
                <td>${p.name}</td>
                <td>₱${p.price}</td>
                <td>${p.quantity_available}</td>
                <td><span class="status-badge ${p.status === 'active' ? 'status-paid' : 'status-pending'}">${p.status}</span></td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEditModal('${p.id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${p.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
        }
    } catch (e) {
        console.error(e);
        if (e.message !== 'Unauthorized') {
            document.getElementById('productsTable').innerHTML = `<tr><td colspan="7" style="color:red">Error: ${e.message}</td></tr>`;
        }
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('ordersTable');

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found yet.</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
<tr>
  <td>${order.order_number}</td>
  <td>
    ${order.customer_name}<br>
    <small style="color:#666">${order.customer_email}</small>
  </td>
  <td>${order.delivery_type === 'office_pickup' ? 'Pickup' : 'Delivery'}</td>
  <td>₱${order.total_price.toFixed(2)}</td>
  <td>
    <span class="status-badge status-${order.payment_status}">
      ${order.payment_status}
    </span>
  </td>
  <td>${new Date(order.created_at).toLocaleDateString()} ${new Date(order.created_at).toLocaleTimeString()}</td>
</tr>
`).join('');
}

function updateStats(orders) {
    if (!orders) return;
    document.getElementById('totalOrders').textContent = orders.length;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function logout() {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/admin;";
    window.location.href = '/admin/';
}

// Initial Load
loadOrders();
loadProducts();

// --- Analytics ---

function calculateAnalytics(products) {
    if (!products) return;

    // Total Inventory Value
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity_available), 0);
    document.getElementById('analyticsValue').textContent = totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Low Stock
    const lowStockCount = products.filter(p => p.quantity_available < 10).length;
    document.getElementById('analyticsLowStock').textContent = lowStockCount;

    // Active Campaigns (Active Products)
    const activeCount = products.filter(p => p.status === 'active').length;
    document.getElementById('analyticsActive').textContent = activeCount;
}

// --- Bulk Actions ---

function toggleSelectAll() {
    const mainCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => cb.checked = mainCheckbox.checked);
    updateBulkActionVisibility();
}

function updateBulkActionVisibility() {
    const checkboxes = document.querySelectorAll('.product-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');

    if (checkboxes.length > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = checkboxes.length;
    } else {
        bulkActions.style.display = 'none';
        document.getElementById('selectAll').checked = false;
    }
}

async function bulkDeleteProducts() {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => cb.value);
    if (selectedIds.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    try {
        await fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', payload: { ids: selectedIds } }),
            headers: { 'Content-Type': 'application/json' }
        });

        alert('Selected products deleted.');
        loadProducts(); // Refresh
        document.getElementById('selectAll').checked = false;
        document.getElementById('bulkActions').style.display = 'none';

    } catch (e) {
        console.error(e);
        alert('Error deleting products: ' + e.message);
    }
}

async function bulkUpdateStatus(status) {
    const selectedIds = Array.from(document.querySelectorAll('.product-checkbox:checked')).map(cb => cb.value);
    if (selectedIds.length === 0) return;

    try {
        await fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify({ action: 'update_status', payload: { ids: selectedIds, status: status } }),
            headers: { 'Content-Type': 'application/json' }
        });

        loadProducts(); // Refresh
        document.getElementById('selectAll').checked = false;
        document.getElementById('bulkActions').style.display = 'none';

    } catch (e) {
        console.error(e);
        alert('Error updating products: ' + e.message);
    }
}

// --- CRUD Operations ---

function openAddModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productModal').style.display = 'block';
}

async function openEditModal(id) {
    try {
        const allProducts = await fetchAPI('/products');
        const data = allProducts.find(p => p.id === id);

        if (!data) throw new Error('Product not found');

        document.getElementById('productId').value = data.id;
        document.getElementById('name').value = data.name;
        document.getElementById('description').value = data.description || '';
        document.getElementById('price').value = data.price;
        document.getElementById('stock').value = data.quantity_available;
        document.getElementById('imageUrl').value = data.image_url || '';
        document.getElementById('scentProfile').value = data.scent_profile || '';
        document.getElementById('status').value = data.status;

        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productModal').style.display = 'block';

    } catch (e) {
        console.error('Error fetching product details:', e);
        alert('Could not load product details.');
    }
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        closeModal();
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const btn = document.querySelector('.save-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const id = document.getElementById('productId').value;
        const stockVal = document.getElementById('stock').value;
        const priceVal = document.getElementById('price').value;

        // Validation
        if (stockVal === '' || isNaN(stockVal)) throw new Error('Invalid Stock value');
        if (priceVal === '' || isNaN(priceVal)) throw new Error('Invalid Price value');

        const productData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: parseFloat(priceVal),
            quantity_available: parseInt(stockVal),
            image_url: document.getElementById('imageUrl').value,
            scent_profile: document.getElementById('scentProfile').value,
            status: document.getElementById('status').value
        };

        if (id) {
            await fetchAPI('/products', {
                method: 'POST',
                body: JSON.stringify({ action: 'update', payload: { id, ...productData } }),
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Product updated successfully!');
        } else {
            await fetchAPI('/products', {
                method: 'POST',
                body: JSON.stringify({ action: 'create', payload: productData }),
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Product created successfully!');
        }

        closeModal();
        await loadProducts(); // Refresh list

    } catch (e) {
        console.error(e);
        alert('Error saving product: ' + e.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}


async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This acton cannot be undone.')) return;

    try {
        await fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', payload: { ids: id } }),
            headers: { 'Content-Type': 'application/json' }
        });

        alert('Product deleted.');
        loadProducts();

    } catch (e) {
        console.error(e);
        alert('Error deleting product: ' + e.message);
    }
}
