import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        backgroundImage: 'url(/matthew.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        px: 4,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          pl: 6,
          color: 'white',
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          RPS
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Login or Register
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthPage;
