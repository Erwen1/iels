// Simple test script to check Supabase connection
// To use: node test-supabase.js

// You need to provide the actual values from your .env file
const SUPABASE_URL = 'https://qdjhyuiqoyxrpcfesgtn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkamh5dWlxb3l4cnBjZmVzZ3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2OTg5NjMsImV4cCI6MjAyNjI3NDk2M30.Ct66Ew4MJZ3jZE5Z3WqaxRwjq3NvO33dQBEvXvHx-Pg';

// Fetch from Supabase directly
fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  },
  body: JSON.stringify({
    email: 'test@example.com', // Replace with a test email
    password: 'password123'    // Replace with a test password
  })
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  return response.json().catch(e => ({ error: 'Failed to parse JSON' }));
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Fetch error:', error);
});

console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key (first 10 chars):', SUPABASE_KEY.substring(0, 10) + '...');
console.log('Supabase Key (last 10 chars):', '...' + SUPABASE_KEY.substring(SUPABASE_KEY.length - 10));
console.log('Supabase Key length:', SUPABASE_KEY.length); 