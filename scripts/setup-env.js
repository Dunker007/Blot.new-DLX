#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * Validates and helps set up environment variables for DLX Studios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const REQUIRED_VARS = [
  {
    name: 'VITE_SUPABASE_URL',
    description: 'Your Supabase project URL',
    example: 'https://your-project.supabase.co',
    validate: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    description: 'Your Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    validate: (value) => value.length > 100,
  },
];

const OPTIONAL_VARS = [
  {
    name: 'VITE_ANALYTICS_ID',
    description: 'Analytics tracking ID (optional)',
    example: 'G-XXXXXXXXXX',
  },
  {
    name: 'VITE_SENTRY_DSN',
    description: 'Sentry DSN for error tracking (optional)',
    example: 'https://xxx@xxx.ingest.sentry.io/xxx',
  },
];

async function checkExistingEnv() {
  const envPath = path.join(rootDir, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });
    
    let allValid = true;
    
    for (const varDef of REQUIRED_VARS) {
      const value = envVars[varDef.name];
      
      if (!value) {
        console.log(`❌ Missing required variable: ${varDef.name}`);
        allValid = false;
      } else if (varDef.validate && !varDef.validate(value)) {
        console.log(`⚠️  Invalid value for ${varDef.name}`);
        allValid = false;
      } else {
        console.log(`✅ ${varDef.name} is set`);
      }
    }
    
    return { exists: true, valid: allValid, vars: envVars };
  }
  
  return { exists: false, valid: false, vars: {} };
}

async function createEnvFile() {
  console.log('\n📝 Creating .env file...\n');
  
  const envVars = {};
  
  // Collect required variables
  for (const varDef of REQUIRED_VARS) {
    console.log(`\n${varDef.description}`);
    console.log(`Example: ${varDef.example}`);
    
    let value = '';
    let isValid = false;
    
    while (!isValid) {
      value = await question(`Enter ${varDef.name}: `);
      
      if (!value) {
        console.log('❌ This field is required');
        continue;
      }
      
      if (varDef.validate && !varDef.validate(value)) {
        console.log('❌ Invalid value format');
        continue;
      }
      
      isValid = true;
    }
    
    envVars[varDef.name] = value;
  }
  
  // Collect optional variables
  console.log('\n\n📋 Optional Configuration\n');
  const includeOptional = await question('Would you like to configure optional features? (y/N): ');
  
  if (includeOptional.toLowerCase() === 'y') {
    for (const varDef of OPTIONAL_VARS) {
      console.log(`\n${varDef.description}`);
      console.log(`Example: ${varDef.example}`);
      
      const value = await question(`Enter ${varDef.name} (press Enter to skip): `);
      
      if (value) {
        envVars[varDef.name] = value;
      }
    }
  }
  
  // Write .env file
  const envPath = path.join(rootDir, '.env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent + '\n');
  
  console.log('\n✅ .env file created successfully!');
  console.log(`📁 Location: ${envPath}\n`);
}

async function validateSupabaseConnection(url, key) {
  console.log('\n🔍 Validating Supabase connection...');
  
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
    });
    
    if (response.ok || response.status === 404) {
      console.log('✅ Supabase connection successful!');
      return true;
    } else {
      console.log('❌ Supabase connection failed');
      console.log(`Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to Supabase');
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 DLX Studios - Environment Setup\n');
  console.log('This script will help you configure your environment variables.\n');
  
  const envStatus = await checkExistingEnv();
  
  if (envStatus.exists && envStatus.valid) {
    console.log('\n✅ Your environment is properly configured!');
    
    const testConnection = await question('\nWould you like to test the Supabase connection? (y/N): ');
    
    if (testConnection.toLowerCase() === 'y') {
      await validateSupabaseConnection(
        envStatus.vars.VITE_SUPABASE_URL,
        envStatus.vars.VITE_SUPABASE_ANON_KEY
      );
    }
  } else if (envStatus.exists && !envStatus.valid) {
    console.log('\n⚠️  Your .env file has issues.');
    const recreate = await question('Would you like to recreate it? (y/N): ');
    
    if (recreate.toLowerCase() === 'y') {
      await createEnvFile();
    }
  } else {
    const create = await question('No .env file found. Would you like to create one? (Y/n): ');
    
    if (create.toLowerCase() !== 'n') {
      await createEnvFile();
      
      // Test connection after creation
      const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf-8');
      const envVars = {};
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          envVars[match[1].trim()] = match[2].trim();
        }
      });
      
      await validateSupabaseConnection(
        envVars.VITE_SUPABASE_URL,
        envVars.VITE_SUPABASE_ANON_KEY
      );
    }
  }
  
  console.log('\n📚 Next Steps:');
  console.log('1. Run `npm install` to install dependencies');
  console.log('2. Run `npm run dev` to start the development server');
  console.log('3. Visit http://localhost:5173 to see your app\n');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});

