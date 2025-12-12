
import fs from 'fs';
import path from 'path';

const checkFile = (filename) => {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${filename} not found`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasUrl = content.includes('VITE_SUPABASE_URL');
    const hasKey = content.includes('VITE_SUPABASE_ANON_KEY');

    console.log(`--- Checking ${filename} ---`);
    console.log('VITE_SUPABASE_URL:', hasUrl ? '✅ Present' : '❌ Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', hasKey ? '✅ Present' : '❌ Missing');
};

console.log('--- Static File Content Check ---');
checkFile('.env');
checkFile('.dev.vars');
