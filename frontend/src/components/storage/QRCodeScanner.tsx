import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ open, onClose, onScan }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (open) {
      // Initialize scanner when dialog opens
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      // Start scanning
      scannerRef.current.render(
        (decodedText: string) => {
          console.log('QR Code detected:', decodedText);
          onScan(decodedText);
          onClose();
        },
        (errorMessage: string) => {
          console.error('QR Code scan error:', errorMessage);
          setError(errorMessage);
        }
      );
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error('Error clearing scanner:', error);
        }
      }
    };
  }, [open, onScan, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Scanner un code QR</Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box 
          id="qr-reader" 
          sx={{ 
            width: '100%',
            '& video': { width: '100% !important' },
            '& img': { display: 'none' }  // Hide the default image
          }} 
        />
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}; 