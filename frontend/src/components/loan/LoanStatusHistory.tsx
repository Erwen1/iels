import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Typography, Paper, Box } from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { LoanStatusHistory, LoanStatus } from '../../types/equipment';

interface LoanStatusHistoryProps {
  history: LoanStatusHistory[];
}

const getStatusColor = (status: LoanStatus): string => {
  switch (status) {
    case 'EN_ATTENTE':
      return '#ed6c02'; // warning
    case 'APPROUVE':
      return '#1976d2'; // primary
    case 'EMPRUNTE':
      return '#2e7d32'; // success
    case 'RETOURNE':
      return '#757575'; // default
    case 'REFUSE':
      return '#d32f2f'; // error
    default:
      return '#757575';
  }
};

const getStatusLabel = (status: LoanStatus): string => {
  switch (status) {
    case 'EN_ATTENTE':
      return 'En attente';
    case 'APPROUVE':
      return 'Approuvé';
    case 'EMPRUNTE':
      return 'Emprunté';
    case 'RETOURNE':
      return 'Retourné';
    case 'REFUSE':
      return 'Refusé';
    default:
      return status;
  }
};

export function LoanStatusHistory({ history }: LoanStatusHistoryProps) {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Timeline>
      {sortedHistory.map((entry, index) => (
        <TimelineItem key={entry.id}>
          <TimelineOppositeContent>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', {
                locale: fr,
              })}
            </Typography>
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                bgcolor: getStatusColor(entry.new_status),
              }}
            />
            {index < sortedHistory.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" component="h3">
                {getStatusLabel(entry.new_status)}
              </Typography>
              {entry.previous_status && (
                <Typography variant="body2" color="text.secondary">
                  Ancien statut : {getStatusLabel(entry.previous_status)}
                </Typography>
              )}
              <Typography>{entry.comment}</Typography>
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  Par : {entry.changed_by}
                </Typography>
              </Box>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
} 