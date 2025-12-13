import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing to avoid dependency
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const parseEnv = (content) => {
    return content.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            acc[key.trim()] = value.trim();
        }
        return acc;
    }, {});
};

const env = parseEnv(envContent);
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestOrder() {
    console.log("Inserting test order...");

    // Adapted to minimum valid schema based on previous errors:
    // - No 'items' column
    // - No 'shipping_address' column
    // Fetch a valid perfume ID first
    const { data: perfumes } = await supabase.from('perfumes').select('id').limit(1);
    const validPerfumeId = perfumes && perfumes.length > 0 ? perfumes[0].id : null;

    if (!validPerfumeId) {
        console.error("No perfumes found to link to order.");
        return;
    }

    const testOrder = {
        order_number: `TEST-${Math.floor(Math.random() * 10000)}`,
        customer_name: "Jean-Baptiste Grenouille",
        customer_email: "nose@grasse.fr",
        customer_phone: "09171234567",
        perfume_id: validPerfumeId, // Linking to a real product
        quantity_ordered: 1,
        unit_price: 1200,
        subtotal: 1200,
        total_price: 1200,
        order_status: "pending",
        notes: "Ship to: 35 Rue de la Parfumerie, Grasse. Items: 1x Minokawa, 2x Santelmo."
    };

    const { data, error } = await supabase
        .from('orders')
        .insert([testOrder])
        .select();

    if (error) {
        console.error("Error inserting order:", error);
    } else {
        console.log("Success! Inserted order:", data[0].order_number);
    }
}

insertTestOrder();
