/*
Supabase client and server exports.
Explicitly exports to avoid naming conflicts between client and server createClient functions.
*/

// Export client-side functions
export { createClient as createBrowserClient } from './client';

// Export server-side functions
export { createClient as createServerClient } from './server';

// Export database types
export * from './database.types';
