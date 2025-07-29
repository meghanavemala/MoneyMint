import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

async function checkTables() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    // Test the connection and list tables
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;

    console.log('Tables in the database:');
    console.table(result);

    // Check if profiles table exists
    const profilesTableExists = result.some((row) => row.table_name === 'profiles');
    console.log('\nProfiles table exists:', profilesTableExists);

    if (profilesTableExists) {
      const profiles = await db.query.profilesTable.findMany();
      console.log('\nProfiles in the database:', profiles);
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await sql.end();
  }
}

checkTables();
