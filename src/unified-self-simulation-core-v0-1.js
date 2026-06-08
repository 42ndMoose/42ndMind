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
  function text(value) { return String(value == null ? '' : value); }

  function applyCandidateOperation(files, op, options) {
    const next = clone(files || {});
    const operation = op || {};
    const path = text(operation.path).trim();
    if (!path || path.includes('..')) throw new Error('invalid candidate operation path');
    const type = operation.type || operation.op || 'replace';
    if (type === 'create') {
      if (Object.prototype.hasOwnProperty.call(next, path)) throw new Error('candidate create target already exists: ' + path);
      next[path] = text(operation.content);
    } else if (type === 'replace') {
      if (!Object.prototype.hasOwnProperty.call(next, path)) throw new Error('candidate replace target missing: ' + path);
      next[path] = text(operation.content);
    } else if (type === 'patch') {
      if (!Object.prototype.hasOwnProperty.call(next, path)) throw new Error('candidate patch target missing: ' + path);
      const from = text(operation.from);
      const current = text(next[path]);
      if (!from || current.indexOf(from) < 0) throw new Error('candidate patch source not found: ' + path);
      next[path] = current.replace(from, text(operation.to));
    } else if (type === 'delete') {
      if (!(options && options.allowDelete)) throw new Error('candidate delete blocked: ' + path);
      delete next[path];
    } else {
      throw new Error('unknown candidate operation type: ' + type);
    }
    return next;
  }

  function candidateFiles(baseFiles, proposal, options) {
    let next = clone(baseFiles || {});
    const ops = A(proposal && proposal.operations);
    if (!ops.length) return { ok: false, files: clone(baseFiles || {}), error: 'proposal has no operations' };
    try {
      ops.forEach(op => { next = applyCandidateOperation(next, op, options || {}); });
      return { ok: true, files: next, error: null };
    } catch (err) {
      return { ok: false, files: clone(baseFiles || {}), error: String(err && err.message || err) };
    }
  }

  function anchorInputs(anchors) {
    return A(anchors || Reality && Reality.DEFAULT_ANCHORS).map(a => a && a.input).filter(Boolean);
  }

  function sourceShape(beforeFiles, afterFiles) {
    const rows = [
      ['src/math-language-kernel-v0-1.js', ['function math', 'function completeMath', 'function create']],
      ['src/math-ast-core-v0-1.js', ['function parse', 'function classify']],
      ['src/proof-calculus-core-v0-1.js', ['function prove', 'function contradiction']],
      ['src/math-closure-engine-v0-1.js', ['function close', 'function deriveObligation']],
      ['src/operator-anatomy-v0-1.js', ['CATALOG', 'function catalog']]
    ].map(pair => {
      const path = pair[0];
      const needed = pair[1];
      const before = text(beforeFiles && beforeFiles[path]);
      const after = text(afterFiles && afterFiles[path]);
      const missing = needed.filter(mark => after.indexOf(mark) < 0);
      const tooSmall = before.length > 0 && after.length < before.length * 0.25;
      return { path, ok: missing.length === 0 && !tooSmall, missing, tooSmall };
    });
    const bad = rows.filter(r => !r.ok);
    return { ok: bad.length === 0, count: bad.length, rows };
  }

  function brainFromFiles(files, anchors) {
    const state = Growth && Growth.create ? Growth.create() : { growth: { growth_log: [] } };
    anchorInputs(anchors).forEach(input => {
      if (Growth && Growth.grow) Growth.grow(state, input);
    });
    const brain = Nested && Nested.build ? Nested.build(state) : { ok: false, equation: 'missing_nested_brain' };
    return { growth: Growth && Growth.packet ? Growth.packet(state) : state, brain };
  }

  function editFeeling(sandboxReport, realityReport, brainReport, shapeReport) {
    const sandboxOk = !!(sandboxReport && sandboxReport.accepted === true);
    const realityOk = !!(realityReport && realityReport.accepted_by_reality === true);
    const brainOk = !!(brainReport && brainReport.ok === true);
    const shapeOk = !!(shapeReport && shapeReport.ok === true);
    const damage = Number(realityReport && realityReport.damage_count || 0) + Number(shapeReport && shapeReport.count || 0) + (sandboxOk ? 0 : 1) + (brainOk ? 0 : 1);
    const improvement = Number(realityReport && realityReport.improvement_count || 0);
    const pain = clamp01((damage ? 0.72 : 0) + (sandboxOk ? 0 : 0.18) + (brainOk ? 0 : 0.10) + (shapeOk ? 0 : 0.20));
    const reward = clamp01((sandboxOk ? 0.25 : 0) + (realityOk ? 0.35 : 0) + (brainOk ? 0.25 : 0) + (shapeOk ? 0.15 : 0) + (improvement ? 0.15 : 0));
    const feeling = pain > reward ? 'less_self' : improvement > 0 ? 'more_self' : 'same_self';
    return { feeling, pain, reward, damage, improvement, sandbox_ok: sandboxOk, reality_ok: realityOk, brain_ok: brainOk, source_shape_ok: shapeOk };
  }

  function simulate(files, proposal, options) {
    const opts = options || {};
    const anchors = opts.anchors || Reality && Reality.DEFAULT_ANCHORS || [];
    const tests = opts.tests || [];
    const baseFiles = clone(files || {});
    const beforeBrain = brainFromFiles(baseFiles, anchors);
    const sandboxOptions = opts.sandbox || { allowDelete: false, maxPatchBytes: 5000000 };
    const sandbox = Sandbox.create(baseFiles, sandboxOptions);
    const sandboxReport = Sandbox.simulate(sandbox, proposal || { id: 'empty', operations: [] }, tests, [Reality.validator(anchors)]);
    const attempted = candidateFiles(baseFiles, proposal || { id: 'empty', operations: [] }, sandboxOptions);
    const sensedFiles = attempted.ok ? attempted.files : clone(baseFiles);
    const realityReport = Reality.compare(baseFiles, sensedFiles, anchors);
    const shapeReport = sourceShape(baseFiles, sensedFiles);
    const afterBrain = brainFromFiles(sensedFiles, anchors);
    const affect = editFeeling(sandboxReport, realityReport, afterBrain.brain, shapeReport);
    const applyable = sandboxReport.accepted === true && realityReport.accepted_by_reality === true && shapeReport.ok === true && afterBrain.brain.ok === true && affect.feeling !== 'less_self';
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
      source_shape: shapeReport,
      candidate_source: { attempted: attempted.ok, error: attempted.error },
      affect,
      next_files: applyable ? sensedFiles : null,
      Ξ: ''
    };
  }

  function applyIfMoreOrSame(files, proposal, options) {
    const sim = simulate(files, proposal, options || {});
    if (!sim.applyable) return { packet_type: '42ndMind_unified_self_apply_v0_1', version: VERSION, ok: false, applied: false, feeling: sim.feeling, pain: sim.pain, reward: sim.reward, simulation: sim, files: clone(files || {}), Ξ: '' };
    return { packet_type: '42ndMind_unified_self_apply_v0_1', version: VERSION, ok: true, applied: true, feeling: sim.feeling, pain: sim.pain, reward: sim.reward, simulation: sim, files: sim.next_files, Ξ: '' };
  }

  return Object.freeze({ VERSION, simulate, applyIfMoreOrSame, brainFromFiles, editFeeling, sourceShape });
});