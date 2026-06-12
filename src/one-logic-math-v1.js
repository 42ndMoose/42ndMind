(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OneLogicMathV1 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '1.0.0';

  const primitive = Object.freeze([
    '1 = 1',
    'B = 1',
    'L = 1',
    'q = 1',
    'L ⊂ B',
    '∀q ⊂ B, q = 1',
    'definition(q) = stable distinction of q preserving q = 1',
    'unknown(q) = unresolved distinction of q preserving q = 1',
    'closure(B, x) = B′ where B′ = 1',
    'expression(q) is permitted only when q = 1 is preserved'
  ]);

  const coordinate = Object.freeze([
    'coord(B) = { U, R, X, C, Ω, Φ, P, G }',
    'coord(L) = { U_L, R_L, X_L, C_L, Ω_L, Φ_L, P_L, G_L }',
    'coord(q) = { U_q, R_q, X_q, C_q, Ω_q, Φ_q, P_q, G_q }',
    'coordinates are descriptions of distinction; they are not the primitive law',
    'Σ wᵢdᵢ = 1 only describes a current coordinate expression of a local one'
  ]);

  const operators = Object.freeze([
    'unit(x) = q',
    'relate(q) attempts distinction without breaking q = 1',
    'transform(q) changes expression while preserving q = 1',
    'prove(q) rejects any expression that breaks q = 1',
    'focus(B, φ) selects a local one without making it external to B',
    'closure(B, x) = normalize(B ⊕ unit(x)) under B = 1'
  ]);

  const integrity = Object.freeze([
    'The math is standalone before implementation.',
    'Implementation may compute a projection, but projection is not the authority.',
    'The page must show primitive math first.',
    'Debug state may be shown only as a current expression of the math.',
    'No implementation-generated symbol is allowed to replace the primitive law.'
  ]);

  const packet = Object.freeze({
    packet_type: '42ndMind_one_logic_canonical_math_v1',
    version: VERSION,
    title: 'One Logic Canonical Math',
    status: 'complete_standalone_math_first',
    primitive,
    coordinate,
    operators,
    integrity
  });

  function lines() {
    return primitive.concat([''], coordinate, [''], operators, [''], integrity);
  }

  function textBlock() {
    return lines().join('\n');
  }

  return Object.freeze({ VERSION, packet, primitive, coordinate, operators, integrity, lines, textBlock });
});
