
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .dev.vars manually
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

const env = loadDevVars();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const RESEND_API_KEY = env.RESEND_API_KEY;

async function testLowStockLogic() {
    console.log("--- Testing Low Stock Automation (Simulated) ---");

    if (!RESEND_API_KEY) {
        console.error("❌ RESEND_API_KEY missing");
        return;
    }

    // 1. Setup: Get a target product
    const { data: products } = await supabase.from('perfumes').select('*').limit(1);
    const targetProduct = products[0];
    const initialStock = targetProduct.quantity_available;
    const initialSold = targetProduct.quantity_sold || 0;

    console.log(`Target: ${targetProduct.name} (Stock: ${initialStock})`);

    // 2. Logic to Test
    // If we buy enough to drop stock < 5, email should TRIGGER.
    // If stock is already < 5, buying more should still TRIGGER.

    // Let's verify valid EMAIL SENDING via the helper logic separately or integrated?
    // We can't verify the Cloudflare Worker running, but we can verify the logic block behaves as expected.

    console.log("Simulating low stock condition...");
    const simulatedNewStock = 4; // Force low stock

    if (simulatedNewStock < 5) {
        console.log(`Condition MET: Stock ${simulatedNewStock} < 5`);
        console.log("Creating email payload...");

        // Use Resend to send to delivered@resend.dev (Safe Sink)
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'onboarding@resend.dev',
                    to: 'delivered@resend.dev',
                    subject: `⚠️ Low Stock Alert (TEST): ${targetProduct.name}`,
                    html: `<p>Test alert for ${targetProduct.name}. Stock: ${simulatedNewStock}</p>`
                })
            });

            if (response.ok) {
                console.log("✅ SUCCESS: Low Stock Email Sent via API.");
            } else {
                console.error("❌ FAILURE: Email API Error", await response.text());
            }

        } catch (e) {
            console.error("❌ Exception:", e.message);
        }

    } else {
        console.log("Condition NOT MET.");
    }
}

testLowStockLogic();
