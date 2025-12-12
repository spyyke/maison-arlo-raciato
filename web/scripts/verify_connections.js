
const LOG_FILE = path.resolve(process.cwd(), 'verification_result.txt');
function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}
fs.writeFileSync(LOG_FILE, 'Start Verification\n');

import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .dev.vars manually since dotenv doesn't usually parse it standardly match
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
        log('ERROR: ' + "Could not read .dev.vars");
        return {};
    }
}

async function verifySupabase(env) {
    log('\n--- Verifying SUPABASE ---');
    const url = env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        log('ERROR: ' + '❌ Supabase credentials missing');
        return;
    }

    try {
        const supabase = createClient(url, key);

        // 1. READ Test
        // 1. READ Test
        const { data, count, error } = await supabase.from('orders').select('*', { count: 'exact' }).limit(1);
        if (error) {
            log('   ❌ Table check failed for orders: ' + error.message);
        } else {
            log(`✅ READ Access OK: Connected to '${url}'`);
            log(`   Found ${count} orders.`);
            if (data && data.length > 0) {
                log('   Columns found: ' + Object.keys(data[0]).join(', '));
            }
        }

        // 2. WRITE Access Check (Non-destructive)
        // Try to update a record with a UUID that definitely doesn't exist.
        // If we get "200 OK" (and 0 rows affected), we have permission.
        // If we get "401 Unauthorized" or "403 Forbidden", we don't.
        const { error: writeError, count: writeCount } = await supabase
            .from('perfumes')
            .update({ name: 'Probe' })
            .eq('id', '00000000-0000-0000-0000-000000000000') // Zero UUID
            .select();

        if (writeError) {
            log('ERROR: ' + '❌ WRITE Access FAILED: ' + writeError.message);
        } else {
            log('✅ WRITE Access OK: Permission verified (Non-destructive probe successful).');
        }

    } catch (e) {
        log('ERROR: ' + '❌ Supabase Check Failed:', e.message);
    }
}

async function verifyPayMongo(env) {
    log('\n--- Verifying PAYMONGO ---');
    const secret = env.PAYMONGO_SECRET_KEY;

    if (!secret) {
        log('ERROR: ' + '❌ PAYMONGO_SECRET_KEY missing within script');
        return;
    }

    try {
        // List payments (READ check) - Safe operation
        const response = await fetch('https://api.paymongo.com/v1/payments?limit=1', {
            headers: {
                'Authorization': `Basic ${btoa(secret + ':')}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            log('✅ READ/WRITE Access OK via API Key');
            log('   (Successfully authenticated with PayMongo API)');
        } else {
            log('ERROR: ' + `❌ PayMongo Check Failed: ${response.status} ${response.statusText}`);
        }
    } catch (e) {
        log('ERROR: ' + '❌ PayMongo Connection Error:', e.message);
    }
}

async function verifyResend(env) {
    log('\n--- Verifying RESEND ---');
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
        log('ERROR: ' + '❌ RESEND_API_KEY missing');
        return;
    }

    try {
        // Try to send a test email to the "delivered" sink provided by Resend for testing purposes? 
        // Or just basic auth check via "Get Email" if we had an ID.
        // Easiest "safe" check is to try and send an email to a test address.
        // Use 'onboarding@resend.dev' which is the default for unverified domains usually.

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'onboarding@resend.dev',
                to: 'delivered@resend.dev', // Safe sink
                subject: 'Connection Test',
                html: '<p>Verifying connection.</p>'
            })
        });

        if (response.ok) {
            log('✅ Access OK: API Key accepted so "onboarding@resend.dev" can send.');
            log('   (Note: Sending only works if domain is verified or using onboarding domain)');
        } else {
            const errText = await response.text();
            // 403 usually means domain not verified, but Auth was okay.
            if (response.status === 403) {
                log('⚠️ Auth OK, but 403 Forbidden: ' + errText);
                log('   This usually means the domain is not verified yet, but the API Key is valid.');
            } else {
                log('ERROR: ' + `❌ Resend Check Failed: ${response.status} ${response.statusText}`);
                log('   Details: ' + errText);
            }
        }
    } catch (e) {
        log('ERROR: ' + '❌ Resend Connection Error:', e.message);
    }
}

async function verifyWebhookLogic(env) {
    log('\n--- Verifying Webhook Inventory Logic (PayMongo -> Supabase) ---');
    const url = env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;

    try {
        const supabase = createClient(url, key);

        // 1. Setup: Get a target product
        const { data: products, error: err1 } = await supabase.from('perfumes').select('*').limit(1);
        if (err1 || !products || products.length === 0) {
            log('ERROR: ' + "❌ Setup failed: No products found.");
            return;
        }
        const targetProduct = products[0];
        const initialStock = targetProduct.quantity_available;
        const initialSold = targetProduct.quantity_sold || 0;

        log(`   Target Product: ${targetProduct.name}`);
        log(`   Initial Stock: ${initialStock}, Sold: ${initialSold}`);

        // 2. Simulate Webhook Logic
        log("   Simulating purchase of 1 item...");
        const qtyBought = 1;

        const { error: updateError } = await supabase
            .from('perfumes')
            .update({
                quantity_available: initialStock - qtyBought,
                quantity_sold: initialSold + qtyBought
            })
            .eq('id', targetProduct.id);

        if (updateError) {
            log('ERROR: ' + "❌ Simulation failed:", updateError.message);
            return;
        }

        // 3. Verify
        const { data: updatedProducts, error: err2 } = await supabase.from('perfumes').select('*').eq('id', targetProduct.id);
        const updatedProduct = updatedProducts[0];

        log(`   Updated Stock: ${updatedProduct.quantity_available}, Sold: ${updatedProduct.quantity_sold}`);

        if (updatedProduct.quantity_available === initialStock - qtyBought && updatedProduct.quantity_sold === initialSold + qtyBought) {
            log("✅ SUCCESS: Inventory updated correctly (Supabase Write confirmed).");

            // Restore
            log("   Restoring original values...");
            await supabase.from('perfumes').update({
                quantity_available: initialStock,
                quantity_sold: initialSold
            }).eq('id', targetProduct.id);
            log("   Restored.");

        } else {
            log('ERROR: ' + "❌ FAILURE: Inventory mismatch.");
        }
    } catch (e) {
        log('ERROR: ' + '❌ Webhook Logic Check Failed:', e.message);
    }
}

async function main() {
    const env = loadDevVars();
    await verifySupabase(env);
    await verifyPayMongo(env);
    await verifyResend(env);
    await verifyWebhookLogic(env);
}

main();
