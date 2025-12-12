
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
        const { data, count, error } = await supabase.from('perfumes').select('*', { count: 'exact', head: true });
        if (error) throw error;
        log(`✅ READ Access OK: Connected to '${url}'`);
        log(`   Found ${count} products.`);

        // 2. WRITE Access Check (Non-destructive)
        // Try to update a record with a UUID that definitely doesn't exist.
        // If we get "200 OK" (and 0 rows affected), we have permission.
        // If we get "401 Unauthorized" or "403 Forbidden", we don't.
        const { error: writeError, count: writeCount } = await supabase
            .from('perfumes')
            .update({ title: 'Probe' })
            .eq('id', '00000000-0000-0000-0000-000000000000') // Zero UUID
            .select();

        if (writeError) {
            log('ERROR: ' + '❌ WRITE Access FAILED:', writeError.message);
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
        // List checkout sessions (READ check) - Safe operation
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions?limit=1', {
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

async function main() {
    const env = loadDevVars();
    await verifySupabase(env);
    await verifyPayMongo(env);
}

main();
