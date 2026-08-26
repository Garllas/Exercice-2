import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Button, Typography, Box, Chip, Tooltip, Snackbar, Alert } from '@mui/material';
import { SwapHoriz, ContentCopy } from '@mui/icons-material';

export default function ConverterCard({ activeCategory, onConversionSuccess, preset, onPresetApplied }) {
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (preset && activeCategory && activeCategory.key === preset.category) {
      setInputValue(preset.value);
      setFromUnit(preset.fromUnit);
      setToUnit(preset.toUnit);
      if (onPresetApplied) onPresetApplied();
    }
  }, [preset, activeCategory]);

  useEffect(() => {
    if (activeCategory && activeCategory.units?.length > 0 && !preset) {
      setFromUnit(activeCategory.units[0].key);
      setToUnit(activeCategory.units[1] ? activeCategory.units[1].key : activeCategory.units[0].key);
      setResult(null);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory && fromUnit && toUnit && inputValue !== '') {
      handleConvert();
    }
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const handleConvert = async () => {
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      setError('Entrez une valeur numérique valide.');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: activeCategory.key, fromUnit, toUnit, value: inputValue })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        if (onConversionSuccess) onConversionSuccess();
      } else {
        setError(data.error || 'Erreur lors de la conversion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    }
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(`${result.inputValue} ${result.fromSymbol} = ${result.resultValue} ${result.toSymbol}`);
      setToastOpen(true);
    }
  };

  if (!activeCategory) return null;
  const units = activeCategory.units || [];

  return (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600" color="primary">
          Convertir des {activeCategory.name.toLowerCase()}
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField label="Valeur" variant="outlined" fullWidth type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={5} md={3}>
            <FormControl fullWidth>
              <InputLabel>De</InputLabel>
              <Select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} label="De">
                {units.map((u) => <MenuItem key={u.key} value={u.key}>{u.name} ({u.symbol})</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} md={1} sx={{ textAlign: 'center' }}>
            <IconButton color="secondary" onClick={handleSwap} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <SwapHoriz />
            </IconButton>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <FormControl fullWidth>
              <InputLabel>Vers</InputLabel>
              <Select value={toUnit} onChange={(e) => setToUnit(e.target.value)} label="Vers">
                {units.map((u) => <MenuItem key={u.key} value={u.key}>{u.name} ({u.symbol})</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        {result && (
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="body2" color="text.secondary">RÉSULTAT</Typography>
                <Box display="flex" alignItems="baseline" sx={{ mt: 1 }}>
                  <Typography variant="h3" fontWeight="bold">{result.resultValue}</Typography>
                  <Typography variant="h5" color="text.secondary" sx={{ ml: 1 }}>{result.toSymbol}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {result.inputValue} {result.fromSymbol} = {result.resultValue} {result.toSymbol}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                <Button variant="outlined" startIcon={<ContentCopy />} onClick={handleCopy} size="small">Copier</Button>
                {result.formula && <Chip label={`Formule: ${result.formula}`} variant="outlined" color="primary" size="small" sx={{ mt: 1 }} />}
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
      <Snackbar open={toastOpen} autoHideDuration={2000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToastOpen(false)} severity="success">Résultat copié !</Alert>
      </Snackbar>
    </Card>
  );
}
