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

        console.log('Webhook received:', eventType);

        // Check if payment was successful
        if (eventType === 'payment.paid') {
            const SUPABASE_URL = context.env.VITE_SUPABASE_URL || context.env.SUPABASE_URL;
            const SUPABASE_SERVICE_KEY = context.env.SUPABASE_SERVICE_KEY;

            if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
                throw new Error('Missing Supabase configuration');
            }

            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            const RESEND_API_KEY = context.env.RESEND_API_KEY; // Move up for access

            // Metadata from checkout session
            const metadata = payload.data.attributes?.metadata || {};
            const lineItems = payload.data.attributes?.line_items || [];

            console.log(`Processing ${lineItems.length} items for inventory update...`);

            // 1. Update Inventory for each item
            for (const item of lineItems) {
                try {
                    // Try to match by name (assuming PayMongo item name matches Supabase product name)
                    // In a perfect world, we'd store the Supabase ID in PayMongo metadata per item.
                    const { data: products, error: searchError } = await supabase
                        .from('perfumes')
                        .select('id, quantity_available, quantity_sold')
                        .ilike('name', item.name)
                        .limit(1);

                    if (searchError || !products || products.length === 0) {
                        console.warn(`Could not find product to update: ${item.name}`);
                        continue;
                    }

                    const product = products[0];
                    const qtyBought = item.quantity || 1;

                    // Optimistic update (no check for negative stock for now to ensure sale goes through)
                    const { error: updateError } = await supabase
                        .from('perfumes')
                        .update({
                            quantity_available: product.quantity_available - qtyBought,
                            quantity_sold: (product.quantity_sold || 0) + qtyBought
                        })
                        .eq('id', product.id);

                    if (updateError) {
                        console.error(`Failed to update stock for ${item.name}:`, updateError.message);
                    } else {
                        console.log(`Updated stock for ${item.name}: -${qtyBought}`);

                        // LOW STOCK ALERT Check
                        const newStock = product.quantity_available - qtyBought;
                        if (newStock < 5 && RESEND_API_KEY) {
                            console.log(`⚠️ Low Stock Alert: ${item.name} (${newStock} left). Sending email...`);
                            await sendLowStockEmail(RESEND_API_KEY, 'delivered@resend.dev', item.name, newStock);
                            // Note: To send to actual Admin, use context.env.ADMIN_EMAIL or hardcode
                        }
                    }

                } catch (itemError) {
                    console.error(`Error processing item ${item.name}:`, itemError);
                }
            }

            // Create order in database
            const orderNumber = `ORD-${Date.now()}`;
            const totalQuantity = lineItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

            const { error } = await supabase
                .from('orders')
                .insert([{
                    order_number: orderNumber,
                    customer_email: eventData.billing.email || eventData.billing.email,
                    customer_name: eventData.billing.name || eventData.billing.name,
                    customer_phone: metadata.customer_phone || '',
                    quantity_ordered: totalQuantity,
                    unit_price: (eventData.amount / 100), // This is total amount, unit_price field name might be misleading but schema is set
                    subtotal: (eventData.amount / 100),
                    shipping_fee: metadata.shipping_fee || 0,
                    total_price: (eventData.amount / 100),
                    delivery_location: 'See PayMongo details',
                    delivery_type: metadata.delivery_type || 'office_pickup',
                    payment_status: 'paid',
                    order_status: 'pending',
                    paymongo_ref: payload.data.id,
                    // Store full items in notes for now
                    notes: JSON.stringify(lineItems)
                }]);

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }

            console.log('Order created:', orderNumber);

            // Send confirmation email (Phase 4)
            if (RESEND_API_KEY) {
                await sendConfirmationEmail(
                    RESEND_API_KEY,
                    eventData.billing.email || eventData.billing.email,
                    eventData.billing.name || eventData.billing.name,
                    orderNumber,
                    eventData.amount / 100
                );
            } else {
                console.warn('RESEND_API_KEY not found, skipping email.');
            }
        }

        // PayMongo requires 2xx response
        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
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
                from: 'Maison Arlo Raciàto <orders@maisonarloraciato.com>', // Update with verified domain or use onboarding@resend.dev for testing
                to: email, // For testing with onboarding@resend.dev, this must be YOUR verified email
                subject: `Order Confirmation - ${orderNumber}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Thank you for your order!</h1>
            <p>Hi ${name},</p>
            <p>We've received your order <strong>${orderNumber}</strong>.</p>
            <p style="font-size: 18px; font-weight: bold;">Total: PEP ${total.toFixed(2)}</p>
            <p>We'll process and ship your order within 24 hours.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">Maison Arlo Raciàto</p>
          </div>
        `
            })
        });

        if (!response.ok) {
            console.error('Resend email error:', await response.text());
        } else {
            console.log(`Email sent to ${email}`);
        }

    } catch (error) {
        console.error('Email sending error:', error);
    }
}

async function sendLowStockEmail(apiKey, adminEmail, productName, stockCount) {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: adminEmail,
                subject: `⚠️ Low Stock Alert: ${productName}`,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #c0392b;">Low Stock Warning</h2>
                    <p>The inventory for <strong>${productName}</strong> has dropped to <strong style="color: #c0392b; font-size: 1.2rem;">${stockCount}</strong> units.</p>
                    <p>Please restock soon to avoid running out.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Maison Arlo Raciàto Automation System</p>
                  </div>
                `
            })
        });

        if (!response.ok) {
            console.error('Low Stock Email error:', await response.text());
        } else {
            console.log(`Low Stock Alert sent to ${adminEmail}`);
        }
    } catch (e) {
        console.error('Failed to send low stock alert:', e);
    }
}
