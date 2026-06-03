const assert = require('assert');
const O = require('../src/operator-synthesis-core-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const failedReport = {
  tests: [
    { path: 'tests/unit-test.js', ok: false, error: 'AssertionError: strictEqual expected 1 actual 0' },
    { path: 'tests/missing-test.js', ok: false, error: 'Error: module not found: src/missing.js' }
  ],
  validators: [
    { id: 'whole_language_unit_total', ok: false, error: 'unit invariant failed' }
  ],
  chaos: ['validator_failed:whole_language_unit_total']
};

ok('operator synthesis core loads', O.VERSION === '0.1.0');
const failures = O.collectFailures(failedReport);
ok('failures are collected', failures.length >= 4);
const synthesis = O.synthesize(failedReport, { scope: 'test' });
ok('synthesis packet exists', synthesis.packet_type === '42ndMind_operator_synthesis_v0_1');
ok('operator candidates are generated', synthesis.candidates.length > 0);
ok('unit fields are preserved', synthesis.unit.ok === true);
ok('decision is candidate-ready', synthesis.decision.code === 'operator_candidates_ready');
ok('missing module becomes operator candidate', synthesis.candidates.some(c => c.operator === 'resolve_or_create_module'));
ok('unit failure becomes operator candidate', synthesis.candidates.some(c => c.operator === 'unit_restoration_operator'));
ok('english channel is empty', synthesis.ξ === '');
const fixture = O.toFixture(synthesis);
ok('fixture can be produced', fixture.type === 'operator_synthesis_fixture_v0_1' && fixture.candidates.length > 0);

const clean = O.synthesize({ tests: [], validators: [], chaos: [] });
ok('clean report has no failures decision', clean.decision.code === 'no_failures');
ok('clean report remains unit-total', clean.unit.ok === true);

console.log(rows.join('\n'));
