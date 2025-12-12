
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

// Helper to create handle from name (Same as ProductService)
const createHandle = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Adapter: Supabase Row -> Frontend Product Object (Same as ProductService)
const mapSupabaseToProduct = (row) => {
    return {
        id: row.id,
        title: row.name,
        handle: createHandle(row.name),
        description: row.description,
        availableForSale: row.quantity_available > 0,
        variants: [
            {
                id: row.id,
                title: 'Default Title',
                price: {
                    amount: row.price,
                    currencyCode: 'PHP'
                },
                quantityAvailable: row.quantity_available,
                inventory_quantity: row.quantity_available
            }
        ],
        images: [
            { url: row.image_url || 'https://placehold.co/600x400?text=No+Image' }
        ],
        tags: row.scent_profile ? row.scent_profile.split(',').map(s => `Note: ${s.trim()}`) : []
    };
};

async function testFetch() {
    console.log("--- Testing Admin Dashboard Data Fetch ---");
    try {
        const { data, error } = await supabase
            .from('perfumes')
            .select('*')
            .eq('status', 'active');

        if (error) {
            console.error("❌ Error fetching from Supabase:", error.message);
        } else {
            console.log(`✅ Success! Fetched ${data.length} records.`);
            if (data.length > 0) {
                const mapped = data.map(mapSupabaseToProduct);
                console.log("Sample Mapped Product:", JSON.stringify(mapped[0], null, 2));
            }
        }
    } catch (e) {
        console.error("❌ Exception during fetch:", e);
    }
}

testFetch();
