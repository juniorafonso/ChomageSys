// Manual PCM Verification
// Gain assuré: CHF 5,200
// Expected calculation: 5,200 × 80% × 3.6% = CHF 149.76

const gainAssured = 5200;
const pcmRate = 0.80 * 0.036;
const expectedPCM = gainAssured * pcmRate;

console.log('=== Manual PCM Calculation ===');
console.log(`Gain assuré: CHF ${gainAssured}`);
console.log(`PCM rate: 80% × 3.6% = ${pcmRate}`);
console.log(`Expected PCM: CHF ${expectedPCM.toFixed(2)}`);

// This should give us CHF 149.76
