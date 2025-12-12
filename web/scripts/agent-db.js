
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(msg) {
    fs.appendFileSync(path.join(__dirname, '../db-output.txt'), msg + '\n');
}

// 1. Load Environment Variables from .dev.vars
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.dev.vars');
        if (!fs.existsSync(envPath)) return {};

        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // start/end quotes
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        log("Failed to load .dev.vars: " + e.message);
        return {};
    }
}

const env = loadEnv();
const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.");
    process.exit(1);
}

// 2. Initialize Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

// 3. Command Handler
async function main() {
    log("Script started.");
    const args = process.argv.slice(2);
    const command = args[0];
    const table = args[1];

    try {
        if (command === 'select') {
            const { data, error } = await supabase.from(table).select('*');
            if (error) throw error;
            log(JSON.stringify(data, null, 2));
        }
        else if (command === 'insert') {
            const payload = JSON.parse(args[2]);
            const { data, error } = await supabase.from(table).insert(payload).select();
            if (error) throw error;
            log("Inserted: " + JSON.stringify(data));
        }
        else if (command === 'delete') {
            const criteria = JSON.parse(args[2]);
            let query = supabase.from(table).delete();
            for (const [key, value] of Object.entries(criteria)) {
                query = query.eq(key, value);
            }
            const { error } = await query;
            if (error) throw error;
            log("Deleted rows matching: " + JSON.stringify(criteria));
        }
        else {
            log("Unknown command: " + command);
        }
    } catch (e) {
        log("Error: " + e.message);
    }
}

main();
