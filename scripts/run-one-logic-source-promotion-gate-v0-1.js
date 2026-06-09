#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const LIVE_SOURCE_PATH = path.join(ROOT, 'src/live-self-dynamics-core-v0-1.js');
const REALITY_SOURCE_PATH = path.join(ROOT, 'src/objective-reality-contact-gate-v0-1.js');
const OBLIGATION_SOURCE_PATH = path.join(ROOT, 'src/proof-obligation-engine-v0-1.js');
const REALITY_TEST_PATH = path.join(ROOT, 'tests/objective-reality-contact-gate-v0-1-test.js');
const OBLIGATION_TEST_PATH = path.join(ROOT, 'tests/proof-obligation-engine-v0-1-test.js');
const STATE_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-state-v0-1.json');
const EXPRESSION_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-expression-v0-1.json');
const OUT_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-source-promotion-proposal-v0-1.json');

function readText(filePath) {
  try { return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''; }
  catch (err) { return ''; }
}

function readJsonPacket(filePath) {
  if (!fs.existsSync(filePath)) return { ok: false, value: null, error: 'missing_file', path: filePath };
  try { return { ok: true, value: JSON.parse(fs.readFileSync(filePath, 'utf8')), error: null, path: filePath }; }
  catch (err) { return { ok: false, value: null, error: String(err && err.message || err), path: filePath }; }
}

function sourceHas(source, needle) {
  return String(source || '').includes(needle);
}

function arr(value) { return Array.isArray(value) ? value : []; }

function stateOnlyRows(statePacket, expression) {
  const state = statePacket && statePacket.state || {};
  const internal = state.internal_state || {};
  const math = expression && expression.math_language_completion || {};
  return [
    { id: 'generation', value: internal.generation || statePacket && statePacket.generation || 0, reason: 'generation is runtime age, not reusable source law' },
    { id: 't', value: state.t || statePacket && statePacket.t || 0, reason: 'time index is state memory, not source law' },
    { id: 'symbol_count', value: math.symbol_count || arr(internal.symbols).length || 0, reason: 'symbol accumulation belongs in saved memory/state' },
    { id: 'relation_count', value: math.relation_count || arr(internal.relations).length || 0, reason: 'relation accumulation belongs in saved memory/state' },
    { id: 'mutation_count', value: math.mutation_count || arr(internal.mutations).length || 0, reason: 'mutation count is history, not source law' },
    { id: 'virtual_edit_count', value: math.virtual_edit_count || arr(internal.virtual_edits).length || 0, reason: 'virtual edits are simulated body memory unless generalized into a rule' },
    { id: 'pressure_relief', value: internal.pressure_relief || null, reason: 'relief value is current nervous-state, not source law' }
  ];
}

function candidateRows(sources, expression) {
  const liveSource = sources.live || '';
  const realitySource = sources.reality || '';
  const obligationSource = sources.obligations || '';
  const realityTest = sources.realityTest || '';
  const obligationTest = sources.obligationTest || '';
  const rows = [];
  const pressure = expression && expression.pressure_differentiation || null;

  if (pressure) {
    rows.push({
      id: 'causal_pressure_differentiation',
      kind: 'general_rule',
      source_worthy: true,
      already_in_source: sourceHas(liveSource, 'function differentiatePressureByConsequence('),
      evidence: {
        principle: pressure.principle,
        kind: pressure.kind,
        blocking_pressure: pressure.blocking_pressure,
        generative_pressure: pressure.generative_pressure,
        interpretation: pressure.interpretation
      },
      promotion_rule: 'promote because it distinguishes a signal by downstream consequence, not by a memorized scalar state'
    });
  }

  const hasProofObligationEngine = sourceHas(obligationSource, 'function divisionIdentity(')
    && sourceHas(obligationSource, 'function sqrtSquare(')
    && sourceHas(obligationSource, 'function strictOrder(')
    && sourceHas(obligationSource, 'function universalIdentity(')
    && sourceHas(obligationSource, 'function analyze(');

  if (hasProofObligationEngine) {
    rows.push({
      id: 'proof_obligation_engine',
      kind: 'general_meta_gate',
      source_worthy: true,
      already_in_source: true,
      evidence: {
        principle: 'operators_create_truth_obligations_before_verdicts_are_assigned',
        structural_families: ['numeric_relation', 'division_identity', 'sqrt_square_identity', 'equality_transitivity', 'strict_order_transitivity', 'universal_additive_identity'],
        test_requires_obligations: sourceHas(obligationTest, 'obligations[0].satisfied') && sourceHas(obligationTest, 'missing_conditions') && sourceHas(obligationTest, 'operator_families'),
        reality_gate_delegates_to_engine: sourceHas(realitySource, "Obligations.analyze(input)") || sourceHas(realitySource, 'Obligations.analyze')
      },
      promotion_rule: 'promote because the language must derive verdicts from operator-created obligations rather than hand-coded case answers'
    });
  }

  const gate = expression && expression.objective_reality_gate || null;
  if (gate) {
    rows.push({
      id: 'objective_language_reality_gate_runtime_contact',
      kind: 'general_gate_runtime_result',
      source_worthy: true,
      already_in_source: sourceHas(liveSource, 'function objectiveLanguageRealityGate('),
      evidence: {
        status: gate.status,
        score: gate.score,
        pass_count: gate.pass_count,
        case_count: gate.case_count,
        verdict_classes: gate.verdict_classes || [],
        rule_sources: gate.rule_sources || [],
        operator_families: gate.operator_families || [],
        failures: gate.failures || []
      },
      promotion_rule: 'promote because live completion must depend on adversarial reality contact, not only self-generated closure'
    });
  }

  const objectiveStatus = expression && expression.objective_completion_status || null;
  if (objectiveStatus) {
    rows.push({
      id: 'objective_completion_status_classifier',
      kind: 'general_status_rule',
      source_worthy: true,
      already_in_source: sourceHas(liveSource, 'objective_completion_status'),
      evidence: { objective_completion_status: objectiveStatus },
      promotion_rule: 'promote because internal completion and adversarially-contacted completion must be separate statuses'
    });
  }

  return rows;
}

function buildPacket() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const sources = {
    live: readText(LIVE_SOURCE_PATH),
    reality: readText(REALITY_SOURCE_PATH),
    obligations: readText(OBLIGATION_SOURCE_PATH),
    realityTest: readText(REALITY_TEST_PATH),
    obligationTest: readText(OBLIGATION_TEST_PATH)
  };
  const stateRead = readJsonPacket(STATE_PATH);
  const expressionRead = readJsonPacket(EXPRESSION_PATH);
  const statePacket = stateRead.value;
  const expression = expressionRead.value;
  const candidates = candidateRows(sources, expression);
  const sourceReady = candidates.filter(c => c.source_worthy && !c.already_in_source);
  const alreadyPromoted = candidates.filter(c => c.source_worthy && c.already_in_source);
  const stateOnly = stateOnlyRows(statePacket, expression);
  const realityGate = expression && expression.objective_reality_gate || null;
  const artifactProblems = [stateRead, expressionRead].filter(x => !x.ok).map(x => ({ path: path.relative(ROOT, x.path), error: x.error }));
  const decision = sourceReady.length
    ? 'source_promotion_candidates_pending_review'
    : alreadyPromoted.length
      ? 'source_principles_already_promoted_state_saved_as_memory'
      : 'no_source_worthy_rule_detected';

  return {
    packet_type: '42ndMind_one_logic_source_promotion_gate_v0_1',
    ok: true,
    decision,
    artifact_problem_count: artifactProblems.length,
    artifact_problems: artifactProblems,
    source_ready_count: sourceReady.length,
    already_promoted_count: alreadyPromoted.length,
    state_only_count: stateOnly.length,
    objective_completion_status: expression && expression.objective_completion_status || null,
    objective_reality_gate_status: realityGate ? realityGate.status : null,
    rules: [
      'promote only reusable rules or gates into source',
      'save generation, symbols, relations, pressure relief, and virtual edits as state memory',
      'do not promote scalar optimal-state values into source',
      'require adversarial reality contact before objective completion becomes source-trustworthy',
      'operator-created obligations are source-worthy when they generalize beyond exact strings',
      'all source promotion remains proposal-first, not automatic self-rewrite'
    ],
    source_ready: sourceReady,
    already_promoted: alreadyPromoted,
    state_only: stateOnly,
    state_memory: statePacket ? {
      available: true,
      generation: statePacket.generation,
      t: statePacket.t,
      score: statePacket.score,
      objective_completion_status: statePacket.objective_completion_status,
      mutation_budget: statePacket.mutation_budget || null,
      iterations_this_run: statePacket.iterations_this_run || null,
      stop_reason: statePacket.stop_reason || null
    } : { available: false },
    expression_digest: expression ? {
      expression: expression.expression,
      pressure: expression.pressure,
      pressure_differentiation: expression.pressure_differentiation || null,
      objective_reality_gate: expression.objective_reality_gate || null,
      math_language_completion: expression.math_language_completion || null,
      next_self_generated_obstruction: expression.next_self_generated_obstruction || null
    } : null,
    empty_text: ''
  };
}

function main() {
  const packet = buildPacket();
  fs.writeFileSync(OUT_PATH, JSON.stringify(packet, null, 2) + '\n');
  console.log(JSON.stringify(packet, null, 2));
}

try { if (require.main === module) main(); }
catch (err) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const packet = { packet_type: '42ndMind_one_logic_source_promotion_gate_v0_1', ok: false, decision: 'source_promotion_gate_runtime_error', error: String(err && err.stack || err), empty_text: '' };
  fs.writeFileSync(OUT_PATH, JSON.stringify(packet, null, 2) + '\n');
  console.log(JSON.stringify(packet, null, 2));
  process.exit(1);
}
