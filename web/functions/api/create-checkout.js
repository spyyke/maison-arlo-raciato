export async function onRequest(context) {
    const { request } = context;

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const { customer_email, customer_name, items, total_price, delivery_type, shipping_fee } = body;

        const PAYMONGO_SECRET_KEY = context.env.PAYMONGO_SECRET_KEY;

        if (!PAYMONGO_SECRET_KEY) {
            throw new Error('PAYMONGO_SECRET_KEY is not configured');
        }

        // Format items for PayMongo
        // PayMongo line items: name, amount (cents), quantity, currency
        const line_items = items.map(item => ({
            name: item.title || item.name,
            amount: Math.round(parseFloat(item.price) * 100), // Convert to centavos
            quantity: item.quantity,
            currency: 'PHP',
            images: item.image ? [item.image] : []
        }));

        // If there is a shipping fee, add it as a line item
        if (shipping_fee && shipping_fee > 0) {
            line_items.push({
                name: 'Shipping Fee',
                amount: Math.round(shipping_fee * 100),
                quantity: 1,
                currency: 'PHP'
            });
        }

        // Create checkout session
        const checkoutPayload = {
            data: {
                attributes: {
                    send_email_receipt: true,
                    show_description: true,
                    show_line_items: true,
                    line_items: line_items,
                    payment_method_types: ['gcash', 'card', 'paymaya'],
                    currency: 'PHP',
                    customer: {
                        email: customer_email,
                        name: customer_name
                    },
                    description: `Order for ${customer_name}`,
                    reference_number: `REF-${Date.now()}`,
                    metadata: {
                        customer_email: customer_email,
                        delivery_type: delivery_type,
                        shipping_fee: shipping_fee
                    },
                    success_url: `${new URL(request.url).origin}/success`,
                    cancel_url: `${new URL(request.url).origin}/cart`
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

        const responseText = await response.text();

        if (!response.ok) {
            console.error('PayMongo API Error:', responseText);
            throw new Error(`PayMongo API error: ${response.status} ${response.statusText}`);
        }

        const checkoutData = JSON.parse(responseText);

        return new Response(JSON.stringify({
            success: true,
            checkout_url: checkoutData.data.attributes.checkout_url,
            session_id: checkoutData.data.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Checkout error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500, headers: corsHeaders });
    }
}
