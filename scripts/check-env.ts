/*
Check environment variables and help debug configuration issues.
*/

import { config } from 'dotenv';
import path from 'path';

// Try to load .env.local
const envPath = path.join(process.cwd(), '.env.local');
console.log('🔍 Looking for environment file at:', envPath);

try {
  config({ path: envPath });
  console.log('✅ .env.local file loaded successfully');
} catch (error) {
  console.log('❌ Could not load .env.local file');
}

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('================================');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

let missingVars = 0;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    missingVars++;
  }
});

console.log('\n📊 Summary:');
if (missingVars === 0) {
  console.log('🎉 All environment variables are set!');
} else {
  console.log(`⚠️  ${missingVars} environment variable(s) are missing`);
  console.log('\n📝 To fix this:');
  console.log('1. Create a .env.local file in your project root');
  console.log('2. Add the missing variables:');
  console.log('');
  console.log('# Supabase Configuration');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  console.log('');
  console.log('# Clerk Authentication');
  console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key');
  console.log('CLERK_SECRET_KEY=your_clerk_secret_key');
  console.log('');
  console.log('# Database URL (optional)');
  console.log('DATABASE_URL=your_supabase_database_url');
}

// Check if .env.local file exists
import fs from 'fs';
if (fs.existsSync(envPath)) {
  console.log('\n📄 .env.local file exists');
  const stats = fs.statSync(envPath);
  console.log(`   Size: ${stats.size} bytes`);
  console.log(`   Modified: ${stats.mtime}`);
} else {
  console.log('\n📄 .env.local file does not exist');
  console.log('   Creating a template file...');
  
  const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database URL (optional)
DATABASE_URL=your_supabase_database_url
`;

  try {
    fs.writeFileSync(envPath, template);
    console.log('✅ Created .env.local template file');
    console.log('   Please edit it with your actual values');
  } catch (error) {
    console.log('❌ Could not create .env.local file:', error);
  }
} 