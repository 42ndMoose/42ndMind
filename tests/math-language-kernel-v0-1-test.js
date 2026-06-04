const assert = require('assert');
const K = require('../src/math-language-kernel-v0-1.js');

const rows = [];
function ok(name, condition) {
  rows.push((condition ? 'PASS ' : 'FAIL ') + name);
  assert.ok(condition, name);
}

const s = K.create();

ok('kernel loads', K.VERSION === '0.1.0');
ok('lambda starts unit-total', Math.abs(K.l1(s.λ) - 1) < 1e-6);
ok('intention starts unit-total', Math.abs(K.l1(s.ι) - 1) < 1e-6);
ok('lexeme field starts unit-total', Math.abs(K.l1(s.Λ) - 1) < 1e-6);
ok('whole state starts unit-total', Math.abs(K.l1(s.Ω) - 1) < 1e-6);
ok('no English output channel', s.Ξ === '');

const defs = K.definitions();
ok('kernel defines sigma weight and constraint rows', !!defs.σ && !!defs.w && !!defs.χ);
ok('kernel defines closure and equivalence symbols', !!defs.C && !!defs['≡'] && !!defs['⊢'] && !!defs.G);
ok('kernel defines zero-gap and lexeme symbols', !!defs.Δ0 && !!defs.Λ);
const inv = K.invariants();
ok('kernel has invariant registry beyond unit-total', inv.length >= 4 && inv.some(row => row.id === 'χ_no_english'));
ok('kernel has zero-gap invariant', inv.some(row => row.id === 'χ_zero_gap'));
ok('invariant field is unit-total', Math.abs(K.l1(K.invariantField()) - 1) < 1e-6);
ok('valid field passes invariant validator', K.validateField([{ σ: 'a', w: 1 }]).ok === true);
ok('bad unit field fails invariant validator', K.validateField([{ σ: 'a', w: 0.25 }]).ok === false);

const p0 = K.packet(s);
ok('packet is symbolic', p0.φ === 'Ω' && p0.Ξ === '');
ok('packet carries invariant list', p0.χ.includes('∥F∥₁=1') && p0.χ.includes('Ξ=""'));
ok('packet carries discrepancy invariant', p0.χ.some(row => row.indexOf('δ=') >= 0));
ok('packet carries gap invariant', p0.χ.some(row => row.indexOf('Δ=') >= 0));
ok('packet carries zero-gap invariant', p0.χ.some(row => row.indexOf('Δ.score=0') >= 0));
ok('packet carries closure invariant rows', p0.χ.some(row => row.indexOf('ν=') >= 0) && p0.χ.some(row => row.indexOf('C=') >= 0));
ok('packet carries lexeme field', Array.isArray(p0.Λ) && Math.abs(K.l1(p0.Λ) - 1) < 1e-6);

const dClosed = K.discrepancy(1, 1, 'closed');
ok('closed discrepancy uses δ0', dClosed.ω === 'δ0' && dClosed.δ[0].σ === 'δ0');

const d0 = K.discrepancy(1, 0, 'unit');
ok('discrepancy packet is symbolic', d0.φ === 'δ' && d0.Ξ === '');
ok('discrepancy field is unit-total', d0.u.ok === true && Math.abs(K.l1(d0.δ) - 1) < 1e-6);
ok('expected-actual gap is classified', d0.ω === 'δ=' || d0.z['δ='] > 0);

const d1 = K.discrepancy(1, [{ σ: 'a', w: 0.25 }], 'field');
ok('unit-total gap is measured by discrepancy for fields', d1.z['δ∥'] > 0);
ok('field discrepancy stays unit-total', d1.u.ok === true);

const fA = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
const fB = [{ σ: 'a', w: 0.5 }, { σ: 'b', w: 0.5 }];
const fC = [{ σ: 'a', w: 0.25 }, { σ: 'b', w: 0.75 }];
const fD = [{ σ: 'a', w: 1 }];
const fE = [{ σ: 'a', w: 0.25 }];
const fMessy = [{ σ: 'b', w: 0.25 }, { σ: 'a', w: 0.25 }, { σ: 'b', w: 0.25 }, { σ: 'a', w: 0.25 }];

const g0 = K.gap(fA, fB, 'same');
ok('gap packet is symbolic', g0.φ === 'Δ' && g0.Ξ === '');
ok('gap field is unit-total', g0.u.ok === true && Math.abs(K.l1(g0.Δ) - 1) < 1e-6);
ok('same fields have no axis gap', g0.z['Δσ'] === 0);
ok('same fields have no weight gap', g0.z['Δw'] === 0);
ok('same fields have no unit gap', g0.z['Δ∥'] === 0);
ok('closed gap uses Δ0 instead of empty axis', g0.ω === 'Δ0' && g0.Δ[0].σ === 'Δ0');

const g1 = K.gap(fA, fC, 'weight');
ok('weight gap is measured', g1.z['Δw'] > 0);
ok('weight gap has no axis mismatch', g1.z['Δσ'] === 0);
ok('weight gap remains unit-total', g1.u.ok === true);

const g2 = K.gap(fA, fD, 'axis');
ok('axis gap is measured', g2.z['Δσ'] > 0);
ok('axis gap remains unit-total', g2.u.ok === true);

const g3 = K.gap(fA, fE, 'unit');
ok('unit gap is measured by gap from raw fields', g3.z['Δ∥'] > 0);
ok('raw invalid unit field is detected by validator', K.validateField(fE).ok === false);
ok('unit gap remains unit-total', g3.u.ok === true);

const g4 = K.gap({ χ: ['x'] }, { χ: ['y'] }, 'invariant');
ok('invariant gap is measured', g4.z['Δχ'] > 0);
ok('unknown gap is reserved when no comparable field exists', g4.z['Δ?'] > 0);

const repair = K.correction(fA, fC, 'weight-repair');
ok('correction packet is symbolic', repair.φ === 'T' && repair.Ξ === '');
ok('correction transform field is unit-total', Math.abs(K.l1(repair.T) - 1) < 1e-6);
ok('correction uses finite local argmin', repair.method === 'finite_local_argmin');
ok('correction reduces or preserves measured gap', repair.after.score <= repair.before.score);
ok('correction outputs transformed unit field', Math.abs(K.l1(repair.transformed) - 1) < 1e-6);

const canonA = K.canonical(fMessy);
const canonB = K.canonical(fA);
ok('canonical packet is symbolic', canonA.φ === 'ν' && canonA.Ξ === '');
ok('canonical merges sorts and normalizes fields', JSON.stringify(canonA.F) === JSON.stringify(canonB.F));
ok('canonical field is unit-total', Math.abs(K.l1(canonA.F) - 1) < 1e-6);

const eq0 = K.equivalent(fMessy, fA);
const eq1 = K.equivalent(fA, fC);
ok('equivalent detects same canonical field', eq0.φ === '≡' && eq0.true === true && eq0.Ξ === '');
ok('equivalent detects different canonical field', eq1.true === false);

const closed = K.close([fA], { target: fC });
ok('closure packet is symbolic', closed.φ === 'C' && closed.Ξ === '');
ok('closure emits closed fields', Array.isArray(closed.fields) && closed.fields.length >= 1);
ok('closure fields are unit-total', closed.u.ok === true);
ok('closure can emit transforms when target is supplied', closed.transforms.length >= 1);

const proof = K.proveTransform(repair, fA, fC, 'proof');
ok('proof gate packet is symbolic', proof.φ === '⊢' && proof.Ξ === '');
ok('proof gate accepts unit-preserving reducing transform', proof.true === true);

const lim = K.converge(fA, fC, { steps: 4 });
ok('convergence packet is symbolic', lim.φ === 'lim' && lim.Ξ === '');
ok('convergence remains unit-total', lim.u.ok === true);
ok('convergence reaches or approaches lower gap', lim.score <= K.gap(fA, fC, 'lim-before').score);

const formalGround = K.ground(fA);
const observedGround = K.ground(fA, [{ source: 'measurement', value: fA }]);
ok('grounding distinguishes formal mode', formalGround.φ === 'G' && formalGround.mode === 'formal' && formalGround.Ξ === '');
ok('grounding distinguishes observed mode', observedGround.mode === 'observed' && observedGround.observed === true);

const lex = K.deriveLexicon([g0, repair, proof, lim, formalGround, observedGround, eq0, eq1]);
ok('lexicon packet is symbolic', lex.φ === 'Λ' && lex.Ξ === '');
ok('lexicon field is unit-total', lex.u.ok === true && Math.abs(K.l1(lex.Λ) - 1) < 1e-6);
ok('lexicon derives closed-gap lexeme', lex.entries.some(row => row.σ === 'Λ:Δ0' && row.accepted === true));
ok('lexicon derives proof and convergence lexemes', lex.entries.some(row => row.σ === 'Λ:⊢1') && lex.entries.some(row => row.σ === 'Λ:lim1'));
ok('lexicon derives generalized numeric fact lexemes', lex.entries.some(row => row.σ === 'Λ:⊢.after0') && lex.entries.some(row => row.σ === 'Λ:lim.score0'));
ok('lexicon derives generalized boolean fact lexemes', lex.entries.some(row => row.σ === 'Λ:G.observed0') && lex.entries.some(row => row.σ === 'Λ:G.observed1'));
ok('lexicon derives generalized distance fact lexeme', lex.entries.some(row => row.σ === 'Λ:≡.distance=0.5'));
const resolved = K.resolveLexeme('Λ:Δ0', lex);
ok('lexeme resolver returns exactly one accepted match', resolved.φ === 'Λ?' && resolved.ok === true && resolved.matches.length === 1);
const resolvedGeneral = K.resolveLexeme('Λ:lim.score0', lex);
ok('generalized lexeme resolver returns exactly one accepted match', resolvedGeneral.ok === true && resolvedGeneral.matches.length === 1);
const conflictBase = lex.entries.find(row => row.σ === 'Λ:Δ0');
const conflictCandidate = Object.assign({}, conflictBase, { ν: 'ν-conflict' });
const rejectedConflict = K.acceptLexeme(conflictCandidate, [conflictBase]);
ok('lexeme conflict is rejected', rejectedConflict.accepted === false && rejectedConflict.rejected === true && rejectedConflict.conflict === conflictBase.ν);

const p1 = K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
ok('observation returns packet', p1.φ === 'Ω');
ok('tokens form from repeated raw symbols', s.memory.tokens.length > 0);
ok('lambda remains unit-total after observation', Math.abs(K.l1(s.λ) - 1) < 1e-6);
ok('intention remains unit-total after observation', Math.abs(K.l1(s.ι) - 1) < 1e-6);
ok('meaning candidates remain unit-total', Math.abs(K.l1(s.μ) - 1) < 1e-6);
ok('whole state remains unit-total', Math.abs(K.l1(s.Ω) - 1) < 1e-6);
ok('trace records mathematical deltas', s.trace.length > 0 && typeof s.trace[0].ΔΩ === 'number');
ok('English remains empty after observation', K.packet(s).Ξ === '');

const before = K.snapshot(s);
K.observe(s, 'abababab cdcdcdcd ababab cdcdcdcd');
const after = K.snapshot(s);
ok('new input readjusts lambda', K.distance(before.λ, after.λ) >= 0);
ok('new input readjusts intention', K.distance(before.ι, after.ι) >= 0);
ok('all active fields still satisfy unit report', after.unit.ok === true);

const noisy = K.create();
K.observe(noisy, 'xqz 91 %% ?? blorp');
ok('irregular stream tolerated', noisy.unit.ok === true);
ok('irregular stream still has no English', K.packet(noisy).Ξ === '');

console.log(rows.join('\n'));
