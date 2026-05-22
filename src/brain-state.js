/* 42ndMind Clean Brain State
 * One owned state. No duplicated consciousness.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.1-clean-reset';

  function now() { return new Date().toISOString(); }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function arr(value) { return Array.isArray(value) ? value : []; }
  function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }
  function l1Total(dimensions) { return Number(arr(dimensions).reduce((s, d) => s + Math.abs(Number(d.weight) || 0), 0).toFixed(6)); }

  function normalizeUnitTotal(dimensions) {
    const rows = arr(dimensions).map(d => ({ dimension: String(d.dimension || d[0] || '').trim(), weight: Math.abs(Number(d.weight ?? d[1]) || 0) })).filter(d => d.dimension);
    const total = rows.reduce((s, d) => s + d.weight, 0) || 1;
    let running = 0;
    return rows.map((d, i) => {
      const weight = i === rows.length - 1 ? Number(Math.max(0, 1 - running).toFixed(6)) : Number((d.weight / total).toFixed(6));
      running += weight;
      return { dimension: d.dimension, weight };
    });
  }

  function createBrainState(seed) {
    const state = {
      version: VERSION,
      created_at: now(),
      updated_at: now(),
      doctrine: {
        one_brain: true,
        brain_owns_state: true,
        organs_are_not_separate_minds: true,
        no_duplicated_consciousness: true,
        communication_is_motor_output: true,
        no_final_truth_promotion: true
      },
      events: [],
      maturity: null,
      semanticBasis: null,
      neural: null,
      language: null,
      beliefMemory: null,
      truth: null,
      communication: null,
      autoplasticity: null
    };
    return Object.assign(state, clone(seed || {}));
  }

  global.FortySecondMindBrainState = Object.freeze({
    VERSION,
    now,
    clone,
    arr,
    clamp01,
    l1Total,
    normalizeUnitTotal,
    createBrainState
  });
})(typeof window !== 'undefined' ? window : globalThis);
