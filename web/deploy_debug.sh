#!/bin/bash
echo "Starting build..." > deploy_log.txt
npm run build >> deploy_log.txt 2>&1
echo "Build finished." >> deploy_log.txt
echo "Deploying..." >> deploy_log.txt
npx wrangler pages deploy dist --project-name maison-arlo-raciato-web >> deploy_log.txt 2>&1
echo "Deploy finished." >> deploy_log.txt
