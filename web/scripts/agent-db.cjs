
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../db-output.txt');

function log(msg) {
    fs.appendFileSync(logPath, msg + '\n');
}

// Manually load .dev.vars
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.dev.vars');
        if (!fs.existsSync(envPath)) return {};
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        });
        return env;
    } catch (e) {
        log("Env Load Error: " + e.message);
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log("Error: Missing credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

async function main() {
    log("Started execution at " + new Date().toISOString());
    const args = process.argv.slice(2);
    const command = args[0];
    const table = args[1];

    try {
        if (command === 'select') {
            const { data, error } = await supabase.from(table).select('*');
            if (error) throw error;
            log(JSON.stringify(data, null, 2));
        } else if (command === 'insert') {
            const payload = JSON.parse(args[2]);
            const { data, error } = await supabase.from(table).insert(payload).select();
            if (error) throw error;
            log("Inserted: " + JSON.stringify(data));
        } else {
            log("Unknown command: " + command);
        }
    } catch (e) {
        log("Error: " + e.message);
    }
}

main();
