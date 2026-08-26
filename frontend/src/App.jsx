import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Tabs, Tab, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { Straighten, LocalBar, FitnessCenter, Thermostat, Speed } from '@mui/icons-material';

import Header from './components/Header';
import ConverterCard from './components/ConverterCard';
import HistoryLog from './components/HistoryLog';
import QuickPresets from './components/QuickPresets';

const getIcon = (key) => {
  switch (key) {
    case 'length': return <Straighten />;
    case 'volume': return <LocalBar />;
    case 'weight': return <FitnessCenter />;
    case 'temperature': return <Thermostat />;
    case 'speed': return <Speed />;
    default: return <Straighten />;
  }
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState([]);
  const [preset, setPreset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#90caf9' : '#1976d2' },
      secondary: { main: darkMode ? '#f48fb1' : '#dc004e' },
      background: {
        default: darkMode ? '#121212' : '#f5f7fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      }
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)',
            transition: 'box-shadow 0.3s ease-in-out'
          }
        }
      }
    }
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        setError('Impossible de récupérer les catégories d\'unités.');
      }
    } catch {
      setError('Erreur réseau. Le serveur backend est-il démarré ?');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Erreur historique:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Erreur effacement historique:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchHistory();
  }, []);

  const handleSelectPreset = (presetData) => {
    const catIdx = categories.findIndex((c) => c.key === presetData.category);
    if (catIdx !== -1) {
      setActiveTab(catIdx);
      setPreset(presetData);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
          <CircularProgress size={50} />
          <Typography sx={{ mt: 2 }} color="text.secondary">Démarrage du convertisseur d'unités...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  const activeCategory = categories[activeTab];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
          
          <QuickPresets onSelectPreset={handleSelectPreset} />

          <Paper elevation={1} sx={{ borderRadius: 3, mb: 4, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => {
                setActiveTab(newValue);
                setPreset(null);
              }}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}
            >
              {categories.map((cat) => (
                <Tab
                  key={cat.key}
                  label={cat.name}
                  icon={getIcon(cat.key)}
                  iconPosition="start"
                  sx={{ py: 2, fontWeight: 'bold' }}
                />
              ))}
            </Tabs>
          </Paper>

          {activeCategory && (
            <ConverterCard
              activeCategory={activeCategory}
              onConversionSuccess={fetchHistory}
              preset={preset}
              onPresetApplied={() => setPreset(null)}
            />
          )}

          <HistoryLog history={history} onClear={handleClearHistory} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
