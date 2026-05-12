/* 42ndMind Kernel Sensemaking v0.1.1 patch
 *
 * Fix:
 * v0.1.0 treated vague hedge-language with a simple verb as a structured
 * claim. That was too eager. A phrase like "maybe that whole thing is weird
 * somehow" has grammar, but it has not earned a testable claim.
 *
 * v0.1.1 classifies vague/hedged/non-specific inputs as ambiguous unless
 * they contain reality-contact language or a clear testable relation.
 */
(function (global) {
  'use strict';
  if (!global.KernelSensemakingV01) return;

  const BASE = global.KernelSensemakingV01;
  const VERSION = '0.1.1';

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }

  function hasRealityContact(raw) {
    return /\b(source|evidence|record|document|timestamp|receipt|video|data|test|benchmark|audit|official|measured|observed|log|report|study|link|citation|registry)\b/i.test(raw);
  }

  function hasTestableRelation(raw) {
    return /\b(causes|supports|attacks|proves|means|shows|suggests|contradicts|depends|requires|submitted|found|deleted|changed|claims|argues|believes|because|therefore|unless|if|then)\b/i.test(raw);
  }

  function isVagueHedgedInput(raw) {
    const value = lower(raw);
    const hasHedge = /\b(maybe|sort of|kind of|kinda|somehow|something|whatever|idk|i don't know|not sure|weird|thing|stuff|vibes?)\b/.test(value);
    const vagueOnly = !hasRealityContact(value) && !hasTestableRelation(value);
    return hasHedge && vagueOnly;
  }

  function classify(input) {
    const raw = text(input);
    if (raw && isVagueHedgedInput(raw)) {
      return {
        classification: BASE.CLASSIFICATIONS.AMBIGUOUS,
        decision: BASE.DECISIONS.ASK_CLARIFICATION,
        reason: 'vague or hedged language has not earned a testable claim',
        metrics: BASE.signalMetrics(raw),
        v011_patch: { applied:true, rule:'vague_hedged_language_is_ambiguous_not_claim' }
      };
    }
    const result = BASE.classify(input);
    result.v011_patch = { applied:false, rule:'base_classification_used' };
    return result;
  }

  function analyze(input, options) {
    const result = classify(input);
    const report = BASE.analyze(input, options);
    if (result.v011_patch && result.v011_patch.applied) {
      report.packet_version = VERSION;
      report.classification = result.classification;
      report.decision = result.decision;
      report.reason = result.reason;
      report.metrics = result.metrics;
      report.parsed_json_available = false;
      report.governor_candidate = null;
      report.governor_report = null;
      report.observation = {
        observation_type: 'sensemaking_observation',
        text: text(input),
        classification: result.classification,
        reason: result.reason,
        near_null: true,
        belief_movement: 'none',
        metrics: result.metrics
      };
      report.v011_patch = result.v011_patch;
      return report;
    }
    report.packet_version = VERSION;
    report.v011_patch = result.v011_patch;
    return report;
  }

  global.KernelSensemakingV01 = Object.freeze(Object.assign({}, BASE, {
    VERSION,
    classify,
    analyze
  }));
})(typeof window !== 'undefined' ? window : globalThis);
