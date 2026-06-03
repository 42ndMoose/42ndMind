const assert = require('assert');
const M = require('../src/mathematical-patch-proposer-v0-1.js');
const X = require('../src/source-sandbox-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const complete = {};
M.REQUIRED_AXES.forEach(axis => {
  complete[axis.file] = (complete[axis.file] || '') + '/* ' + axis.id + ' */\n' + axis.needle + '\n';
});

ok('mathematical patch proposer loads', M.VERSION === '0.1.0');
const noGap = M.propose(complete);
ok('complete source has no gaps', noGap.gaps.length === 0);
ok('complete source has unit patch fields', noGap.unit.ok === true);
ok('complete source decision is no_action', noGap.decision.code === 'no_action');
ok('complete source keeps English empty', noGap.ξ === '');

const missing = Object.assign({}, complete);
delete missing['src/discovery-core-v0-1.js'];
missing['src/source-sandbox-v0-1.js'] = 'module.exports = { VERSION: \'0.1.0\' };\n';

const patch = M.propose(missing);
ok('missing source creates gaps', patch.gaps.length >= 2);
ok('patch has normalized gap field', Math.abs(M.l1(patch.fields.Γ) - 1) < 1e-6);
ok('patch has normalized patch field', Math.abs(M.l1(patch.fields.Π) - 1) < 1e-6);
ok('patch emits proposal operations for missing files', patch.proposal.operations.length >= 1);
ok('patch proposal is symbolic packet', patch.packet_type === '42ndMind_mathematical_patch_v0_1');
ok('patch has machine decision', ['sandbox_only', 'requires_implementation'].includes(patch.decision.code));

const sandbox = X.create(missing);
const report = X.simulate(sandbox, patch.proposal, []);
ok('patch proposal can be sandbox simulated', report.accepted === true);
ok('sandbox virtual source receives missing file', !!sandbox.virtual['src/discovery-core-v0-1.js']);
ok('base source remains unchanged', !sandbox.base['src/discovery-core-v0-1.js']);

const operatorGapOnly = Object.assign({}, complete);
operatorGapOnly['src/truth-accounting-core-v0-1.js'] = 'module.exports = { VERSION: \'0.1.0\' };\n';
const operatorPatch = M.propose(operatorGapOnly);
ok('operator gap is detected', operatorPatch.gaps.some(g => g.file === 'src/truth-accounting-core-v0-1.js'));
ok('operator gap requires implementation', operatorPatch.decision.code === 'requires_implementation');
ok('operator gap does not hallucinate source operations', operatorPatch.proposal.operations.length === 0);

console.log(rows.join('\n'));
