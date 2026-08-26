import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton } from '@mui/material';
import { Delete as DeleteIcon, History as HistoryIcon } from '@mui/icons-material';

export default function HistoryLog({ history, onClear }) {
  const formatDate = (isoStr) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center">
            <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" fontWeight="bold">Historique Récent</Typography>
          </Box>
          {history.length > 0 && (
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onClear} size="small">
              Vider l'historique
            </Button>
          )}
        </Box>

        {history.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography color="text.secondary">Aucun historique de conversion pour le moment.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300, border: '1px solid', borderColor: 'divider' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Heure</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Valeur de départ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Résultat</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'table-cell' } }}>Relation d'équivalence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{formatDate(row.timestamp)}</TableCell>
                    <TableCell>{row.categoryName}</TableCell>
                    <TableCell align="right">{row.inputValue} <strong>{row.fromSymbol}</strong></TableCell>
                    <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{row.resultValue} <strong>{row.toSymbol}</strong></TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: 'text.secondary', fontSize: '0.8rem' }}>{row.formula}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
