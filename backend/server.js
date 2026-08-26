const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let conversionHistory = [];

const UNITS_CONFIG = {
  length: {
    name: 'Longueur',
    units: {
      m: { name: 'Mètres', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      km: { name: 'Kilomètres', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      cm: { name: 'Centimètres', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      mm: { name: 'Millimètres', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      ft: { name: 'Pieds', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      in: { name: 'Pouces', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      yd: { name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      mi: { name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 }
    }
  },
  volume: {
    name: 'Volume',
    units: {
      L: { name: 'Litres', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      mL: { name: 'Millilitres', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      gal: { name: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
      qt: { name: 'Pintes (US qt)', symbol: 'qt', toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
      cup: { name: 'Tasses (US cup)', symbol: 'cup', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
      fl_oz: { name: 'Onces liquides (fl oz)', symbol: 'fl oz', toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 }
    }
  },
  weight: {
    name: 'Masse / Poids',
    units: {
      kg: { name: 'Kilogrammes', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      g: { name: 'Grammes', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      mg: { name: 'Milligrammes', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      lbs: { name: 'Livres', symbol: 'lbs', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      oz: { name: 'Onces', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 }
    }
  },
  temperature: {
    name: 'Température',
    units: {
      C: { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      F: { name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => (v * 9 / 5) + 32 },
      K: { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 }
    }
  },
  speed: {
    name: 'Vitesse',
    units: {
      kmh: { name: 'Km/h', symbol: 'km/h', toBase: (v) => v, fromBase: (v) => v },
      ms: { name: 'm/s', symbol: 'm/s', toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6 },
      mph: { name: 'Mph', symbol: 'mph', toBase: (v) => v * 1.609344, fromBase: (v) => v / 1.609344 },
      knot: { name: 'Nœuds', symbol: 'kn', toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852 }
    }
  },
  energy: {
    name: 'Énergie',
    units: {
      J: { name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      kJ: { name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      cal: { name: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      kcal: { name: 'Kilocalories', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      kWh: { name: 'Kilowattheures', symbol: 'kWh', toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 }
    }
  }
};

app.get('/api/categories', (req, res) => {
  const categories = Object.keys(UNITS_CONFIG).map((k) => ({
    key: k,
    name: UNITS_CONFIG[k].name,
    units: Object.keys(UNITS_CONFIG[k].units).map((u) => ({
      key: u,
      name: UNITS_CONFIG[k].units[u].name,
      symbol: UNITS_CONFIG[k].units[u].symbol
    }))
  }));
  res.json({ success: true, categories });
});

app.post('/api/convert', (req, res) => {
  try {
    const { category, fromUnit, toUnit, value } = req.body;
    if (!category || !fromUnit || !toUnit || value === undefined || value === null || value === '') {
      return res.status(400).json({ success: false, error: 'Paramètres manquants' });
    }
    const num = parseFloat(value);
    if (isNaN(num)) return res.status(400).json({ success: false, error: 'Valeur invalide' });

    const cat = UNITS_CONFIG[category];
    if (!cat) return res.status(400).json({ success: false, error: 'Catégorie invalide' });

    const src = cat.units[fromUnit];
    const tgt = cat.units[toUnit];
    if (!src || !tgt) return res.status(400).json({ success: false, error: 'Unités invalides' });

    const base = src.toBase(num);
    const raw = tgt.fromBase(base);
    const resVal = Math.abs(raw) < 1e-6 || Math.abs(raw) > 1e9 ? raw.toExponential(6) : parseFloat(raw.toFixed(6));
    const factor = parseFloat(tgt.fromBase(src.toBase(1)).toFixed(6));
    const formula = `1 ${src.symbol} = ${factor} ${tgt.symbol}`;

    const item = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      category,
      categoryName: cat.name,
      inputValue: num,
      fromUnit,
      fromSymbol: src.symbol,
      fromName: src.name,
      resultValue: resVal,
      toUnit,
      toSymbol: tgt.symbol,
      toName: tgt.name,
      formula
    };

    conversionHistory.unshift(item);
    if (conversionHistory.length > 30) conversionHistory = conversionHistory.slice(0, 30);

    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

app.get('/api/history', (req, res) => res.json({ success: true, history: conversionHistory }));
app.delete('/api/history', (req, res) => {
  conversionHistory = [];
  res.json({ success: true, message: 'Historique effacé' });
});
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.listen(PORT, () => console.log(`Serveur prêt sur http://localhost:${PORT}`));
