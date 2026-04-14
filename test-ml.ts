import { loadEnvConfig } from '@next/env';
loadEnvConfig('./');

const ML_API_URL = process.env.ML_API_URL || "https://fintellix-ml-model.onrender.com";

async function testPureFraud() {
  // Pure average fraud cluster from Kaggle
  const fraudPattern: number[] = [
    -1.1243711435390351, -0.3302277192617766, 1.7935995317307545, -1.040234723673469, -0.3659871565746595, 5.819537792615597, 3.393760640398897, 6.645001996002688, 9.016370829557552, -1.891930577932368, 0.6647542659694832, -0.7658130901626361, 3.2031212575166395, 0.6344392967376489, 1.9462637943817045, 1.370606009405022, 1.914903048654638, -0.0459632937081346, 3.5349000609136154, 3.8870434229385222, 4.322392948216394, 2.3691381511554264, 6.244973707373593, 0.007577136837273, -0.940925668973598, 3.407553301821732, 3.2034661346947293, -2.482083012365264, 2.220492718302796, 12.909897105642807
  ];

  console.log(`Testing Pure Fraud with 0 for time/amount...`);
  
  try {
    const resp = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: fraudPattern })
    });
    const data = await resp.json();
    console.log(`Response:`, data);
  } catch (e) {
    console.log("Error:", e);
  }
}

testPureFraud();
