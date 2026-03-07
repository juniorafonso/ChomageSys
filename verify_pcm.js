// Manual PCM Verification
// Gain assuré: CHF 5,200
// Expected calculation: 5,200 × 80% × 3.75% = CHF 156.00

const gainAssured = 5200;
const pcmRate = 0.80 * 0.0375;
const expectedPCM = gainAssured * pcmRate;

console.log('=== Manual PCM Calculation ===');
console.log(`Gain assuré: CHF ${gainAssured}`);
console.log(`PCM rate: 80% × 3.75% = ${pcmRate}`);
console.log(`Expected PCM: CHF ${expectedPCM.toFixed(2)}`);

// This should give us CHF 156.00
