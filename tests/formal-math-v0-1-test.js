const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');
const P = require('../src/language-parser-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

function hasAxis(field, symbol) {
  return field.some(row => row.σ === symbol);
}

function requireMath(text, mode) {
  const packet = P.compileMath(text);
  ok(text + ' emits math packet', packet.φ === 'M' && packet.mode === mode && packet.Ξ === '');
  ok(text + ' math field is unit-total', Math.abs(K.l1(packet.M) - 1) < 1e-6);
  return packet;
}

const underspecified = requireMath('x > 0', 'relation');
ok('x > 0 keeps variable x', underspecified.variables.includes('x'));
ok('x > 0 keeps relation greater-than', underspecified.relation === '>');
ok('x > 0 marks domain unspecified', underspecified.domain === 'unspecified');
ok('x > 0 marks quantifier unspecified', underspecified.quantifier === 'unspecified');
ok('x > 0 requires elaboration', underspecified.elaboration_required === true);
ok('x > 0 carries missing domain axis', hasAxis(underspecified.M, 'domain:unspecified'));
ok('x > 0 carries missing quantifier axis', hasAxis(underspecified.M, 'quantifier:unspecified'));

const theorem = requireMath('∀x ∈ ℝ, x² ≥ 0', 'theorem');
ok('real square theorem has all quantifier', theorem.quantifier === 'all');
ok('real square theorem has real domain', theorem.domain === 'real');
ok('real square theorem does not require elaboration', theorem.elaboration_required === false);
ok('real square theorem keeps operator square', theorem.operators.includes('square'));
ok('real square theorem keeps relation greater-equal', theorem.relation === '>=');

const equation = requireMath('x + 1 = 3', 'equation');
ok('equation keeps variable x', equation.variables.includes('x'));
ok('equation keeps plus operator', equation.operators.includes('+'));
ok('equation keeps equality relation', equation.relation === '=');
ok('equation is not falsely solved', equation.solved === false);

const undefinedRule = requireMath('a/b is undefined when b = 0', 'constraint');
ok('division undefined rule keeps division operator', undefinedRule.operators.includes('/'));
ok('division undefined rule keeps condition', undefinedRule.condition === 'b=0');
ok('division undefined rule marks undefined result', undefinedRule.result === 'undefined');

const modusPonens = requireMath('if A => B and A, then B', 'proof-rule');
ok('modus ponens keeps implication operator', modusPonens.operators.includes('=>'));
ok('modus ponens has proof rule id', modusPonens.rule === 'modus-ponens');
ok('modus ponens has no missing domain elaboration', modusPonens.elaboration_required === false);

const completion = P.mathToKernelCompletion('x > 0', K, { steps: 8 });
ok('math packet closes under omega-star', completion.φ === 'Ω*' && completion.complete === true);
ok('math packet has no unresolved gap', completion.unresolved_count === 0);

let rejected = false;
try { P.compileMath('this is just ordinary text'); }
catch (err) { rejected = String(err && err.message || err).indexOf('No deterministic math pattern matched') >= 0; }
ok('non-math text is rejected by math compiler', rejected === true);

console.log(rows.join('\n'));
