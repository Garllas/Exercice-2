import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

export default function QuickPresets({ onSelectPreset }) {
  const presets = [
    { label: '10 Pieds ➔ Mètres', category: 'length', fromUnit: 'ft', toUnit: 'm', value: '10' },
    { label: '5 Litres ➔ Gallons', category: 'volume', fromUnit: 'L', toUnit: 'gal', value: '5' },
    { label: '25 °Celsius ➔ Fahrenheit', category: 'temperature', fromUnit: 'C', toUnit: 'F', value: '25' },
    { label: '70 Kilogrammes ➔ Livres', category: 'weight', fromUnit: 'kg', toUnit: 'lbs', value: '70' }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontWeight: 'bold' }}>
        <AutoAwesome fontSize="small" color="primary" /> Raccourcis Populaires :
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1}>
        {presets.map((p, idx) => (
          <Chip
            key={idx}
            label={p.label}
            onClick={() => onSelectPreset(p)}
            variant="outlined"
            clickable
            color="primary"
            sx={{ fontWeight: '500', transition: '0.2s', '&:hover': { transform: 'scale(1.03)' } }}
          />
        ))}
      </Box>
    </Box>
  );
}
