# COMPLETE E-COMMERCE INTEGRATION GUIDE
## Davao Perfume Shop - Existing Website Setup

**Date:** December 12, 2025  
**Status:** Website 60% complete (Frontend done, Backend needed)  
**Timeline:** 1 week to go LIVE  
**Cost:** ₱0 setup + ₱200-500/month operating  

---

# TABLE OF CONTENTS

1. [OVERVIEW](#overview)
2. [YOUR SITUATION](#your-situation)
3. [TECHNOLOGY STACK](#technology-stack)
4. [PHASE 1: DATABASE SETUP](#phase-1-database-setup)
5. [PHASE 2: SUPABASE INTEGRATION](#phase-2-supabase-integration)
6. [PHASE 3: PAYMONGO INTEGRATION](#phase-3-paymongo-integration)
7. [PHASE 4: RESEND EMAIL SERVICE](#phase-4-resend-email-service)
8. [PHASE 5: ADMIN DASHBOARD](#phase-5-admin-dashboard)
9. [PHASE 6: ENVIRONMENT SETUP](#phase-6-environment-setup)
10. [PHASE 7: TESTING & DEPLOYMENT](#phase-7-testing--deployment)
11. [WEEKLY TIMELINE](#weekly-timeline)
12. [TROUBLESHOOTING](#troubleshooting)
13. [COST BREAKDOWN](#cost-breakdown)
14. [SECURITY](#security)

---

# OVERVIEW

## What You Have
✅ Home page built  
✅ Shop/catalog page built  
✅ Shopping cart built  
✅ Product detail pages (WIP)  
✅ Checkout form (visual only, no payment)  
✅ Website deployed on Cloudflare Pages  
✅ GitHub repository set up  

## What You Need
❌ Database (Supabase)  
❌ Payment processing (PayMongo)  
❌ Email notifications (Resend)  
❌ Admin dashboard  
❌ Order management system  
❌ Inventory tracking  

## What You'll Get
✅ Complete e-commerce system  
✅ Automated payments  
✅ Real-time inventory  
✅ Order tracking  
✅ Email confirmations  
✅ Professional admin panel  

---

# YOUR SITUATION

### Current System
- Frontend: Google Antigravity → GitHub → Cloudflare Pages
- Database: None
- Payments: None
- Emails: None
- Admin: None

### Problem
- Can't process payments
- Can't track orders
- Can't manage inventory
- Can't notify customers
- Manual everything

### Solution
- Add Supabase (database)
- Add PayMongo (payments)
- Add Resend (emails)
- Build admin dashboard
- Automate everything

### Timeline
- Week 1: Setup & Integration
- Sunday: LIVE
- Next week: Accepting real orders

---

# TECHNOLOGY STACK

## Services Used

| Component | Technology | Cost | Why |
|-----------|-----------|------|-----|
| **Database** | Supabase | ₱0/month | PostgreSQL, real-time, free tier |
| **Payments** | PayMongo | 1.49% + ₱2.50/txn | Local Philippine payment processor |
| **Emails** | Resend | ₱0 (3,000/month free) | Modern, reliable, free tier |
| **Hosting** | Cloudflare Pages | ₱0/month | Already using, free tier |
| **Code Repo** | GitHub | ₱0/month | Version control, free |
| **Backend Functions** | Cloudflare Workers | ₱0 (free tier) | Serverless, auto-scaling |

## Total Monthly Cost
- Supabase: ₱0
- PayMongo: ₱200-500 (2% of transactions)
- Resend: ₱0 (until 750+ orders/month)
- Cloudflare: ₱0
- GitHub: ₱0
- **Total: ₱200-500/month**

---

# PHASE 1: DATABASE SETUP

**Timeline: Day 1-2 (Monday-Tuesday)**  
**Time Required: 2 hours**

## Step 1.1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with Google or email
4. Create new project:
   - Project name: `davao-perfume-shop`
   - Database password: Create strong password
   - Region: `Southeast Asia (Singapore)`
5. Wait 2-3 minutes for initialization
6. Go to Settings → API

## Step 1.2: Get Supabase Credentials

In **Settings → API**:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save these in a secure location (you'll need them later)**

## Step 1.3: Create Database Tables

In Supabase dashboard:
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy-paste this SQL:

```sql
-- TABLE 1: PERFUMES (Product Inventory)
CREATE TABLE IF NOT EXISTS perfumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 400.00,
  scent_profile TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- TABLE 2: ORDERS (Customer Orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  perfume_id UUID NOT NULL REFERENCES perfumes(id),
  quantity_ordered INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  delivery_location TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'office_pickup',
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  paymongo_ref TEXT,
  shipping_partner TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- TABLE 3: SHIPPING (Shipping Details)
CREATE TABLE IF NOT EXISTS shipping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipping_type TEXT NOT NULL,
  shipping_fee DECIMAL(10, 2),
  tracking_number TEXT,
  carrier_name TEXT,
  estimated_delivery DATE,
  actual_delivery DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_shipping_order_id ON shipping(order_id);
CREATE INDEX idx_perfumes_status ON perfumes(status);
```

4. Execute the query
5. Verify tables were created (check left sidebar)

## Step 1.4: Add Sample Products

Execute this SQL:

```sql
INSERT INTO perfumes (name, description, price, scent_profile, quantity_available, image_url, status)
VALUES 
  ('Rose Elegance', 'A delicate blend of rose, jasmine, and sandalwood.', 400.00, 'Floral, Fresh', 50, 'https://your-domain.com/rose.jpg', 'active'),
  ('Ocean Fresh', 'Crisp ocean breeze with hints of citrus and sea salt.', 400.00, 'Fresh, Citrus', 45, 'https://your-domain.com/ocean.jpg', 'active'),
  ('Vanilla Dreams', 'Warm vanilla with undertones of amber and musk.', 400.00, 'Sweet, Warm', 30, 'https://your-domain.com/vanilla.jpg', 'active');
```

**Update image URLs to match your website**

## ✅ Phase 1 Complete When:
- [ ] Supabase account created
- [ ] 3 tables created
- [ ] 3 sample products added
- [ ] API credentials saved

---

# PHASE 2: SUPABASE INTEGRATION

**Timeline: Day 2-3 (Tuesday-Wednesday)**  
**Time Required: 3 hours**

## Step 2.1: Add Supabase to Your HTML

In your website's `<head>` tag, add:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## Step 2.2: Connect Shop Page to Database

Find your shop/catalog page JavaScript. Add this code:

```javascript
// Initialize Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch products from database
async function loadProducts() {
  try {
    const { data, error } = await supabaseClient
      .from('perfumes')
      .select('*')
      .eq('status', 'active');
    
    if (error) throw error;
    
    // Display products on your shop page
    displayProducts(data);
    
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Call this when shop page loads
window.addEventListener('load', loadProducts);
```

## Step 2.3: Add Stock Check to Cart

In your shopping cart JavaScript, add:

```javascript
async function addToCart(perfumeId, quantity) {
  // Check if still in stock
  const { data, error } = await supabaseClient
    .from('perfumes')
    .select('quantity_available')
    .eq('id', perfumeId)
    .single();
  
  if (error || !data || data.quantity_available < quantity) {
    alert('Sorry, not enough stock available');
    return false;
  }
  
  // Your existing add-to-cart code here
  return true;
}
```

## ✅ Phase 2 Complete When:
- [ ] Supabase script added to HTML head
- [ ] Shop page loads products from database
- [ ] Stock checking works
- [ ] No console errors

---

# PHASE 3: PAYMONGO INTEGRATION

**Timeline: Day 3-4 (Wednesday-Thursday)**  
**Time Required: 4 hours**

## Step 3.1: Get PayMongo API Keys

1. Log into [paymongo.com](https://paymongo.com)
2. Go to **Developers → API Keys**
3. Select **TEST MODE** (for testing)
4. Copy and save:
   - Secret Key (Test)
   - Public Key (Test)

```
PAYMONGO_SECRET_KEY = sk_test_xxxxx
PAYMONGO_PUBLIC_KEY = pk_test_xxxxx
```

## Step 3.2: Add Payment Function to Checkout

Add this to your checkout page JavaScript:

```javascript
async function processPayment(event) {
  event.preventDefault();
  
  // Get form data
  const formData = {
    customer_email: document.getElementById('email').value,
    customer_name: document.getElementById('name').value,
    customer_phone: document.getElementById('phone').value,
    delivery_location: document.getElementById('address').value,
    delivery_type: document.getElementById('deliveryType').value
  };
  
  // Get cart items
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  
  try {
    // Calculate total
    let totalPrice = 0;
    cart.forEach(item => {
      totalPrice += (item.price * item.quantity);
    });
    
    // Add shipping fee
    const shippingFee = formData.delivery_type === 'office_pickup' ? 0 : 150;
    totalPrice += shippingFee;
    
    // Call backend
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_email: formData.customer_email,
        customer_name: formData.customer_name,
        items: cart,
        total_price: totalPrice,
        shipping_fee: shippingFee,
        delivery_type: formData.delivery_type,
        delivery_location: formData.delivery_location
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      window.location.href = data.checkout_url; // Redirect to PayMongo
    } else {
      alert('Payment processing failed: ' + data.error);
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    alert('An error occurred during checkout');
  }
}

// Attach to Pay button
document.getElementById('payButton').addEventListener('click', processPayment);
```

## Step 3.3: Create Checkout Backend Function

Create new file: **`functions/create-checkout.js`**

```javascript
export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const body = await request.json();
    const { customer_email, customer_name, items, total_price } = body;
    
    const PAYMONGO_SECRET_KEY = context.env.PAYMONGO_SECRET_KEY;
    
    // Format items for PayMongo
    const line_items = items.map(item => ({
      name: item.name,
      amount: Math.round(item.price * 100), // Convert to centavos
      quantity: item.quantity,
      currency: 'PHP'
    }));
    
    // Create checkout session
    const checkoutPayload = {
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          line_items: line_items,
          payment_method_types: ['gcash', 'card'],
          currency: 'PHP',
          customer: {
            email: customer_email,
            name: customer_name
          },
          description: `Order for ${customer_name}`,
          reference_number: `REF-${Date.now()}`,
          metadata: {
            customer_email: customer_email,
            delivery_type: body.delivery_type,
            shipping_fee: body.shipping_fee
          }
        }
      }
    };
    
    // Call PayMongo API
    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${PAYMONGO_SECRET_KEY}:`)}`
      },
      body: JSON.stringify(checkoutPayload)
    });
    
    if (!response.ok) {
      throw new Error('PayMongo API error');
    }
    
    const checkoutData = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      checkout_url: checkoutData.data.attributes.checkout_url,
      session_id: checkoutData.data.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { status: 500 });
  }
}
```

## Step 3.4: Create Webhook Handler

Create new file: **`functions/paymongo-webhook.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
  const { request } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const payload = await request.json();
    const eventType = payload.data?.type;
    const eventData = payload.data?.attributes?.data?.attributes;
    
    // Check if payment was successful
    if (eventType === 'payment.paid') {
      const SUPABASE_URL = context.env.SUPABASE_URL;
      const SUPABASE_SERVICE_KEY = context.env.SUPABASE_SERVICE_KEY;
      const RESEND_API_KEY = context.env.RESEND_API_KEY;
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      // Create order in database
      const orderNumber = `ORD-${Date.now()}`;
      
      const { error } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          customer_email: eventData.customer.email,
          customer_name: eventData.customer.name,
          customer_phone: payload.data.attributes?.metadata?.customer_phone || '',
          perfume_id: payload.data.attributes?.metadata?.perfume_id || '',
          quantity_ordered: 1,
          unit_price: (eventData.amount / 100),
          subtotal: (eventData.amount / 100),
          shipping_fee: payload.data.attributes?.metadata?.shipping_fee || 0,
          total_price: (eventData.amount / 100),
          delivery_type: payload.data.attributes?.metadata?.delivery_type || 'office_pickup',
          payment_status: 'paid',
          order_status: 'pending',
          paymongo_ref: payload.data.id
        }]);
      
      if (error) throw error;
      
      // Send confirmation email via Resend
      await sendConfirmationEmail(
        RESEND_API_KEY,
        eventData.customer.email,
        eventData.customer.name,
        orderNumber,
        eventData.amount / 100
      );
      
      console.log('Order created:', orderNumber);
    }
    
    // PayMongo requires 2xx response
    return new Response(JSON.stringify({ success: true }), { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 200 });
  }
}

async function sendConfirmationEmail(apiKey, email, name, orderNumber, total) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'orders@davao-perfume.com',
        to: email,
        subject: `Order Confirmation - ${orderNumber}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Hi ${name},</p>
          <p>We've received your order <strong>${orderNumber}</strong></p>
          <p><strong>Total: ₱${total.toFixed(2)}</strong></p>
          <p>We'll process and ship your order within 24 hours.</p>
          <p>You'll receive a shipping notification with tracking details.</p>
          <p>Best regards,<br>Davao Perfume Shop</p>
        `
      })
    });
    
    if (!response.ok) {
      console.error('Resend email error:', await response.text());
    }
    
  } catch (error) {
    console.error('Email sending error:', error);
  }
}
```

## ✅ Phase 3 Complete When:
- [ ] PayMongo API keys obtained
- [ ] Checkout function added to page
- [ ] Backend functions created
- [ ] Test payment with: 4343 4343 4343 4343
- [ ] Order appears in Supabase

---

# PHASE 4: RESEND EMAIL SERVICE

**Timeline: Day 2-4 (Tuesday-Thursday)**  
**Time Required: 1 hour**

## Step 4.1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up"
3. Enter your email
4. Verify email
5. Go to **API Keys**
6. Copy your API key

```
RESEND_API_KEY = re_xxxxxxxxxxxx
```

**Save this - you'll use it in Wrangler secrets**

## Step 4.2: Test Sender Email

For testing, use: `onboarding@resend.dev`  
(Resend's default email for new accounts)

Later, you can setup your own domain: `orders@davao-perfume.com`

## How Emails Work

**Automatic emails sent via Resend:**

1. **Order Confirmation**
   - Sent immediately after payment
   - Contains order details + total price
   - Sent to customer email

2. **Shipping Notification** (You send manually)
   - After you ship order
   - Contains tracking number
   - Can integrate later

## ✅ Phase 4 Complete When:
- [ ] Resend account created
- [ ] API key copied and saved
- [ ] Verified you can see dashboard

---

# PHASE 5: ADMIN DASHBOARD

**Timeline: Day 5 (Friday)**  
**Time Required: 3 hours**

## Step 5.1: Create Admin Login Page

Create new file: **`admin/login.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Davao Perfume</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .login-box {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    input {
      width: 100%;
      padding: 12px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px;
    }
    button {
      width: 100%;
      padding: 12px;
      margin-top: 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <div class="login-box">
    <h1>Admin Login</h1>
    <input type="password" id="password" placeholder="Enter admin password">
    <button onclick="loginAdmin()">Login</button>
  </div>

  <script>
    function loginAdmin() {
      const password = document.getElementById('password').value;
      const correctPassword = 'YOUR_ADMIN_PASSWORD'; // CHANGE THIS!
      
      if (password === correctPassword) {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = '/admin/dashboard.html';
      } else {
        alert('Incorrect password');
      }
    }
    
    if (localStorage.getItem('adminLoggedIn')) {
      window.location.href = '/admin/dashboard.html';
    }
  </script>
</body>
</html>
```

**⚠️ IMPORTANT:** Change `'YOUR_ADMIN_PASSWORD'` to a strong password

## Step 5.2: Create Admin Dashboard

Create new file: **`admin/dashboard.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
    }
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      color: #666;
      margin-bottom: 10px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #007bff;
    }
    .orders-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f9f9f9;
      font-weight: bold;
    }
    tr:hover {
      background: #f5f5f5;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-paid {
      background: #d4edda;
      color: #155724;
    }
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Admin Dashboard</h1>
      <button class="logout-btn" onclick="logout()">Logout</button>
    </header>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Orders</h3>
        <div class="stat-value" id="totalOrders">0</div>
      </div>
      <div class="stat-card">
        <h3>Total Revenue</h3>
        <div class="stat-value">₱<span id="totalRevenue">0</span></div>
      </div>
      <div class="stat-card">
        <h3>Pending Orders</h3>
        <div class="stat-value" id="pendingOrders">0</div>
      </div>
    </div>

    <div class="orders-section">
      <h2>Recent Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="ordersTable">
          <tr><td colspan="6" style="text-align: center;">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    // Check if logged in
    if (!localStorage.getItem('adminLoggedIn')) {
      window.location.href = '/admin/login.html';
    }

    // Initialize Supabase
    const SUPABASE_URL = 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Load orders
    async function loadOrders() {
      try {
        const { data, error } = await supabaseClient
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        displayOrders(data);
        updateStats(data);
        
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }

    function displayOrders(orders) {
      const tbody = document.getElementById('ordersTable');
      
      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No orders yet</td></tr>';
        return;
      }
      
      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>${order.order_number}</td>
          <td>${order.customer_name}</td>
          <td>₱${order.total_price}</td>
          <td>
            <span class="status-badge status-${order.payment_status}">
              ${order.payment_status}
            </span>
          </td>
          <td>${new Date(order.created_at).toLocaleDateString()}</td>
          <td>
            <button onclick="viewOrder('${order.id}')">View</button>
          </td>
        </tr>
      `).join('');
    }

    function updateStats(orders) {
      document.getElementById('totalOrders').textContent = orders.length;
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
      document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
      
      const pendingCount = orders.filter(o => o.payment_status === 'pending').length;
      document.getElementById('pendingOrders').textContent = pendingCount;
    }

    function viewOrder(orderId) {
      alert('View order: ' + orderId);
    }

    function logout() {
      localStorage.removeItem('adminLoggedIn');
      window.location.href = '/admin/login.html';
    }

    // Load on page load
    loadOrders();
  </script>
</body>
</html>
```

**Replace with your Supabase credentials:**
- `YOUR_SUPABASE_URL`
- `YOUR_SUPABASE_ANON_KEY`

## ✅ Phase 5 Complete When:
- [ ] Login page created
- [ ] Dashboard page created
- [ ] Credentials replaced
- [ ] Admin login works
- [ ] Dashboard displays orders from database

---

# PHASE 6: ENVIRONMENT SETUP

**Timeline: Day 6 (Saturday)**  
**Time Required: 2 hours**

## Step 6.1: Create `.env.local` File

In your project root, create: **`.env.local`**

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PAYMONGO_SECRET_KEY=sk_test_...
PAYMONGO_PUBLIC_KEY=pk_test_...
RESEND_API_KEY=re_xxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
```

**Replace all `YOUR_...` and `xxx` values with actual credentials**

## Step 6.2: Update `.gitignore`

Make sure `.env.local` is in `.gitignore`:

```
.env.local
.env
node_modules/
dist/
*.lock
```

## Step 6.3: Change Admin Password

Open `admin/dashboard.html` and find this line:

```javascript
const correctPassword = 'YOUR_ADMIN_PASSWORD'; // CHANGE THIS!
```

Change to a strong password:

```javascript
const correctPassword = 'MySecurePassword123!'; // Changed
```

## Step 6.4: Setup Wrangler for Cloudflare Workers

Install Wrangler:

```bash
npm install -g wrangler
```

Create `wrangler.toml`:

```toml
name = "davao-perfume-api"
type = "javascript"
account_id = "your-cloudflare-account-id"
workers_dev = true
route = "api/*"
```

Add secrets:

```bash
wrangler secret put PAYMONGO_SECRET_KEY
# Paste: sk_test_...

wrangler secret put SUPABASE_URL
# Paste: https://your-project.supabase.co

wrangler secret put SUPABASE_SERVICE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

wrangler secret put RESEND_API_KEY
# Paste: re_xxxx...
```

## ✅ Phase 6 Complete When:
- [ ] `.env.local` created with all credentials
- [ ] `.gitignore` includes `.env.local`
- [ ] Admin password changed
- [ ] Wrangler configured
- [ ] Secrets added to Wrangler

---

# PHASE 7: TESTING & DEPLOYMENT

**Timeline: Day 7 (Sunday)**  
**Time Required: 2 hours**

## Step 7.1: Test Database Connection

In browser console:

```javascript
const { createClient } = supabase;
const client = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

(async () => {
  const { data, error } = await client.from('perfumes').select('*');
  console.log('Products:', data);
  console.log('Error:', error);
})();
```

Should show your 3 sample products.

## Step 7.2: Test Payment Flow

1. Go to checkout page
2. Fill in customer info
3. Use test card: `4343 4343 4343 4343`
4. Complete payment
5. Check:
   - Order appears in Supabase database
   - Confirmation email sent to customer
   - Order appears in admin dashboard

## Step 7.3: Deploy to Cloudflare Workers

```bash
wrangler publish
```

This deploys your backend functions.

## Step 7.4: Deploy to GitHub & Cloudflare Pages

```bash
git add .
git commit -m "feat: add PayMongo, Supabase, Resend integration"
git push origin main
```

Cloudflare Pages auto-deploys when you push.

## Step 7.5: Verify Live

1. Visit your website: `https://your-site.pages.dev`
2. Test checkout with test card
3. Check admin dashboard: `https://your-site.pages.dev/admin/login.html`
4. Verify order in dashboard

## ✅ Phase 7 Complete When:
- [ ] All tests pass
- [ ] Code pushed to GitHub
- [ ] Cloudflare deploys
- [ ] Website accessible at live URL
- [ ] Checkout works end-to-end
- [ ] Orders appear in admin dashboard
- [ ] Confirmation emails send

---

# WEEKLY TIMELINE

## MONDAY (Day 1)
**Goal: Database ready**
- [ ] Create Supabase account
- [ ] Create database tables
- [ ] Add sample products
- **Time: 2 hours**

## TUESDAY (Day 2)
**Goal: Shop page connected + Resend setup**
- [ ] Add Supabase script to HTML
- [ ] Connect shop page to database
- [ ] Create Resend account
- [ ] Get API key
- **Time: 3 hours**

## WEDNESDAY (Day 3)
**Goal: PayMongo checkout working**
- [ ] Get PayMongo API keys
- [ ] Add payment function to checkout
- [ ] Create checkout backend function
- [ ] Test with PayMongo test card
- **Time: 4 hours**

## THURSDAY (Day 4)
**Goal: Backend deployed with email**
- [ ] Create webhook handler
- [ ] Add Wrangler configuration
- [ ] Deploy Cloudflare Workers
- [ ] Add Wrangler secrets
- [ ] Test end-to-end
- **Time: 3 hours**

## FRIDAY (Day 5)
**Goal: Admin dashboard ready**
- [ ] Create login page
- [ ] Create dashboard
- [ ] Test login
- [ ] Test order display
- **Time: 3 hours**

## SATURDAY (Day 6)
**Goal: Security & environment**
- [ ] Create `.env.local`
- [ ] Change admin password
- [ ] Add `.env.local` to `.gitignore`
- [ ] Verify all credentials
- **Time: 3 hours**

## SUNDAY (Day 7)
**Goal: Deploy & go live**
- [ ] Run all tests
- [ ] Push to GitHub
- [ ] Verify Cloudflare deployment
- [ ] Test live website
- **Time: 2 hours**

---

# TROUBLESHOOTING

## "Products not showing on shop page"
**Causes:**
- Wrong Supabase URL/key
- Supabase down
- No products in database

**Solutions:**
1. Check browser console (F12) for errors
2. Verify Supabase URL and key are correct
3. Go to Supabase Studio and check perfumes table
4. Make sure products have `status = 'active'`

## "Payment button doesn't work"
**Causes:**
- Checkout function not added
- PayMongo API keys wrong
- Backend endpoint not responding

**Solutions:**
1. Check browser console for errors
2. Verify PayMongo API keys in Wrangler
3. Check Cloudflare Worker logs: `wrangler tail`
4. Verify checkout endpoint URL is correct

## "Orders not appearing in admin"
**Causes:**
- Webhook not receiving events
- Supabase Service Key wrong
- Order function broken

**Solutions:**
1. Check PayMongo webhook configuration
2. Verify webhook URL is correct
3. Check Cloudflare Worker logs: `wrangler tail`
4. Verify Supabase Service Key in Wrangler

## "Emails not sending"
**Causes:**
- Resend API key wrong
- Email function throwing error
- Webhook not running

**Solutions:**
1. Check Resend API key in Wrangler
2. Check Cloudflare Worker logs for errors
3. Go to Resend dashboard → Emails tab
4. Verify sender email is correct

## "Can't login to admin"
**Causes:**
- Wrong password
- Browser cache issue
- localStorage issue

**Solutions:**
1. Verify password is correct (check dashboard.html)
2. Clear browser cache: Ctrl+Shift+Delete
3. Clear localStorage: `localStorage.clear()` in console
4. Reload page

---

# COST BREAKDOWN

## One-Time Setup Cost
- Supabase: ₱0 (free account)
- PayMongo: ₱0 (free account)
- Resend: ₱0 (free account)
- Cloudflare: ₱0 (free tier)
- GitHub: ₱0 (free public repo)
- **Total: ₱0**

**Your developer cost: 20 hours of your time (or hire developer for ₱5,000-20,000)**

## Monthly Operating Cost

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | ₱0 | Free tier covers all small business needs |
| PayMongo | ₱200-500 | 1.49% + ₱2.50 per transaction (at 10-50 orders) |
| Resend | ₱0 | FREE for first 3,000 emails/month |
| Cloudflare | ₱0 | Free tier |
| GitHub | ₱0 | Free public repo |
| **TOTAL** | **₱200-500** | Only PayMongo transaction fees |

## When Do You Pay More?

**Resend upgrade:**
- Free: 3,000 emails/month
- Per order: ~4 emails
- Free tier covers: 750 orders/month
- Cost to upgrade: ₱1,100/month ($20)

**At 750+ orders/month:**
- You're making ₱300,000+ revenue
- Paying ₱1,100 for emails is reasonable

## Revenue Potential

```
10 orders @ ₱900 = ₱9,000 gross
- PayMongo fees (₱16): ₱8,984 you receive
- Cost of goods (₱100 × 10): ₱1,000
- Shipping cost (₱150 × 10): ₱1,500
= ₱6,484 profit on 10 orders

20 orders/month = ₱12,968 profit
50 orders/month = ₱31,700 profit
100 orders/month = ₱63,400 profit
```

---

# SECURITY

## API Keys - NEVER SHARE

Store safely:
- Supabase keys: `.env.local`
- PayMongo keys: `.env.local`
- Resend key: `.env.local`

Never:
- Commit `.env.local` to GitHub
- Put keys in frontend code
- Share with anyone
- Use same password everywhere

## Admin Password

- Change from default
- Use strong password (mix of letters, numbers, symbols)
- Store securely
- Change quarterly

## Database Security

- Supabase auto-backs up daily
- Manually export weekly: Settings → Database → Export
- Keep backups in secure location

## Website Security

- HTTPS everywhere (Cloudflare provides)
- No credit card storage (PayMongo handles)
- Customer data in Supabase (encrypted)
- Regular updates to code

---

# SUMMARY

## What You're Building

Complete e-commerce system for Davao Perfume Shop with:
- ✅ Product catalog from database
- ✅ Shopping cart
- ✅ Payment processing (PayMongo)
- ✅ Order management
- ✅ Real-time inventory
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Order tracking

## Timeline
- **Start:** Monday
- **Go Live:** Sunday
- **Duration:** 7 days
- **Your Time:** 20 hours total

## Cost
- **Setup:** ₱0
- **Monthly:** ₱200-500
- **Revenue Potential:** ₱5,000-63,000/month

## Next Steps
1. **Today (Friday):** Review this document
2. **Weekend:** Prepare accounts (Supabase, PayMongo, Resend)
3. **Monday:** Start Phase 1
4. **Sunday:** Go LIVE! 🎉

---

**You have everything you need. Follow the guide. You'll be live by Sunday. Good luck!** 💪

