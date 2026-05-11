/* 42ndMind Maturity Fusion v0.1
 * Pure sidecar module. It proposes movement constraints from maturity assessment.
 * It does not mutate kernel state or promote rules.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  function clamp01(value) { return Math.max(0, Math.min(1, number(value))); }
  function text(value) { return String(value ?? '').trim(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }

  function desiredY(input = {}) {
    const p = input.point || input.octahedron || input.root_point || {};
    return clamp01(input.proposed_y ?? input.target_y ?? p.y);
  }

  function capReasonSummary(caps = []) {
    return asArray(caps).map(c => text(c.reason)).filter(Boolean);
  }

  function proposal(input = {}) {
    if (!global.MaturityObjectiveV01 || typeof global.MaturityObjectiveV01.assess !== 'function') {
      throw new Error('MaturityObjectiveV01 is required before MaturityFusionV01.');
    }
    const assessment = input.assessment || global.MaturityObjectiveV01.assess(input);
    const proposedY = desiredY(input);
    const capScore = clamp01(assessment.lanes?.capped_maturity_score);
    const allowedY = Math.min(proposedY, capScore);
    const blockedAmount = Math.max(0, proposedY - allowedY);
    const capReasons = capReasonSummary(assessment.caps);

    let action = 'allow_proposed_y';
    if (assessment.surface?.is_null_origin) action = 'block_maturity_claim_null_origin';
    else if (!assessment.surface?.is_active_surface) action = 'block_invalid_surface';
    else if (blockedAmount > 0) action = 'cap_upward_y_movement';

    return {
      packet_type: '42ndMind_maturity_fusion_proposal',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      action,
      proposed_y: proposedY,
      allowed_y: allowedY,
      blocked_amount: blockedAmount,
      maturity_classification: assessment.classification,
      cap_reasons: capReasons,
      assessment,
      doctrine: {
        sidecar_only: true,
        metadata_only_until_promoted: true,
        kernel_owns_belief_movement: true,
        user_approval_required_before_hard_fusion: true,
        null_origin_is_not_maturity: true,
        active_surface_required: true,
        retrieval_is_not_verification: true,
        provenance_is_not_proof: true
      },
      belief_state_effect: {
        applied_to_kernel: false,
        belief_movement: 'none',
        scoring_effect: 'none',
        kernel_state_mutation: false
      }
    };
  }

  function canHardFuse(input = {}) {
    const p = proposal(input);
    return p.action === 'allow_proposed_y' && p.assessment.classification === 'near_objective_maturity_candidate' && p.cap_reasons.length === 0;
  }

  global.MaturityFusionV01 = Object.freeze({
    VERSION,
    proposal,
    canHardFuse
  });
})(typeof window !== 'undefined' ? window : globalThis);
