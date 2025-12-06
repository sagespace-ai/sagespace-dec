#!/usr/bin/env node

/**
 * Sentry Setup Helper Script
 * 
 * This script helps automate Sentry project creation and DSN configuration.
 * Run: node scripts/setup-sentry.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSentry() {
  console.log('\n🚀 SageSpace Sentry Setup Helper\n');
  console.log('This script will help you configure Sentry for SageSpace.\n');
  console.log('Prerequisites:');
  console.log('1. Sentry account (sign up at https://sentry.io)');
  console.log('2. Sentry organization created');
  console.log('3. API token with project:write permissions\n');

  const proceed = await question('Have you created your Sentry account? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes') {
    console.log('\n📝 Please create a Sentry account first:');
    console.log('   https://sentry.io/signup/');
    console.log('\nThen run this script again.\n');
    rl.close();
    return;
  }

  console.log('\n📋 Step 1: Create Sentry Projects');
  console.log('Go to: https://sentry.io/organizations/YOUR_ORG/projects/new/');
  console.log('\nCreate two projects:');
  console.log('1. Frontend Project:');
  console.log('   - Platform: React');
  console.log('   - Name: SageSpace Frontend');
  console.log('   - Copy the DSN');
  console.log('\n2. Backend Project:');
  console.log('   - Platform: Next.js');
  console.log('   - Name: SageSpace Backend');
  console.log('   - Copy the DSN\n');

  const frontendDSN = await question('Enter Frontend DSN (or press Enter to skip): ');
  const backendDSN = await question('Enter Backend DSN (or press Enter to skip): ');

  if (frontendDSN || backendDSN) {
    console.log('\n📝 Creating .env files...\n');

    // Frontend .env
    if (frontendDSN) {
      const frontendEnv = `# Sentry Configuration (Frontend)
VITE_SENTRY_DSN=${frontendDSN}
`;
      const frontendPath = path.join(process.cwd(), '.env.local');
      const existingFrontend = fs.existsSync(frontendPath) 
        ? fs.readFileSync(frontendPath, 'utf8') 
        : '';
      
      if (!existingFrontend.includes('VITE_SENTRY_DSN')) {
        fs.appendFileSync(frontendPath, frontendEnv);
        console.log('✅ Added VITE_SENTRY_DSN to .env.local');
      } else {
        console.log('⚠️  VITE_SENTRY_DSN already exists in .env.local');
      }
    }

    // Backend .env
    if (backendDSN) {
      const backendEnv = `# Sentry Configuration (Backend)
SENTRY_DSN=${backendDSN}
`;
      const backendPath = path.join(process.cwd(), 'api', '.env.local');
      const backendDir = path.dirname(backendPath);
      
      if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
      }
      
      const existingBackend = fs.existsSync(backendPath) 
        ? fs.readFileSync(backendPath, 'utf8') 
        : '';
      
      if (!existingBackend.includes('SENTRY_DSN')) {
        fs.appendFileSync(backendPath, backendEnv);
        console.log('✅ Added SENTRY_DSN to api/.env.local');
      } else {
        console.log('⚠️  SENTRY_DSN already exists in api/.env.local');
      }
    }

    console.log('\n✅ Sentry configuration complete!');
    console.log('\n📚 Next steps:');
    console.log('1. Review SENTRY_SETUP.md for alert configuration');
    console.log('2. Test error tracking by triggering a test error');
    console.log('3. Set up alerting rules in Sentry dashboard');
    console.log('4. Configure release tracking in CI/CD\n');
  } else {
    console.log('\n⚠️  No DSNs provided. You can configure them manually:');
    console.log('   - Frontend: Add VITE_SENTRY_DSN to .env.local');
    console.log('   - Backend: Add SENTRY_DSN to api/.env.local');
    console.log('\nSee SENTRY_SETUP.md for detailed instructions.\n');
  }

  rl.close();
}

setupSentry().catch(console.error);
