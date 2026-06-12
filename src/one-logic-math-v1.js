(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.3.0';

  const F = Object.freeze([
    'B=Cl(B)',
    'norm(B)=1',
    'L=Pi_L(B)',
    'norm(L)=1',
    'sub(L,B)',
    'forall(q,in(q,B)->norm(q)=1)',
    'iota(x)=q_x',
    'in(q_x,B[x])',
    'B[x]=Cl(union(B,{q_x}))',
    'norm(B[x])=1',
    'P(B[x])=1',
    'D(q,B)=N(U(q),R(q,B),X(q,B),C(q,B),O(q,B),F(q,B),P(q,B),G(q,B))',
    'O(q,B)=not(S(R(q,B)))',
    'S(q,B)=and(C(q,B),P(q,B),not(O(q,B)))',
    'E(B,phi)=Pi_E(F(B,phi))',
    'sub(E(B,phi),B)',
    'P(E(B,phi))=1'
  ]);

  const A = Object.freeze([
    ['=', 'B', ['Cl', 'B']],
    ['=', ['norm', 'B'], 1],
    ['=', 'L', ['Pi_L', 'B']],
    ['=', ['norm', 'L'], 1],
    ['sub', 'L', 'B'],
    ['forall', 'q', ['->', ['in', 'q', 'B'], ['=', ['norm', 'q'], 1]]],
    ['=', ['iota', 'x'], 'q_x'],
    ['in', 'q_x', ['B', 'x']],
    ['=', ['B', 'x'], ['Cl', ['union', 'B', ['set', 'q_x']]]],
    ['=', ['norm', ['B', 'x']], 1],
    ['=', ['P', ['B', 'x']], 1],
    ['=', ['D', 'q', 'B'], ['N', ['U', 'q'], ['R', 'q', 'B'], ['X', 'q', 'B'], ['C', 'q', 'B'], ['O', 'q', 'B'], ['F', 'q', 'B'], ['P', 'q', 'B'], ['G', 'q', 'B']]],
    ['=', ['O', 'q', 'B'], ['not', ['S', ['R', 'q', 'B']]]],
    ['=', ['S', 'q', 'B'], ['and', ['C', 'q', 'B'], ['P', 'q', 'B'], ['not', ['O', 'q', 'B']]]],
    ['=', ['E', 'B', 'phi'], ['Pi_E', ['F', 'B', 'phi']]],
    ['sub', ['E', 'B', 'phi'], 'B'],
    ['=', ['P', ['E', 'B', 'phi']], 1]
  ]);

  const M = Object.freeze({ v, F, A });
  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }
  return Object.freeze({ VERSION: v, M, F, A, lines, textBlock });
});
