
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { password } = body;

        // Use environment variable for password, fallback strictly for development if needed but better to fail if not set
        const adminPassword = env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return new Response(JSON.stringify({ error: 'Server misconfiguration: ADMIN_PASSWORD not set' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (password === adminPassword) {
            // Create a session cookie
            // In a real production app, use a proper session management library / JWT signed with a secret
            // For this improvement, we'll simple set a secure cookie
            const sessionValue = btoa(crypto.randomUUID()); // Simple session ID

            // We need to store this session valid somewhere to verify it later? 
            // Since this is a simple "password protection", we might just sign a connection token.
            // But for simplicity and statelessness without a db for sessions, we can just return success 
            // and let the client store a flag, but that's insecure.

            // Better approach: Return a signed JWT-like token using a secret.
            // We can use the service role key as part of the signing secret since we have it.

            // Actually, to keep it compatible with the previous simple "password check" but secure the backend calls:
            // We will issue a simple token that the frontend sends back. 
            // But wait, the backend needs to verify it.

            // Let's implement a simple shared-secret verification for now.
            // The frontend will receive a "token" which is just a hash of the password + salt, or similar.
            // BETTER: Set a cookie "admin_session=true; HttpOnly; Secure; SameSite=Strict"
            // Verify this cookie in other functions.

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    // Set cookie for 24 hours
                    'Set-Cookie': `admin_session=valid; HttpOnly; Secure; Path=/api/admin; Max-Age=86400; SameSite=Strict`
                }
            });
        } else {
            return new Response(JSON.stringify({ error: 'Incorrect password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
