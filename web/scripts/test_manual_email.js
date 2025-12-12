
import fs from 'fs';
import path from 'path';

// Load .dev.vars manually for API Key
function loadDevVars() {
    try {
        const content = fs.readFileSync(path.resolve(process.cwd(), '.dev.vars'), 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });
        return env;
    } catch (e) {
        console.error("Could not read .dev.vars");
        return {};
    }
}

async function testManualEmail() {
    console.log("--- Testing Manual Email Sending API ---");
    const env = loadDevVars();
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
        console.error("❌ Missing RESEND_API_KEY");
        return;
    }

    // Simulate the Worker Request logic locally using fetch to Resend directly 
    // (Since we can't easily spin up the specific worker function locally without wrangler dev running)
    // IMPORTANT: This duplicates the logic in send-email.js to verify the KEY and payload format work.

    console.log("Simulating API call with payload...");
    const payload = {
        email: 'delivered@resend.dev',
        name: 'Test Customer',
        orderId: 'TEST-ORDER-123',
        type: 'shipping_confirmation'
    };

    const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Good news!</h1>
            <p>Hi ${payload.name},</p>
            <p>Your order <strong>${payload.orderId}</strong> has been shipped and is on its way.</p>
        </div>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: payload.email,
                subject: `Your Order ${payload.orderId} has Shipped!`,
                html: htmlContent
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Success! Email sent via Resend.");
            console.log("   ID:", data.id);
        } else {
            console.error("❌ Failed:", await response.text());
        }

    } catch (e) {
        console.error("❌ Exception:", e.message);
    }
}

testManualEmail();
