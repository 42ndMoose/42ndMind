/* 42ndMind Growth Export
 * Saves kernel growth candidates as reviewable artifacts.
 *
 * This layer does not execute arbitrary source code and does not write GitHub files.
 * It packages before/after state, test results, substrate links, and a commit-ready
 * artifact so a human or GitHub-capable agent can review and commit the growth.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const DEFAULT_STORAGE_KEY = '42ndMind_growth_export_state_v0_1';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }
  function clone(v) { return global.FortySecondMindBrainState.clone(v); }
  function slug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9_./-]+/g, '_').replace(/^_+|_+$/g, '') || 'growth'; }

  function checksum(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value || null);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function ensure(state) {
    if (!state.growthExport) state.growthExport = {
      packet_type: '42ndMind_growth_export_v0_1',
      packet_version: VERSION,
      doctrine: {
        growth_is_provisional: true,
        no_auto_commit: true,
        no_arbitrary_code_execution: true,
        human_review_required: true,
        shared_substrate_link_required: true
      },
      candidates: [],
      test_records: [],
      commit_artifacts: [],
      saved_state_records: [],
      updated_at: now()
    };
    return state.growthExport;
  }

  function activate(state, packet) {
    if (!global.FortySecondMindSharedSubstrate) return null;
    const activation = global.FortySecondMindSharedSubstrate.activate(state, Object.assign({ source_organ: 'growth_export' }, packet || {}));
    return activation && activation.id;
  }

  function createCandidate(state, spec) {
    const box = ensure(state);
    const beforeState = clone(spec && spec.before_state || {});
    const afterState = clone(spec && spec.after_state || {});
    const targetPath = slug(spec && spec.target_path || 'data/growth-candidates/candidate.json');
    const candidate = {
      id: 'growth_candidate_' + (box.candidates.length + 1),
      kind: String(spec && spec.kind || 'state_growth_candidate'),
      target_path: targetPath,
      summary: String(spec && spec.summary || 'unspecified growth candidate'),
      before_state: beforeState,
      after_state: afterState,
      before_checksum: checksum(beforeState),
      after_checksum: checksum(afterState),
      expected_effect: String(spec && spec.expected_effect || 'unspecified'),
      source_event: spec && spec.source_event || null,
      shared_substrate_activation_id: null,
      test_status: 'untested',
      promotion_status: 'provisional_human_review_required',
      commit_ready: false,
      at: now()
    };
    candidate.shared_substrate_activation_id = activate(state, {
      source_event: candidate.source_event,
      kind: 'growth_export_candidate',
      term: candidate.kind,
      dimensions: [
        ['growth_candidate', 0.28],
        ['before_after_trace', 0.22],
        ['test_requirement', 0.2],
        ['shared_substrate_trace', 0.16],
        ['human_commit_gate', 0.14]
      ],
      status: 'growth_candidate_not_committed'
    });
    box.candidates.unshift(candidate);
    box.candidates = box.candidates.slice(0, 80);
    box.updated_at = now();
    return candidate;
  }

  function findCandidate(box, candidateId) {
    return arr(box.candidates).find(candidate => candidate.id === candidateId) || null;
  }

  function recordTestResult(state, candidateId, testResult) {
    const box = ensure(state);
    const candidate = findCandidate(box, candidateId);
    if (!candidate) return null;
    const tests = arr(testResult && testResult.checks);
    const failed = tests.filter(check => !check.passed).length;
    const record = {
      id: 'growth_test_' + (box.test_records.length + 1),
      candidate_id: candidate.id,
      test_name: String(testResult && testResult.test_name || 'growth-export-test'),
      checks: tests,
      passed_count: tests.filter(check => check.passed).length,
      failed_count: failed,
      status: failed === 0 ? 'passed' : 'failed',
      at: now()
    };
    candidate.test_status = record.status;
    candidate.commit_ready = record.status === 'passed';
    candidate.promotion_status = candidate.commit_ready ? 'exportable_for_human_review' : 'blocked_by_failed_test';
    box.test_records.unshift(record);
    box.test_records = box.test_records.slice(0, 120);
    activate(state, {
      source_event: candidate.source_event,
      kind: candidate.commit_ready ? 'growth_export_test_passed' : 'growth_export_test_failed',
      term: candidate.kind,
      dimensions: candidate.commit_ready
        ? [['test_passed', 0.32], ['export_ready', 0.26], ['human_review_required', 0.22], ['no_auto_commit', 0.2]]
        : [['test_failed', 0.34], ['promotion_blocked', 0.28], ['repair_required', 0.22], ['no_auto_commit', 0.16]],
      status: candidate.promotion_status
    });
    box.updated_at = now();
    return record;
  }

  function artifactPayload(candidate, testRecord) {
    return {
      packet_type: '42ndMind_growth_candidate_export_v0_1',
      candidate_id: candidate.id,
      kind: candidate.kind,
      summary: candidate.summary,
      target_path: candidate.target_path,
      expected_effect: candidate.expected_effect,
      before_checksum: candidate.before_checksum,
      after_checksum: candidate.after_checksum,
      shared_substrate_activation_id: candidate.shared_substrate_activation_id,
      test_status: candidate.test_status,
      promotion_status: candidate.promotion_status,
      commit_ready: candidate.commit_ready,
      exported_at: now(),
      before_state: candidate.before_state,
      after_state: candidate.after_state,
      test_record: testRecord || null
    };
  }

  function makePatchText(candidate, payloadText) {
    return [
      '--- /dev/null',
      '+++ b/' + candidate.target_path,
      '@@ exportable growth candidate @@',
      payloadText.split('\n').map(line => '+ ' + line).join('\n')
    ].join('\n');
  }

  function createCommitArtifact(state, candidateId) {
    const box = ensure(state);
    const candidate = findCandidate(box, candidateId);
    if (!candidate) return null;
    const testRecord = arr(box.test_records).find(record => record.candidate_id === candidate.id) || null;
    const payload = artifactPayload(candidate, testRecord);
    const payloadText = JSON.stringify(payload, null, 2);
    const artifact = {
      id: 'growth_commit_artifact_' + (box.commit_artifacts.length + 1),
      candidate_id: candidate.id,
      target_path: candidate.target_path,
      commit_ready: candidate.commit_ready,
      promotion_status: 'human_review_required',
      file_content: payloadText,
      patch_text: makePatchText(candidate, payloadText),
      instructions: 'Review file_content or patch_text. If acceptable, commit it as a saved growth candidate. This export does not modify GitHub by itself.',
      at: now()
    };
    box.commit_artifacts.unshift(artifact);
    box.commit_artifacts = box.commit_artifacts.slice(0, 80);
    box.updated_at = now();
    return artifact;
  }

  function exportState(state) {
    return JSON.stringify({ packet_type: '42ndMind_growth_export_state_v0_1', exported_at: now(), growthExport: ensure(state) }, null, 2);
  }

  function saveLocal(state, key) {
    if (!global.localStorage) return false;
    const box = ensure(state);
    const storageKey = key || DEFAULT_STORAGE_KEY;
    const payload = exportState(state);
    global.localStorage.setItem(storageKey, payload);
    box.saved_state_records.unshift({ key: storageKey, checksum: checksum(payload), at: now() });
    box.saved_state_records = box.saved_state_records.slice(0, 40);
    box.updated_at = now();
    return true;
  }

  global.FortySecondMindGrowthExport = Object.freeze({
    VERSION,
    DEFAULT_STORAGE_KEY,
    ensure,
    checksum,
    createCandidate,
    recordTestResult,
    createCommitArtifact,
    exportState,
    saveLocal
  });
})(typeof window !== 'undefined' ? window : globalThis);
