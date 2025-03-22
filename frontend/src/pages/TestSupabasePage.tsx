import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Box, Typography, Button, Container, Paper } from '@mui/material';

const TestSupabasePage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const testConnection = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      // Display the URL and a masked version of the key
      setTestResult(`URL: ${supabaseUrl}\nKey: ${supabaseAnonKey?.substring(0, 10)}...\n\n`);
      
      // Create a new client instance
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Test a simple query to verify connection
      const { data, error } = await supabase.from('buildings').select('count(*)').limit(1);
      
      if (error) {
        setTestResult(prev => prev + `Error: ${JSON.stringify(error, null, 2)}`);
      } else {
        setTestResult(prev => prev + `Success! Response: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setTestResult(prev => prev + `Exception: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Test Supabase Connection
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            This page tests the connection to Supabase using the environment variables.
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={testConnection}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
        </Paper>
        
        {testResult && (
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              Test Results:
            </Typography>
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '400px' }}>
              {testResult}
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default TestSupabasePage; 