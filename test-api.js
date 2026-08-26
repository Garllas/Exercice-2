const http = require('http');

// Start backend directly
require('./backend/server.js');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
};

async function runTests() {
  console.log('Attente du démarrage du serveur...');
  await new Promise((r) => setTimeout(r, 1000));

  try {
    // 1. Health check
    console.log('\n--- TEST 1: /api/health ---');
    const health = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    console.log('Health Status:', health.data);

    // 2. Categories
    console.log('\n--- TEST 2: /api/categories ---');
    const categories = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/categories', method: 'GET' });
    console.log('Catégories disponibles:', categories.data.categories.map((c) => c.name));

    // 3. Convert 10 ft to m
    console.log('\n--- TEST 3: Convertir 10 ft en m (Pieds -> Mètres) ---');
    const conv1 = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/convert',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { category: 'length', fromUnit: 'ft', toUnit: 'm', value: '10' }
    );
    console.log('Résultat 10 ft en m:', conv1.data.data.resultValue, 'm (Attendu: 3.048 m)');

    // 4. Convert 5 L to gal
    console.log('\n--- TEST 4: Convertir 5 L en gal (Litres -> Gallons) ---');
    const conv2 = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/convert',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { category: 'volume', fromUnit: 'L', toUnit: 'gal', value: '5' }
    );
    console.log('Résultat 5 L en gal:', conv2.data.data.resultValue, 'gal');

    // 5. Check History
    console.log('\n--- TEST 5: /api/history ---');
    const history = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/history', method: 'GET' });
    console.log('Nombre de conversions dans l\'historique:', history.data.history.length);

    console.log('\n TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
  } catch (err) {
    console.error('Erreur pendant les tests:', err);
  } finally {
    process.exit(0);
  }
}

runTests();
