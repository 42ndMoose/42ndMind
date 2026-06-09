#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts');
const SOURCE_PATH = path.join(ROOT, 'src/live-self-dynamics-core-v0-1.js');
const STATE_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-state-v0-1.json');
const EXPRESSION_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-stable-expression-v0-1.json');
const OUT_PATH = path.join(ARTIFACT_DIR, 'latest-one-logic-source-promotion-proposal-v0-1.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sourceHas(source, needle) {
  return String(source || '').includes(needle);
}

function stateOnlyRows(statePacket, expression) {
  const state = statePacket && statePacket.state || {};
  const internal = state.internal_state || {};
  const math = expression && expression.math_language_completion || {};
  return [
    { id: 'generation', value: internal.generation || statePacket && statePacket.generation || 0, reason: 'generation is runtime age, not reusable source law' },
    { id: 't', value: state.t || statePacket && statePacket.t || 0, reason: 'time index is state memory, not source law' },
    { id: 'symbol_count', value: math.symbol_count || (internal.symbols || []).length || 0, reason: 'symbol accumulation belongs in saved memory/state' },
    { id: 'relation_count', value: math.relation_count || (internal.relations || []).length || 0, reason: 'relation accumulation belongs in saved memory/state' },
    { id: 'mutation_count', value: math.mutation_count || (internal.mutations || []).length || 0, reason: 'mutation count is history, not source law' },
    { id: 'virtual_edit_count', value: math.virtual_edit_count || (internal.virtual_edits || []).length || 0, reason: 'virtual edits are simulated body memory unless generalized into a rule' },
    { id: 'pressure_relief', value: internal.pressure_relief || null, reason: 'relief value is current nervous-state, not source law' }
  ];
}

function candidateRows(source, expression) {
  const rows = [];
  const pressure = expression && expression.pressure_differentiation || null;
  if (pressure) {
    rows.push({
      id: 'causal_pressure_differentiation',
      kind: 'general_rule',
      source_worthy: true,
      already_in_source: sourceHas(source, 'function differentiatePressureByConsequence('),
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

  const gate = expression && expression.objective_reality_gate || null;
  if (gate) {
    rows.push({
      id: 'objective_language_reality_gate',
      kind: 'general_gate',
      source_worthy: true,
      already_in_source: sourceHas(source, 'function objectiveLanguageRealityGate('),
      evidence: {
        status: gate.status,
        score: gate.score,
        pass_count: gate.pass_count,
        case_count: gate.case_count,
        failures: gate.failures || []
      },
      promotion_rule: 'promote because objective completion must survive external math contact, not only self-generated closure'
    });
  }

  const objectiveStatus = expression && expression.objective_completion_status || null;
  if (objectiveStatus) {
    rows.push({
      id: 'objective_completion_status_classifier',
      kind: 'general_status_rule',
      source_worthy: true,
      already_in_source: sourceHas(source, 'objective_completion_status'),
      evidence: { objective_completion_status: objectiveStatus },
      promotion_rule: 'promote because internal completion and externally-contacted completion must be separate statuses'
    });
  }

  return rows;
}

function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const source = fs.existsSync(SOURCE_PATH) ? fs.readFileSync(SOURCE_PATH, 'utf8') : '';
  const statePacket = readJson(STATE_PATH);
  const expression = readJson(EXPRESSION_PATH);
  const candidates = candidateRows(source, expression);
  const sourceReady = candidates.filter(c => c.source_worthy && !c.already_in_source);
  const alreadyPromoted = candidates.filter(c => c.source_worthy && c.already_in_source);
  const stateOnly = stateOnlyRows(statePacket, expression);
  const realityGate = expression && expression.objective_reality_gate || null;
  const decision = sourceReady.length
    ? 'source_promotion_candidates_pending_review'
    : alreadyPromoted.length
      ? 'source_principles_already_promoted_state_saved_as_memory'
      : 'no_source_worthy_rule_detected';

  const packet = {
    packet_type: '42ndMind_one_logic_source_promotion_gate_v0_1',
    decision,
    source_ready_count: sourceReady.length,
    already_promoted_count: alreadyPromoted.length,
    state_only_count: stateOnly.length,
    objective_completion_status: expression && expression.objective_completion_status || null,
    objective_reality_gate_status: realityGate ? realityGate.status : null,
    rules: [
      'promote only reusable rules or gates into source',
      'save generation, symbols, relations, pressure relief, and virtual edits as state memory',
      'do not promote scalar optimal-state values into source',
      'require external reality contact before objective completion becomes source-trustworthy',
      'all source promotion remains proposal-first, not automatic self-rewrite'
    ],
    source_ready,
    already_promoted: alreadyPromoted,
    state_only,
    state_memory: statePacket ? {
      available: true,
      generation: statePacket.generation,
      t: statePacket.t,
      score: statePacket.score,
      objective_completion_status: statePacket.objective_completion_status
    } : { available: false },
    expression_digest: expression ? {
      expression: expression.expression,
      pressure: expression.pressure,
      pressure_differentiation: expression.pressure_differentiation || null,
      math_language_completion: expression.math_language_completion || null,
      next_self_generated_obstruction: expression.next_self_generated_obstruction || null
    } : null,
    Ξ: ''
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(packet, null, 2) + '\n');
  console.log(JSON.stringify(packet, null, 2));
}

if (require.main === module) main();
