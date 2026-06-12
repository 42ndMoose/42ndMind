(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.1.0';

  const F = Object.freeze([
    'eq(1,1)',
    'eq(B,1)',
    'eq(L,1)',
    'eq(q,1)',
    'sub(L,B)',
    'forall(q,imp(sub(q,B),eq(q,1)))',
    'and(eq(D(q),S(Delta(q))),eq(q,1))',
    'and(eq(Omega(q),not(S(Delta(q)))),eq(q,1))',
    'and(eq(K(B,x),Bp),eq(Bp,1))',
    'imp(E(q),eq(q,1))'
  ]);

  const A = Object.freeze([
    ['eq', '1', '1'],
    ['eq', 'B', '1'],
    ['eq', 'L', '1'],
    ['eq', 'q', '1'],
    ['sub', 'L', 'B'],
    ['forall', 'q', ['imp', ['sub', 'q', 'B'], ['eq', 'q', '1']]],
    ['and', ['eq', ['D', 'q'], ['S', ['Delta', 'q']]], ['eq', 'q', '1']],
    ['and', ['eq', ['Omega', 'q'], ['not', ['S', ['Delta', 'q']]]], ['eq', 'q', '1']],
    ['and', ['eq', ['K', 'B', 'x'], 'Bp'], ['eq', 'Bp', '1']],
    ['imp', ['E', 'q'], ['eq', 'q', '1']]
  ]);

  const C = Object.freeze([
    ['Gm', 'B', ['U', 'R', 'X', 'C', 'O', 'F', 'P', 'G']],
    ['Gm', 'L', ['UL', 'RL', 'XL', 'CL', 'OL', 'FL', 'PL', 'GL']],
    ['Gm', 'q', ['Uq', 'Rq', 'Xq', 'Cq', 'Oq', 'Fq', 'Pq', 'Gq']],
    ['imp', ['Gm', 'z'], ['eq', 'z', '1']],
    ['eq', ['sum', ['mul', 'wi', 'di']], '1']
  ]);

  const O = Object.freeze([
    ['iota', 'x', 'q'],
    ['rho', 'q'],
    ['tau', 'q'],
    ['pi', 'q'],
    ['phi', 'B', 'q'],
    ['K', 'B', 'x', 'Bp'],
    ['eq', 'Bp', '1']
  ]);

  const M = Object.freeze({ v, F, A, C, O });

  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }

  return Object.freeze({ VERSION: v, M, F, A, C, O, lines, textBlock });
});
