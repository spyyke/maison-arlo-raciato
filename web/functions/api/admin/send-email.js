export async function onRequest(context) {
    const { request, env } = context;

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
        const payload = await request.json();
        const { email, name, orderId, type } = payload;
        const apiKey = env.RESEND_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!email) {
            return new Response(JSON.stringify({ error: 'Missing email address' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`Sending email to ${email} for order ${orderId} (${type})`);

        // Construct email content based on type
        // Use onboarding@resend.dev for testing if domain not verified
        const fromEmail = 'onboarding@resend.dev';
        // const fromEmail = 'Maison Arlo Raciàto <orders@maisonarloraciato.com>'; // Use this when verified

        let subject = `Update on Order ${orderId}`;
        let htmlContent = `<p>Hi ${name || 'Customer'},</p><p>Here is an update on your order ${orderId}.</p>`;

        if (type === 'shipping_confirmation') {
            subject = `Your Order ${orderId} has Shipped!`;
            htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Good news!</h1>
                    <p>Hi ${name || 'Customer'},</p>
                    <p>Your order <strong>${orderId}</strong> has been shipped and is on its way.</p>
                    <p>You should receive it within 3-5 business days.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;">Maison Arlo Raciàto</p>
                </div>
            `;
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromEmail,
                to: email, // Note: In test mode (unverified domain), this MUST be your verified email (spyke...) or delivered@resend.dev
                subject: subject,
                html: htmlContent
            })
        });

        if (response.ok) {
            const data = await response.json();
            return new Response(JSON.stringify({ success: true, id: data.id }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            const errorText = await response.text();
            console.error('Resend API Error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to send email via Resend provider', details: errorText }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('Send Email Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
