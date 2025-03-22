import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for common issues with the API key
const debugSupabaseKey = () => {
  if (!supabaseAnonKey) {
    console.error('ERROR: Supabase API key is missing!');
    return false;
  }

  // Check if the key has the correct format (eyJ... structure for JWT)
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error('ERROR: Supabase API key has invalid format, should start with "eyJ"');
    return false;
  }

  // Check if the key contains any whitespace or newlines
  if (supabaseAnonKey.includes(' ') || supabaseAnonKey.includes('\n')) {
    console.error('ERROR: Supabase API key contains whitespace or newlines');
    return false;
  }

  // Check if the key has multiple periods (typical JWT format)
  const periodCount = (supabaseAnonKey.match(/\./g) || []).length;
  if (periodCount !== 2) {
    console.error(`ERROR: Supabase API key should have exactly 2 periods, found ${periodCount}`);
    return false;
  }

  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 10 chars):', supabaseAnonKey?.substring(0, 10) + '...');
  console.log('Supabase Key (last 10 chars):', '...' + supabaseAnonKey?.substring(supabaseAnonKey.length - 10));
  console.log('Supabase Key length:', supabaseAnonKey?.length);
  
  return true;
};

// Run the debug check
const keyIsValid = debugSupabaseKey();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 