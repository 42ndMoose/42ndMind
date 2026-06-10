#!/usr/bin/env node
'use strict';

const fs = require('fs');

const OUT_PATH = 'artifacts/stable-expression-freshness-check-v0-1.json';
const STAMP = 'current_body_rebase_audit_v0_2';

function readJson(path) {
  try { return JSON.parse(fs.readFileSync(path, 'utf8')); }
  catch (err) { throw new Error(`${path}: ${err.message}`); }
}

function includes(list, value) { return Array.isArray(list) && list.includes(value); }
function array(value) { return Array.isArray(value) ? value : []; }

function fail(message, details) {
  const packet = { packet_type: '42ndMind_stable_expression_freshness_check_v0_1', ok: false, failure: message, details: details || {}, empty_text: '' };
  fs.writeFileSync(OUT_PATH, JSON.stringify(packet, null, 2) + '\n');
  throw new Error(message);
}

function requireOk(condition, message, details) {
  if (!condition) fail(message, details);
}

function main() {
  const summary = readJson('artifacts/latest-one-logic-stable-expression-summary-v0-1.json');
  const expression = readJson('artifacts/latest-one-logic-stable-expression-v0-1.json');
  const state = readJson('artifacts/latest-one-logic-stable-state-v0-1.json');
  const promotion = readJson('artifacts/latest-one-logic-source-promotion-proposal-v0-1.json');
  const unitBrain = readJson('artifacts/latest-recursive-unit-brain-projection-v0-1.json');

  const summaryGate = summary.objective_reality_gate || {};
  const expressionGate = expression.objective_reality_gate || {};
  const promotionGate = promotion.expression_digest && promotion.expression_digest.objective_reality_gate || {};
  const livePaths = summary.live_source_paths || [];
  const alreadyPromotedIds = (promotion.already_promoted || []).map(row => row.id);
  const stateFiles = state.state && state.state.files || {};
  const rebase = state.state && state.state.body_rebase || {};
  const rebaseApplied = rebase.applied === true && rebase.audit_stamp === STAMP;
  const summaryStartedCurrent = summary.source_body_current_at_start === true;
  const stateStartedCurrent = state.source_body_current_at_start === true;
  const sourceBodyMode = summaryStartedCurrent && stateStartedCurrent ? 'started_current_body' : rebaseApplied ? 'rebased_onto_current_body' : 'invalid_or_stale_body';
  const summaryUnit = summary.recursive_unit_brain_projection || {};
  const stateUnit = state.recursive_unit_brain_projection || {};

  requireOk(summary.audit_stamp === STAMP, 'stable summary is missing current-body audit stamp', { actual: summary.audit_stamp });
  requireOk(state.audit_stamp === STAMP, 'stable state is missing current-body audit stamp', { actual: state.audit_stamp });
  requireOk(summary.mutation_budget === 32 && summary.min_mutation_depth === 8, 'stable summary mutation depth is stale', { mutation_budget: summary.mutation_budget, min_mutation_depth: summary.min_mutation_depth });
  requireOk(state.mutation_budget === 32 && state.min_mutation_depth === 8, 'stable state mutation depth is stale', { mutation_budget: state.mutation_budget, min_mutation_depth: state.min_mutation_depth });
  requireOk(includes(livePaths, 'src/proof-obligation-engine-v0-1.js'), 'stable summary live source body omits proof-obligation engine', { live_source_paths: livePaths });
  requireOk(includes(livePaths, 'src/recursive-unit-brain-core-v0-1.js'), 'stable summary live source body omits recursive unit brain core', { live_source_paths: livePaths });
  requireOk(typeof stateFiles['src/proof-obligation-engine-v0-1.js'] === 'string', 'stable state source body omits proof-obligation engine', { state_file_count: Object.keys(stateFiles).length });
  requireOk(typeof stateFiles['src/recursive-unit-brain-core-v0-1.js'] === 'string', 'stable state source body omits recursive unit brain core', { state_file_count: Object.keys(stateFiles).length });
  requireOk(summaryStartedCurrent || rebaseApplied, 'stable summary lacks current-body or verified-rebase evidence', { source_body_current_at_start: summary.source_body_current_at_start, changed: array(summary.source_body_changed_paths), missing: array(summary.source_body_missing_paths), rebase });
  requireOk(stateStartedCurrent || rebaseApplied, 'stable state lacks current-body or verified-rebase evidence', { source_body_current_at_start: state.source_body_current_at_start, changed: array(state.source_body_changed_paths), missing: array(state.source_body_missing_paths), rebase });
  requireOk(!array(summary.source_body_missing_paths).length && !array(state.source_body_missing_paths).length, 'stable artifact has missing live source paths after run', { summary_missing: array(summary.source_body_missing_paths), state_missing: array(state.source_body_missing_paths) });
  requireOk(includes(summaryGate.rule_sources, 'proof_obligation_engine'), 'stable summary reality gate lacks proof_obligation_engine', { rule_sources: summaryGate.rule_sources });
  requireOk(includes(expressionGate.rule_sources, 'proof_obligation_engine'), 'stable expression reality gate lacks proof_obligation_engine', { rule_sources: expressionGate.rule_sources });
  requireOk(includes(promotionGate.rule_sources, 'proof_obligation_engine'), 'source-promotion digest was built from stale reality gate', { rule_sources: promotionGate.rule_sources });
  requireOk(includes(expressionGate.operator_families, 'division_identity'), 'stable expression lacks division obligation family', { operator_families: expressionGate.operator_families });
  requireOk(includes(expressionGate.operator_families, 'sqrt_square_identity'), 'stable expression lacks sqrt-square obligation family', { operator_families: expressionGate.operator_families });
  requireOk(includes(alreadyPromotedIds, 'proof_obligation_engine'), 'source-promotion proposal does not classify proof obligation engine as already promoted', { already_promoted: alreadyPromotedIds });
  requireOk(unitBrain.packet_type === '42ndMind_recursive_unit_brain_projection_v0_1' && unitBrain.ok === true, 'recursive unit brain projection is missing or invalid', { packet_type: unitBrain.packet_type, ok: unitBrain.ok, unit_violation_count: unitBrain.unit_violation_count });
  requireOk(summaryUnit.ok === true && stateUnit.ok === true, 'stable artifacts do not carry recursive unit brain projection', { summary_unit: summaryUnit, state_unit: stateUnit });
  requireOk(unitBrain.root && unitBrain.root.id === 'one_logic_brain', 'recursive unit brain projection is not the one logic brain', { root: unitBrain.root && unitBrain.root.id });
  requireOk(unitBrain.unit_violation_count === 0 && unitBrain.kernel_error === 0, 'recursive unit brain has kernel/unit error', { kernel_error: unitBrain.kernel_error, unit_violation_count: unitBrain.unit_violation_count });
  requireOk(unitBrain.node_count > 10 && unitBrain.max_depth >= 3, 'recursive unit brain did not materialize nested one-total structure', { node_count: unitBrain.node_count, max_depth: unitBrain.max_depth });

  const packet = {
    packet_type: '42ndMind_stable_expression_freshness_check_v0_1',
    ok: true,
    audit_stamp: STAMP,
    source_body_mode: sourceBodyMode,
    mutation_budget: summary.mutation_budget,
    min_mutation_depth: summary.min_mutation_depth,
    source_body_current_at_start: summary.source_body_current_at_start,
    source_body_changed_paths: array(summary.source_body_changed_paths),
    source_body_missing_paths: array(summary.source_body_missing_paths),
    rule_sources: expressionGate.rule_sources || [],
    operator_families: expressionGate.operator_families || [],
    recursive_unit_brain_projection: {
      ok: unitBrain.ok,
      principle: unitBrain.principle,
      node_count: unitBrain.node_count,
      max_depth: unitBrain.max_depth,
      vague_mass: unitBrain.vague_mass,
      kernel_error: unitBrain.kernel_error
    },
    already_promoted: alreadyPromotedIds,
    empty_text: ''
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(packet, null, 2) + '\n');
  console.log(JSON.stringify(packet, null, 2));
}

try { if (require.main === module) main(); }
catch (err) {
  console.log(String(err && err.stack || err));
  process.exit(1);
}
