(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const v = '1.2.0';

  const F = Object.freeze([
    'B_t=N(U_t,R_t,X_t,C_t,O_t,F_t,P_t,G_t)',
    'L_t=Pi_L(B_t)',
    'q_t in U_t',
    'norm(B_t)=1',
    'norm(L_t)=1',
    'norm(q_t)=1',
    'I(x,t)=q_x_t',
    'R(q_x_t,B_t)=r_x_t',
    'X(q_x_t,r_x_t,B_t)=x_x_t',
    'C(q_x_t,r_x_t,x_x_t,B_t)=c_x_t',
    'O(q_x_t,r_x_t)=not(S(r_x_t))',
    'F(B_t,q_x_t)=f_x_t',
    'P(B_t,q_x_t,r_x_t,x_x_t,c_x_t)=p_x_t',
    'G(B_t,q_x_t,r_x_t,x_x_t,c_x_t,O(q_x_t,r_x_t))=g_x_t',
    'K(B_t,x)=N(B_t,q_x_t,r_x_t,x_x_t,c_x_t,O(q_x_t,r_x_t),f_x_t,p_x_t,g_x_t)',
    'B_t1=K(B_t,x)',
    'norm(B_t1)=1',
    'P(B_t1)=1',
    'E(B_t,phi)=Pi_E(F(B_t,phi))',
    'P(E(B_t,phi))=1'
  ]);

  const A = Object.freeze([
    ['=', 'B_t', ['N', 'U_t', 'R_t', 'X_t', 'C_t', 'O_t', 'F_t', 'P_t', 'G_t']],
    ['=', 'L_t', ['Pi_L', 'B_t']],
    ['in', 'q_t', 'U_t'],
    ['=', ['norm', 'B_t'], 1],
    ['=', ['norm', 'L_t'], 1],
    ['=', ['norm', 'q_t'], 1],
    ['=', ['I', 'x', 't'], 'q_x_t'],
    ['=', ['R', 'q_x_t', 'B_t'], 'r_x_t'],
    ['=', ['X', 'q_x_t', 'r_x_t', 'B_t'], 'x_x_t'],
    ['=', ['C', 'q_x_t', 'r_x_t', 'x_x_t', 'B_t'], 'c_x_t'],
    ['=', ['O', 'q_x_t', 'r_x_t'], ['not', ['S', 'r_x_t']]],
    ['=', ['F', 'B_t', 'q_x_t'], 'f_x_t'],
    ['=', ['P', 'B_t', 'q_x_t', 'r_x_t', 'x_x_t', 'c_x_t'], 'p_x_t'],
    ['=', ['G', 'B_t', 'q_x_t', 'r_x_t', 'x_x_t', 'c_x_t', ['O', 'q_x_t', 'r_x_t']], 'g_x_t'],
    ['=', ['K', 'B_t', 'x'], ['N', 'B_t', 'q_x_t', 'r_x_t', 'x_x_t', 'c_x_t', ['O', 'q_x_t', 'r_x_t'], 'f_x_t', 'p_x_t', 'g_x_t']],
    ['=', 'B_t1', ['K', 'B_t', 'x']],
    ['=', ['norm', 'B_t1'], 1],
    ['=', ['P', 'B_t1'], 1],
    ['=', ['E', 'B_t', 'phi'], ['Pi_E', ['F', 'B_t', 'phi']]],
    ['=', ['P', ['E', 'B_t', 'phi']], 1]
  ]);

  const M = Object.freeze({ v, F, A });
  function lines() { return F.slice(); }
  function textBlock() { return F.join('\n'); }
  return Object.freeze({ VERSION: v, M, F, A, lines, textBlock });
});
