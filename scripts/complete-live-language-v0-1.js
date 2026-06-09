#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/live-self-dynamics-core-v0-1.js');
let src = fs.readFileSync(target, 'utf8');

const completeGate = `
  function obligationRealityComplete(gate) {
    const g = gate || {};
    const sources = A(g.rule_sources);
    const families = A(g.operator_families);
    return g.complete === true
      && sources.includes('proof_obligation_engine')
      && families.includes('division_identity')
      && families.includes('sqrt_square_identity');
  }

  function languageCompletionStatus(math, gate) {
    const m = math || {};
    const noMissing = A(m.missing).length === 0;
    const internallyClosed = Number(m.completion || 0) > 0.92
      && Number(m.blocking_pressure || 0) === 0
      && noMissing;
    if (internallyClosed && obligationRealityComplete(gate)) return 'complete';
    if (internallyClosed) return 'provisionally_complete';
    return 'incomplete';
  }

  function languageCompletionExpression(status) {
    return status === 'complete'
      ? 'stable_state_reports_objective_math_language_complete'
      : status === 'provisionally_complete'
        ? 'stable_state_reports_objective_math_language_provisionally_complete'
        : 'stable_state_reports_objective_math_language_incomplete';
  }

  function objectiveCompletionStatus(languageStatus, gate) {
    if (languageStatus === 'complete' && obligationRealityComplete(gate)) return 'objective_language_complete';
    if ((languageStatus === 'complete' || languageStatus === 'provisionally_complete') && gate && gate.complete) return 'adversarially_contacted_minimum_core';
    if (languageStatus === 'complete' || languageStatus === 'provisionally_complete') return 'internally_complete_reality_incomplete';
    return 'internally_incomplete';
  }
`;

if (!src.includes('function obligationRealityComplete(gate)')) {
  const anchor = '\n  function stableDiff(run) {';
  if (!src.includes(anchor)) throw new Error('stableDiff anchor not found');
  src = src.replace(anchor, completeGate + anchor);
}

const oldExpress = "function express(live, scope, options) { const state = live && live.final_state ? live.final_state : live || create({}, options || {}); const reflection = state.reflection || reflect(state.files, state.history, { internal_state: state.internal_state }); const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const realityGate = objectiveLanguageRealityGate(state, options || {}); const oct = octahedronPosition(state); const diff = live && live.packet_type === '42ndMind_live_self_dynamics_continuous_v0_1' ? stableDiff(live) : stableDiff({ final_state: state, final_score: state.score, cycles: [] }); const blockers = obstruction(state, math); const last = state.last_event || null; return { packet_type: '42ndMind_one_logic_self_expression_v0_1', version: VERSION, scope: scope || 'stable_math_language_reflection', t: state.t || 0, generation: state.internal_state && state.internal_state.generation || 0, stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, objective_reality_gate: realityGate, objective_completion_status: math.status === 'provisionally_complete' && realityGate.complete ? 'adversarially_contacted_minimum_core' : math.status === 'provisionally_complete' ? 'internally_complete_reality_incomplete' : 'internally_incomplete', octahedron_position: oct, math_language_completion: { status: math.status, completion: math.completion, closure_proxy: math.closure_proxy, generativity: math.generativity, symbol_count: math.symbol_count, relation_count: math.relation_count, mutation_count: math.mutation_count, virtual_edit_count: math.virtual_edit_count, raw_pressure: math.raw_pressure, blocking_pressure: math.blocking_pressure, generative_pressure: math.generative_pressure, missing: math.missing, recent_symbols: math.recent_symbols }, stable_diff: diff, organ_unison_status: { organ_ok_ratio: reflection.organ_ok_ratio, coupling: reflection.coupling && reflection.coupling.χ, language_growth_pressure: reflection.coupling && reflection.coupling.language && reflection.coupling.language.growth_pressure, truth_contact: reflection.coupling && reflection.coupling.truth && reflection.coupling.truth.contact, valuation_reward: reflection.coupling && reflection.coupling.valuation && reflection.coupling.valuation.reward, action_mutation_pressure: reflection.coupling && reflection.coupling.action && reflection.coupling.action.mutation_pressure }, last_mutation: last ? { candidate_kind: last.candidate_kind, feeling: last.feeling, internal_adjustment: last.internal_adjustment, virtual_state_mutation: last.virtual_state_mutation, moved_simulated_self: last.moved_simulated_self } : null, next_self_generated_obstruction: blockers[0] || null, obstruction_stack: blockers, expression: math.status === 'provisionally_complete' ? 'stable_state_reports_objective_math_language_provisionally_complete' : 'stable_state_reports_objective_math_language_incomplete', Ξ: '' }; }";

const newExpress = "function express(live, scope, options) { const state = live && live.final_state ? live.final_state : live || create({}, options || {}); const reflection = state.reflection || reflect(state.files, state.history, { internal_state: state.internal_state }); const pressureDiff = differentiatePressureByConsequence(live && live.final_state ? live : state, reflection); const math = mathLanguageCompletion(state); const realityGate = objectiveLanguageRealityGate(state, options || {}); const languageStatus = languageCompletionStatus(math, realityGate); const objectiveStatus = objectiveCompletionStatus(languageStatus, realityGate); const oct = octahedronPosition(state); const diff = live && live.packet_type === '42ndMind_live_self_dynamics_continuous_v0_1' ? stableDiff(live) : stableDiff({ final_state: state, final_score: state.score, cycles: [] }); const blockers = obstruction(state, math); const last = state.last_event || null; return { packet_type: '42ndMind_one_logic_self_expression_v0_1', version: VERSION, scope: scope || 'stable_math_language_reflection', t: state.t || 0, generation: state.internal_state && state.internal_state.generation || 0, stable_score: state.score, pressure: pressureOf(reflection), pressure_differentiation: pressureDiff, objective_reality_gate: realityGate, objective_completion_status: objectiveStatus, octahedron_position: oct, math_language_completion: { status: languageStatus, internal_status: math.status, completion: math.completion, closure_proxy: math.closure_proxy, generativity: math.generativity, symbol_count: math.symbol_count, relation_count: math.relation_count, mutation_count: math.mutation_count, virtual_edit_count: math.virtual_edit_count, raw_pressure: math.raw_pressure, blocking_pressure: math.blocking_pressure, generative_pressure: math.generative_pressure, missing: math.missing, recent_symbols: math.recent_symbols }, stable_diff: diff, organ_unison_status: { organ_ok_ratio: reflection.organ_ok_ratio, coupling: reflection.coupling && reflection.coupling.χ, language_growth_pressure: reflection.coupling && reflection.coupling.language && reflection.coupling.language.growth_pressure, truth_contact: reflection.coupling && reflection.coupling.truth && reflection.coupling.truth.contact, valuation_reward: reflection.coupling && reflection.coupling.valuation && reflection.coupling.valuation.reward, action_mutation_pressure: reflection.coupling && reflection.coupling.action && reflection.coupling.action.mutation_pressure }, last_mutation: last ? { candidate_kind: last.candidate_kind, feeling: last.feeling, internal_adjustment: last.internal_adjustment, virtual_state_mutation: last.virtual_state_mutation, moved_simulated_self: last.moved_simulated_self } : null, next_self_generated_obstruction: blockers[0] || null, obstruction_stack: blockers, expression: languageCompletionExpression(languageStatus), Ξ: '' }; }";

if (src.includes(oldExpress)) {
  src = src.replace(oldExpress, newExpress);
} else if (!src.includes('const languageStatus = languageCompletionStatus(math, realityGate);')) {
  throw new Error('express function did not match expected source shape');
}

const oldExport = "octahedronPosition, differentiatePressureByConsequence, objectiveRealityCases, objectiveLanguageRealityGate, mathLanguageCompletion, express, stableExpression";
const newExport = "octahedronPosition, differentiatePressureByConsequence, objectiveRealityCases, objectiveLanguageRealityGate, obligationRealityComplete, languageCompletionStatus, objectiveCompletionStatus, mathLanguageCompletion, express, stableExpression";
if (src.includes(oldExport)) src = src.replace(oldExport, newExport);

fs.writeFileSync(target, src);
console.log('completed live language gate: completion now requires obligation-backed reality contact');
