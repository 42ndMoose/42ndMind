(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindSourceSandbox = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';

  function clone(value) {
    return JSON.parse(JSON.stringify(value == null ? null : value));
  }

  function text(value) {
    return String(value == null ? '' : value);
  }

  function checksum(value) {
    const src = text(value);
    let hash = 2166136261;
    for (let i = 0; i < src.length; i += 1) {
      hash ^= src.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  function create(files, options) {
    const state = {
      packet_type: '42ndMind_source_sandbox_v0_1',
      version: VERSION,
      base: clone(files || {}),
      virtual: clone(files || {}),
      options: Object.assign({ allowDelete: false, maxPatchBytes: 250000 }, options || {}),
      proposals: [],
      reports: [],
      accepted: [],
      rejected: [],
      ξ: ''
    };
    return state;
  }

  function summarize(files) {
    const out = {};
    Object.keys(files || {}).sort().forEach(path => {
      out[path] = { bytes: text(files[path]).length, checksum: checksum(files[path]) };
    });
    return out;
  }

  function applyOperation(files, op, options) {
    const next = clone(files || {});
    const operation = op || {};
    const path = text(operation.path).trim();
    if (!path) throw new Error('operation missing path');
    if (path.includes('..')) throw new Error('operation path may not contain ..');
    const type = operation.type || operation.op || 'replace';

    if (type === 'create') {
      if (Object.prototype.hasOwnProperty.call(next, path)) throw new Error('create target already exists: ' + path);
      next[path] = text(operation.content);
    } else if (type === 'replace') {
      if (!Object.prototype.hasOwnProperty.call(next, path)) throw new Error('replace target missing: ' + path);
      next[path] = text(operation.content);
    } else if (type === 'patch') {
      if (!Object.prototype.hasOwnProperty.call(next, path)) throw new Error('patch target missing: ' + path);
      const from = text(operation.from);
      const to = text(operation.to);
      const current = text(next[path]);
      if (!from) throw new Error('patch missing from text: ' + path);
      if (!current.includes(from)) throw new Error('patch from text not found: ' + path);
      next[path] = current.replace(from, to);
    } else if (type === 'delete') {
      if (!options.allowDelete) throw new Error('delete blocked by sandbox policy: ' + path);
      delete next[path];
    } else {
      throw new Error('unknown operation type: ' + type);
    }

    const size = Object.values(next).reduce((sum, value) => sum + text(value).length, 0);
    if (size > options.maxPatchBytes) throw new Error('virtual source exceeds maxPatchBytes');
    return next;
  }

  function applyProposal(files, proposal, options) {
    let next = clone(files || {});
    const ops = Array.isArray(proposal && proposal.operations) ? proposal.operations : [];
    if (!ops.length) throw new Error('proposal has no operations');
    ops.forEach(op => { next = applyOperation(next, op, options || {}); });
    return next;
  }

  function makeRequire(files, cache) {
    const moduleCache = cache || {};
    function normalizePath(base, request) {
      if (!request.startsWith('.')) return request;
      const parts = base.split('/');
      parts.pop();
      request.split('/').forEach(part => {
        if (!part || part === '.') return;
        if (part === '..') parts.pop();
        else parts.push(part);
      });
      let out = parts.join('/');
      if (!/\.js$/.test(out)) out += '.js';
      return out.replace(/^\.\//, '');
    }
    function localRequire(fromPath) {
      return function(req) {
        const path = normalizePath(fromPath, req);
        if (!Object.prototype.hasOwnProperty.call(files, path)) throw new Error('module not found: ' + path);
        if (moduleCache[path]) return moduleCache[path].exports;
        const module = { exports: {} };
        moduleCache[path] = module;
        const fn = new Function('require', 'module', 'exports', files[path] + '\n//# sourceURL=' + path);
        fn(localRequire(path), module, module.exports);
        return module.exports;
      };
    }
    return localRequire;
  }

  function runTest(files, testPath) {
    const cache = {};
    const requireFrom = makeRequire(files, cache);
    const logs = [];
    const assert = function(condition, message) {
      if (!condition) throw new Error(message || 'assertion failed');
    };
    assert.equal = function(a, b, message) { if (a != b) throw new Error(message || (a + ' != ' + b)); };
    assert.strictEqual = function(a, b, message) { if (a !== b) throw new Error(message || (a + ' !== ' + b)); };
    const module = { exports: {} };
    const localRequire = function(req) {
      if (req === 'assert') return assert;
      return requireFrom(testPath)(req);
    };
    const fn = new Function('require', 'module', 'exports', 'console', text(files[testPath]) + '\n//# sourceURL=' + testPath);
    fn(localRequire, module, module.exports, { log: msg => logs.push(text(msg)), error: msg => logs.push(text(msg)) });
    return { path: testPath, ok: true, logs };
  }

  function runTests(files, tests) {
    const results = [];
    (tests || []).forEach(path => {
      try {
        if (!Object.prototype.hasOwnProperty.call(files, path)) throw new Error('test missing: ' + path);
        results.push(runTest(files, path));
      } catch (err) {
        results.push({ path, ok: false, error: String(err && err.stack || err) });
      }
    });
    return results;
  }

  function invariantReport(files, validators) {
    const results = [];
    (validators || []).forEach((validator, index) => {
      try {
        const r = validator(clone(files));
        results.push(Object.assign({ id: 'validator_' + (index + 1), ok: true }, r || {}));
      } catch (err) {
        results.push({ id: 'validator_' + (index + 1), ok: false, error: String(err && err.message || err) });
      }
    });
    return results;
  }

  function simulate(state, proposal, tests, validators) {
    const before = summarize(state.virtual);
    const report = {
      id: proposal && proposal.id || 'proposal_' + (state.proposals.length + 1),
      status: 'simulated',
      before,
      after: null,
      changed: [],
      tests: [],
      validators: [],
      accepted: false,
      chaos: [],
      ξ: ''
    };

    try {
      const next = applyProposal(state.virtual, proposal, state.options);
      report.after = summarize(next);
      report.changed = Object.keys(report.after).filter(path => !before[path] || before[path].checksum !== report.after[path].checksum)
        .concat(Object.keys(before).filter(path => !report.after[path]));
      report.tests = runTests(next, tests || []);
      report.validators = invariantReport(next, validators || []);
      report.chaos = report.tests.filter(r => !r.ok).map(r => 'test_failed:' + r.path)
        .concat(report.validators.filter(r => !r.ok).map(r => 'validator_failed:' + r.id));
      report.accepted = report.chaos.length === 0;
      if (report.accepted) {
        state.virtual = next;
        state.accepted.push(report.id);
      } else {
        state.rejected.push(report.id);
      }
    } catch (err) {
      report.status = 'blocked';
      report.error = String(err && err.stack || err);
      report.chaos.push('proposal_blocked');
      state.rejected.push(report.id);
    }

    state.proposals.push(clone(proposal));
    state.reports.unshift(report);
    state.reports = state.reports.slice(0, 128);
    return report;
  }

  function reset(state) {
    state.virtual = clone(state.base);
    state.reports = [];
    state.proposals = [];
    state.accepted = [];
    state.rejected = [];
    state.ξ = '';
    return state;
  }

  function exportPatch(report) {
    if (!report || !report.accepted) return { ok: false, reason: 'report not accepted', patch: [] };
    return { ok: true, id: report.id, changed: clone(report.changed), note: 'simulation accepted; real source patch still requires external write gate' };
  }

  return Object.freeze({
    VERSION,
    create,
    simulate,
    reset,
    summarize,
    exportPatch,
    applyProposal,
    runTests
  });
});
