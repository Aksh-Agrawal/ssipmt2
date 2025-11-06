'use client';

import { Fab, Tooltip } from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingChatButton() {
  const pathname = usePathname();
  
  // Don't show on the help page itself
  if (pathname === '/user/help') {
    return null;
  }

  return (
    <Tooltip title="AI Assistant - Ask anything!" placement="left">
      <Fab
        component={Link}
        href="/user/help"
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 70,
          height: 70,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          boxShadow: '0 8px 24px rgba(17, 153, 142, 0.4)',
          zIndex: 1000,
          '&:hover': {
            background: 'linear-gradient(135deg, #0e8074 0%, #2ed968 100%)',
            transform: 'scale(1.1)',
            boxShadow: '0 12px 32px rgba(17, 153, 142, 0.6)',
          },
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            opacity: 0.3,
            animation: 'pulse 2s infinite',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0.3,
            },
            '50%': {
              transform: 'scale(1.2)',
              opacity: 0,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 0,
            },
          },
        }}
      >
        <SmartToy sx={{ fontSize: 36 }} />
      </Fab>
    </Tooltip>
  );
}
