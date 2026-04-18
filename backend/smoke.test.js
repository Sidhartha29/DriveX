import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrice, applyDiscount, applyGST } from './utils/priceCalculator.js';

test('calculatePrice returns expected total', () => {
  assert.equal(calculatePrice(100, 2.5, 2), 500);
});

test('discount and GST helpers return deterministic values', () => {
  assert.equal(applyDiscount(1000, 10), 900);
  assert.equal(applyGST(1000, 5), 1050);
});

test('calculatePrice rejects invalid values', () => {
  assert.throws(() => calculatePrice(0, 2.5, 1), /Invalid calculation parameters/);
});
