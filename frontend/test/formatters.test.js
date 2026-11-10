import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatStatus, compactQuery } from '../src/utils/formatters.js';

test('formats sale and rental prices clearly', () => {
  assert.equal(formatCurrency(125000, 'sale'), '$125,000');
  assert.equal(formatCurrency(850, 'rent'), '$850/mo');
});

test('formats machine statuses for people', () => {
  assert.equal(formatStatus('in_progress'), 'In Progress');
  assert.equal(formatStatus('property_inspection'), 'Property Inspection');
});

test('removes empty query values while preserving zero', () => {
  assert.deepEqual(compactQuery({ search: '', page: 1, min_price: 0, type: null }), { page: 1, min_price: 0 });
});
