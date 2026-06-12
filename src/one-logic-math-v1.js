(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.4.0';

  const F = Object.freeze([
    'B=Cl(B)',
    'norm(B)=1',
    'P(B)=1',
    'L=PiL(B)',
    'sub(L,B)',
    'norm(L)=1',
    'P(L)=1',
    'forall(q,imp(in(q,B),norm(q)=1))',
    'iota(x)=qx',
    'Bx=Cl(union(B,{qx}))',
    'in(qx,Bx)',
    'norm(Bx)=1',
    'P(Bx)=1',
    'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))',
    'Om(q,B)=not(S(R(q,B)))',
    'S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))',
    'Phi(q,B)=Focus(B,q)',
    'E(B,phi)=PiE(Phi(phi,B))',
    'sub(E(B,phi),B)',
    'norm(E(B,phi))=1',
    'P(E(B,phi))=1',
    'Adm(x,B)=and(norm(Bx)=1,P(Bx)=1)',
    'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)',
    'Live(B)=and(B=Cl(B),norm(B)=1,P(B)=1,forall(x,imp(Adm(x,B),Cl(Bx)=Bx)))'
  ]);

  const A = Object.freeze([
    ['=', 'B', ['Cl', 'B']],
    ['=', ['norm', 'B'], 1],
    ['=', ['P', 'B'], 1],
    ['=', 'L', ['PiL', 'B']],
    ['sub', 'L', 'B'],
    ['=', ['norm', 'L'], 1],
    ['=', ['P', 'L'], 1],
    ['forall', 'q', ['imp', ['in', 'q', 'B'], ['=', ['norm', 'q'], 1]]],
    ['=', ['iota', 'x'], 'qx'],
    ['=', 'Bx', ['Cl', ['union', 'B', ['set', 'qx']]]],
    ['in', 'qx', 'Bx'],
    ['=', ['norm', 'Bx'], 1],
    ['=', ['P', 'Bx'], 1],
    ['=', ['D', 'q', 'B'], ['N', ['U', 'q'], ['R', 'q', 'B'], ['T', 'q', 'B'], ['C', 'q', 'B'], ['Om', 'q', 'B'], ['Phi', 'q', 'B'], ['P', 'q', 'B'], ['G', 'q', 'B']]],
    ['=', ['Om', 'q', 'B'], ['not', ['S', ['R', 'q', 'B']]]],
    ['=', ['S', 'q', 'B'], ['and', ['C', 'q', 'B'], ['P', 'q', 'B'], ['not', ['Om', 'q', 'B']]]],
    ['=', ['Phi', 'q', 'B'], ['Focus', 'B', 'q']],
    ['=', ['E', 'B', 'phi'], ['PiE', ['Phi', 'phi', 'B']]],
    ['sub', ['E', 'B', 'phi'], 'B'],
    ['=', ['norm', ['E', 'B', 'phi']], 1],
    ['=', ['P', ['E', 'B', 'phi']], 1],
    ['=', ['Adm', 'x', 'B'], ['and', ['=', ['norm', 'Bx'], 1], ['=', ['P', 'Bx'], 1]]],
    ['=', ['Valid', 'y', 'B'], ['and', ['sub', 'y', 'B'], ['=', ['norm', 'y'], 1], ['=', ['P', 'y'], 1]]],
    ['=', ['Live', 'B'], ['and', ['=', 'B', ['Cl', 'B']], ['=', ['norm', 'B'], 1], ['=', ['P', 'B'], 1], ['forall', 'x', ['imp', ['Adm', 'x', 'B'], ['=', ['Cl', 'Bx'], 'Bx']]]]]
  ]);

  const M = Object.freeze({ v, F, A });
  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }
  return Object.freeze({ VERSION: v, M, F, A, lines, textBlock });
});
