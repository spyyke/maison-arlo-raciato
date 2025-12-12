#!/bin/bash
# Deploy
npx wrangler pages deploy dist --project-name maison-arlo-raciato-web

# Set Secrets
echo "Eyespyke110321" | npx wrangler pages secret put ADMIN_PASSWORD --project-name maison-arlo-raciato-web
echo "https://gzcvssmfivspxxbddjpj.supabase.co" | npx wrangler pages secret put SUPABASE_URL --project-name maison-arlo-raciato-web
echo "sb_secret_NImB7eFo0Ni4UsQ8rY3Xqg_0PqcI1Ob" | npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name maison-arlo-raciato-web
