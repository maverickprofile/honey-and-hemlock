#!/usr/bin/env node

/**
 * Environment Setup Script for Honey & Hemlock Productions
 * 
 * This script helps set up environment variables for different environments
 */

const fs = require('fs');
const path = require('path');

const environments = {
  development: '.env.development',
  production: '.env.production',
  local: '.env.local'
};

function copyEnvFile(env) {
  const sourceFile = environments[env];
  const targetFile = '.env.local';
  
  if (!sourceFile || !fs.existsSync(sourceFile)) {
    console.error(`❌ Environment file ${sourceFile} not found!`);
    return;
  }
  
  try {
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`✅ Copied ${sourceFile} to ${targetFile}`);
    console.log(`🔧 Environment set to: ${env.toUpperCase()}`);
    
    if (env === 'development') {
      console.log('\n⚠️  REMINDER: Add your Stripe TEST keys to .env.local for development');
      console.log('   Get them from: https://dashboard.stripe.com (Test mode)');
    } else if (env === 'production') {
      console.log('\n⚠️  WARNING: Using LIVE Stripe keys - only use in production!');
    }
    
  } catch (error) {
    console.error(`❌ Error copying file: ${error.message}`);
  }
}

function showHelp() {
  console.log(`
🚀 Honey & Hemlock Environment Setup

Usage: node setup-env.js [environment]

Available environments:
  development  - Use test keys for local development
  production   - Use live keys for production deployment
  local        - Current local configuration

Examples:
  node setup-env.js development
  node setup-env.js production

Current files:
${Object.entries(environments).map(([env, file]) => 
  `  ${env.padEnd(12)} → ${file} ${fs.existsSync(file) ? '✅' : '❌'}`
).join('\n')}

Security Notes:
• Development uses TEST Stripe keys (safe for testing)
• Production uses LIVE Stripe keys (real payments)
• Never commit .env.local to version control
• Always test with development environment first
  `);
}

// Main execution
const env = process.argv[2];

if (!env || env === 'help' || env === '--help') {
  showHelp();
} else if (environments[env]) {
  copyEnvFile(env);
} else {
  console.error(`❌ Unknown environment: ${env}`);
  console.log('Available environments:', Object.keys(environments).join(', '));
  showHelp();
}