(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.5.0';

  const F = Object.freeze([
    'B=Cl(B)',
    'Cl(Cl(B))=Cl(B)',
    'norm(B)=1',
    'P(B)=1',
    'One(B)=and(B=Cl(B),norm(B)=1,P(B)=1)',
    'L=PiL(B)',
    'sub(L,B)',
    'One(L)=and(sub(L,B),norm(L)=1,P(L)=1)',
    'forall(q,imp(in(q,B),One(q)))',
    'iota(x)=qx',
    'B[x]=Cl(union(B,{qx}))',
    'Adm(x,B)=and(norm(B[x])=1,P(B[x])=1)',
    'imp(Adm(x,B),One(B[x]))',
    'D(q,B)=N(U(q),R(q,B),T(q,B),C(q,B),Om(q,B),Phi(q,B),P(q,B),G(q,B))',
    'Om(q,B)=not(S(R(q,B)))',
    'S(q,B)=and(C(q,B),P(q,B),not(Om(q,B)))',
    'Pres(Om(q,B),B)=1',
    'EqB(a,b)=eq(D(a,B),D(b,B))',
    'imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))',
    'Red(B)=quot(B,EqB)',
    'norm(Red(B))=1',
    'G(q,B)=and(Adm(q,B),not(exists(r,and(in(r,B),EqB(q,r)))))',
    'imp(not(G(q,B)),B[q]=B)',
    'Phi(q,B)=Focus(B,q)',
    'E(B,phi)=PiE(Phi(phi,B))',
    'Valid(y,B)=and(sub(y,B),norm(y)=1,P(y)=1)',
    'Valid(E(B,phi),B)=1',
    'Active(B)=and(One(B),forall(x,imp(Adm(x,B),One(B[x]))))',
    'Living(B)=and(Active(B),forall(a,b,imp(EqB(a,b),Cl(union(B,{a,b}))=Cl(union(B,{a})))))'
  ]);

  const A = Object.freeze([
    ['=', 'B', ['Cl', 'B']],
    ['=', ['Cl', ['Cl', 'B']], ['Cl', 'B']],
    ['=', ['norm', 'B'], 1],
    ['=', ['P', 'B'], 1],
    ['=', ['One', 'B'], ['and', ['=', 'B', ['Cl', 'B']], ['=', ['norm', 'B'], 1], ['=', ['P', 'B'], 1]]],
    ['=', 'L', ['PiL', 'B']],
    ['sub', 'L', 'B'],
    ['=', ['One', 'L'], ['and', ['sub', 'L', 'B'], ['=', ['norm', 'L'], 1], ['=', ['P', 'L'], 1]]],
    ['forall', 'q', ['imp', ['in', 'q', 'B'], ['One', 'q']]],
    ['=', ['iota', 'x'], 'qx'],
    ['=', ['B', 'x'], ['Cl', ['union', 'B', ['set', 'qx']]]],
    ['=', ['Adm', 'x', 'B'], ['and', ['=', ['norm', ['B', 'x']], 1], ['=', ['P', ['B', 'x']], 1]]],
    ['imp', ['Adm', 'x', 'B'], ['One', ['B', 'x']]],
    ['=', ['D', 'q', 'B'], ['N', ['U', 'q'], ['R', 'q', 'B'], ['T', 'q', 'B'], ['C', 'q', 'B'], ['Om', 'q', 'B'], ['Phi', 'q', 'B'], ['P', 'q', 'B'], ['G', 'q', 'B']]],
    ['=', ['Om', 'q', 'B'], ['not', ['S', ['R', 'q', 'B']]]],
    ['=', ['S', 'q', 'B'], ['and', ['C', 'q', 'B'], ['P', 'q', 'B'], ['not', ['Om', 'q', 'B']]]],
    ['=', ['Pres', ['Om', 'q', 'B'], 'B'], 1],
    ['=', ['EqB', 'a', 'b'], ['eq', ['D', 'a', 'B'], ['D', 'b', 'B']]],
    ['imp', ['EqB', 'a', 'b'], ['=', ['Cl', ['union', 'B', ['set', 'a', 'b']]], ['Cl', ['union', 'B', ['set', 'a']]]]],
    ['=', ['Red', 'B'], ['quot', 'B', 'EqB']],
    ['=', ['norm', ['Red', 'B']], 1],
    ['=', ['G', 'q', 'B'], ['and', ['Adm', 'q', 'B'], ['not', ['exists', 'r', ['and', ['in', 'r', 'B'], ['EqB', 'q', 'r']]]]]],
    ['imp', ['not', ['G', 'q', 'B']], ['=', ['B', 'q'], 'B']],
    ['=', ['Phi', 'q', 'B'], ['Focus', 'B', 'q']],
    ['=', ['E', 'B', 'phi'], ['PiE', ['Phi', 'phi', 'B']]],
    ['=', ['Valid', 'y', 'B'], ['and', ['sub', 'y', 'B'], ['=', ['norm', 'y'], 1], ['=', ['P', 'y'], 1]]],
    ['=', ['Valid', ['E', 'B', 'phi'], 'B'], 1],
    ['=', ['Active', 'B'], ['and', ['One', 'B'], ['forall', 'x', ['imp', ['Adm', 'x', 'B'], ['One', ['B', 'x']]]]]],
    ['=', ['Living', 'B'], ['and', ['Active', 'B'], ['forall', 'a', 'b', ['imp', ['EqB', 'a', 'b'], ['=', ['Cl', ['union', 'B', ['set', 'a', 'b']]], ['Cl', ['union', 'B', ['set', 'a']]]]]]]]
  ]);

  const M = Object.freeze({ v, F, A });
  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }
  return Object.freeze({ VERSION: v, M, F, A, lines, textBlock });
});
