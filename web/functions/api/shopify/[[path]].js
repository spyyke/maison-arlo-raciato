
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS for local development if needed, but usually Pages handles origin
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const SHOPIFY_STORE = env.SHOPIFY_STORE_URL || env.VITE_SHOPIFY_DOMAIN;
  const SHOPIFY_STOREFRONT_API_KEY = env.SHOPIFY_STOREFRONT_API_KEY || env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const SHOPIFY_API_VERSION = env.SHOPIFY_API_VERSION || "2024-10";

  if (!SHOPIFY_STORE || !SHOPIFY_STOREFRONT_API_KEY) {
    return new Response("Missing Shopify configuration", { status: 500 });
  }

  const shopifyUrl = `https://${SHOPIFY_STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const shopifyRequest = new Request(shopifyUrl, {
      method: "POST", // GraphQL is always POST
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_API_KEY,
      },
      body: request.body,
    });

    const response = await fetch(shopifyRequest);
    
    // Pass through the response
    return response;

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
