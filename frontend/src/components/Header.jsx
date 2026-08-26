import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import { Brightness4, Brightness7, CompareArrows } from '@mui/icons-material';

export default function Header({ darkMode, toggleTheme }) {
  return (
    <AppBar position="static" elevation={2} color="primary">
      <Toolbar>
        <CompareArrows sx={{ mr: 2, fontSize: 32 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: '0.5px' }}
        >
          Convertisseur d'Unités
        </Typography>
        <Box display="flex" alignItems="center">
          <IconButton color="inherit" onClick={toggleTheme} title="Changer de thème">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
