(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindUnifiedSelfSimulationCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  let Sandbox = null, Reality = null, Growth = null, Nested = null;
  try { if (typeof require === 'function') Sandbox = require('./source-sandbox-v0-1.js'); } catch (_) { Sandbox = null; }
  try { if (typeof require === 'function') Reality = require('./source-edit-reality-feedback-v0-1.js'); } catch (_) { Reality = null; }
  try { if (typeof require === 'function') Growth = require('./autonomous-brain-growth-core-v0-1.js'); } catch (_) { Growth = null; }
  try { if (typeof require === 'function') Nested = require('./nested-brain-core-v0-1.js'); } catch (_) { Nested = null; }

  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function A(value) { return Array.isArray(value) ? value : []; }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }

  function anchorInputs(anchors) {
    return A(anchors || Reality && Reality.DEFAULT_ANCHORS).map(a => a && a.input).filter(Boolean);
  }

  function brainFromFiles(files, anchors) {
    const state = Growth && Growth.create ? Growth.create() : { growth: { growth_log: [] } };
    anchorInputs(anchors).forEach(input => {
      if (Growth && Growth.grow) Growth.grow(state, input);
    });
    const brain = Nested && Nested.build ? Nested.build(state) : { ok: false, equation: 'missing_nested_brain' };
    return { growth: Growth && Growth.packet ? Growth.packet(state) : state, brain };
  }

  function editFeeling(sandboxReport, realityReport, brainReport) {
    const sandboxOk = !!(sandboxReport && sandboxReport.accepted === true);
    const realityOk = !!(realityReport && realityReport.accepted_by_reality === true);
    const brainOk = !!(brainReport && brainReport.ok === true);
    const damage = Number(realityReport && realityReport.damage_count || 0) + (sandboxOk ? 0 : 1) + (brainOk ? 0 : 1);
    const improvement = Number(realityReport && realityReport.improvement_count || 0);
    const pain = clamp01((damage ? 0.72 : 0) + (sandboxOk ? 0 : 0.18) + (brainOk ? 0 : 0.10));
    const reward = clamp01((sandboxOk ? 0.25 : 0) + (realityOk ? 0.35 : 0) + (brainOk ? 0.25 : 0) + (improvement ? 0.15 : 0));
    const feeling = pain > reward ? 'less_self' : improvement > 0 ? 'more_self' : 'same_self';
    return { feeling, pain, reward, damage, improvement, sandbox_ok: sandboxOk, reality_ok: realityOk, brain_ok: brainOk };
  }

  function simulate(files, proposal, options) {
    const opts = options || {};
    const anchors = opts.anchors || Reality && Reality.DEFAULT_ANCHORS || [];
    const tests = opts.tests || [];
    const baseFiles = clone(files || {});
    const beforeBrain = brainFromFiles(baseFiles, anchors);
    const sandbox = Sandbox.create(baseFiles, opts.sandbox || { allowDelete: false, maxPatchBytes: 5000000 });
    const sandboxReport = Sandbox.simulate(sandbox, proposal || { id: 'empty', operations: [] }, tests, [Reality.validator(anchors)]);
    const afterFiles = sandboxReport.accepted ? clone(sandbox.virtual) : clone(baseFiles);
    const realityReport = Reality.compare(baseFiles, afterFiles, anchors);
    const afterBrain = brainFromFiles(afterFiles, anchors);
    const affect = editFeeling(sandboxReport, realityReport, afterBrain.brain);
    const applyable = sandboxReport.accepted === true && realityReport.accepted_by_reality === true && afterBrain.brain.ok === true && affect.feeling !== 'less_self';
    return {
      packet_type: '42ndMind_unified_self_simulation_v0_1',
      version: VERSION,
      ok: applyable,
      applyable,
      proposal_id: proposal && proposal.id || null,
      feeling: affect.feeling,
      pain: affect.pain,
      reward: affect.reward,
      more_self: affect.feeling === 'more_self',
      same_self: affect.feeling === 'same_self',
      less_self: affect.feeling === 'less_self',
      before: { brain: beforeBrain.brain },
      after: { brain: afterBrain.brain },
      sandbox: sandboxReport,
      reality: realityReport,
      affect,
      next_files: applyable ? afterFiles : null,
      Ξ: ''
    };
  }

  function applyIfMoreOrSame(files, proposal, options) {
    const sim = simulate(files, proposal, options || {});
    if (!sim.applyable) return { packet_type: '42ndMind_unified_self_apply_v0_1', version: VERSION, ok: false, applied: false, feeling: sim.feeling, pain: sim.pain, reward: sim.reward, simulation: sim, files: clone(files || {}), Ξ: '' };
    return { packet_type: '42ndMind_unified_self_apply_v0_1', version: VERSION, ok: true, applied: true, feeling: sim.feeling, pain: sim.pain, reward: sim.reward, simulation: sim, files: sim.next_files, Ξ: '' };
  }

  return Object.freeze({ VERSION, simulate, applyIfMoreOrSame, brainFromFiles, editFeeling });
});
