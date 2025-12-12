
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// inventory.json is in ../src/data/inventory.json relative to scripts/
const inventoryPath = path.join(__dirname, '../src/data/inventory.json');

console.log('Loading inventory from:', inventoryPath);

const rawData = fs.readFileSync(inventoryPath, 'utf-8');
const inventory = JSON.parse(rawData);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
    console.log(`Starting seed for ${inventory.length} products...`);

    const productsToInsert = inventory.map(p => ({
        name: p.title,
        description: p.description,
        price: parseFloat(p.price.amount),
        quantity_available: 100,
        image_url: p.images[0]?.url,
        scent_profile: p.scent_notes.join(', '),
        status: 'active'
    }));

    // Clear existing
    const { error: deleteError } = await supabase
        .from('perfumes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
        console.error('Error clearing table:', deleteError);
    } else {
        console.log('Cleared existing products.');
    }

    // Insert new
    const { data, error } = await supabase
        .from('perfumes')
        .insert(productsToInsert)
        .select();

    if (error) {
        console.error('Error inserting products:', error);
    } else {
        console.log(`Successfully inserted ${data.length} products.`);
    }
}

seed();
