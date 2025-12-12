
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

async function testWebhookLogic() {
    console.log("--- Testing Webhook Inventory Logic ---");

    // 1. Setup: Get a target product
    const { data: products, error: err1 } = await supabase.from('perfumes').select('*').limit(1);
    if (err1 || !products || products.length === 0) {
        console.error("❌ Setup failed: No products found.");
        return;
    }
    const targetProduct = products[0];
    const initialStock = targetProduct.quantity_available;
    const initialSold = targetProduct.quantity_sold || 0;

    console.log(`Target Product: ${targetProduct.name}`);
    console.log(`Initial Stock: ${initialStock}, Sold: ${initialSold}`);

    // 2. Simulate Webhook Logic (Duplicate of logic in paymongo-webhook.js)
    console.log("Simulating purchase of 1 item...");
    const qtyBought = 1;

    const { error: updateError } = await supabase
        .from('perfumes')
        .update({
            quantity_available: initialStock - qtyBought,
            quantity_sold: initialSold + qtyBought
        })
        .eq('id', targetProduct.id);

    if (updateError) {
        console.error("❌ Simulation failed:", updateError.message);
        return;
    }

    // 3. Verify
    const { data: updatedProducts, error: err2 } = await supabase.from('perfumes').select('*').eq('id', targetProduct.id);
    const updatedProduct = updatedProducts[0];

    console.log(`Updated Stock: ${updatedProduct.quantity_available}, Sold: ${updatedProduct.quantity_sold}`);

    if (updatedProduct.quantity_available === initialStock - qtyBought && updatedProduct.quantity_sold === initialSold + qtyBought) {
        console.log("✅ SUCCESS: Inventory updated correctly.");

        // Restore (Optional, but good for testing)
        console.log("Restoring original values...");
        await supabase.from('perfumes').update({
            quantity_available: initialStock,
            quantity_sold: initialSold
        }).eq('id', targetProduct.id);
        console.log("Restored.");

    } else {
        console.error("❌ FAILURE: Inventory mismatch.");
    }
}

testWebhookLogic();
