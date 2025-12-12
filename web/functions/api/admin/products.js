
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
    const { request, env } = context;

    // 1. Auth Check
    const cookieHeader = request.headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);

    if (cookies['admin_session'] !== 'valid') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 2. Setup Supabase
    const supabaseUrl = env.SUPABASE_URL; // Should be set in Cloudflare
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY; // MUST be the service role key for admin ops

    if (!supabaseUrl || !supabaseKey) {
        return new Response(JSON.stringify({ error: 'Server misconfiguration: Supabase credentials missing' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Routing
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/admin/products', '');

    try {
        if (request.method === 'GET') {
            // List products (can be public, but we are here now)
            // Maybe we want admin-specific view? default to public read is usually fine but let's just proxy.
            const { data, error } = await supabase.from('perfumes').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
        }

        else if (request.method === 'POST') {
            // Create or Update or Action
            const body = await request.json();
            const { action, payload } = body;

            if (action === 'sync') {
                const { products } = payload;
                // Delete all (except protective ID if needed)
                const { error: delErr } = await supabase.from('perfumes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                if (delErr) throw delErr;

                // Insert
                const { data, error } = await supabase.from('perfumes').insert(products).select();
                if (error) throw error;

                return new Response(JSON.stringify({ success: true, count: data.length }), { headers: { 'Content-Type': 'application/json' } });
            }

            if (action === 'create') {
                const { data, error } = await supabase.from('perfumes').insert([payload]).select();
                if (error) throw error;
                return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
            }

            if (action === 'update') {
                const { id, ...updates } = payload;
                const { data, error } = await supabase.from('perfumes').update(updates).eq('id', id).select();
                if (error) throw error;
                return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
            }

            if (action === 'delete') {
                const { ids } = payload;
                // Support single or bulk
                const list = Array.isArray(ids) ? ids : [ids];
                const { error } = await supabase.from('perfumes').delete().in('id', list);
                if (error) throw error;
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
            }

            if (action === 'update_status') {
                const { ids, status } = payload;
                const { error } = await supabase.from('perfumes').update({ status }).in('id', ids);
                if (error) throw error;
                return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function parseCookies(header) {
    const list = {};
    if (!header) return list;
    header.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name?.trim();
        if (!name) return;
        const value = rest.join('=').trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}
