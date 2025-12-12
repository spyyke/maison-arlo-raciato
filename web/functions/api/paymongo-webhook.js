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

            // Metadata from checkout session
            const metadata = payload.data.attributes?.metadata || {};

            // Create order in database
            const orderNumber = `ORD-${Date.now()}`;

            const { error } = await supabase
                .from('orders')
                .insert([{
                    order_number: orderNumber,
                    customer_email: eventData.billing.email || eventData.billing.email,
                    customer_name: eventData.billing.name || eventData.billing.name,
                    customer_phone: metadata.customer_phone || '',
                    quantity_ordered: 1, // Placeholder
                    unit_price: (eventData.amount / 100),
                    subtotal: (eventData.amount / 100),
                    shipping_fee: metadata.shipping_fee || 0,
                    total_price: (eventData.amount / 100),
                    delivery_location: 'See PayMongo details',
                    delivery_type: metadata.delivery_type || 'office_pickup',
                    payment_status: 'paid',
                    order_status: 'pending',
                    paymongo_ref: payload.data.id,
                    // Store full items in notes for now
                    notes: JSON.stringify(payload.data.attributes.line_items)
                }]);

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }

            console.log('Order created:', orderNumber);

            // Send confirmation email (Phase 4)
            const RESEND_API_KEY = context.env.RESEND_API_KEY;
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
