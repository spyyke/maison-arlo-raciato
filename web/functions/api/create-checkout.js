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
        const { customer_email, customer_name, customer_phone, items, delivery_type, shipping_fee } = body;

        const PAYMONGO_SECRET_KEY = context.env.PAYMONGO_SECRET_KEY;

        if (!PAYMONGO_SECRET_KEY) {
            throw new Error('PAYMONGO_SECRET_KEY is not configured');
        }

        if (!items || items.length === 0) {
            throw new Error('No items in cart');
        }

        const origin = new URL(request.url).origin;

        // Format items for PayMongo
        const line_items = items.map(item => {
            const amount = Math.round(parseFloat(item.price) * 100);
            if (isNaN(amount) || amount <= 0) {
                console.error(`Invalid price for item ${item.title}: ${item.price}`);
                return null;
            }

            // Ensure absolute URL for images
            let imageUrl = item.image;
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `${origin}${imageUrl}`;
            }

            return {
                name: item.title || item.name,
                amount: amount,
                quantity: parseInt(item.quantity) || 1,
                currency: 'PHP',
                images: imageUrl ? [imageUrl] : []
            };
        }).filter(item => item !== null); // Remove invalid items

        // If there is a shipping fee, add it as a line item
        if (shipping_fee && shipping_fee > 0) {
            line_items.push({
                name: 'Shipping Fee',
                amount: Math.round(shipping_fee * 100),
                quantity: 1,
                currency: 'PHP',
                images: []
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
                    payment_method_types: ['card', 'gcash', 'paymaya'],
                    currency: 'PHP',
                    billing: {
                        name: customer_name,
                        email: customer_email,
                        phone: customer_phone
                    },
                    description: `Order for ${customer_name}`,
                    reference_number: `REF-${Date.now()}`,
                    success_url: `${origin}/success`,
                    cancel_url: `${origin}/`
                }
            }
        };

        console.log("PayMongo Payload:", JSON.stringify(checkoutPayload, null, 2));

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
            // Parse error for better feedback
            let errorMessage = `PayMongo API error: ${response.status}`;
            try {
                const errJson = JSON.parse(responseText);
                if (errJson.errors && errJson.errors.length > 0) {
                    errorMessage = errJson.errors[0].detail || errJson.errors[0].code;
                }
            } catch (e) { /* ignore */ }

            throw new Error(errorMessage);
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
