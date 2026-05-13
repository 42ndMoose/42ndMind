/* 42ndMind Semantic Promotion Bridge v0.4
 *
 * Purpose:
 * Send stable semantic-invariant proposals through the existing promotion
 * pipeline without enabling, patching, importing, or moving belief.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    PROMOTION_BRIDGE_READY: 'PROMOTION_BRIDGE_READY',
    HOLD_NO_STABLE_INVARIANTS: 'HOLD_NO_STABLE_INVARIANTS',
    HOLD_PIPELINE_UNAVAILABLE: 'HOLD_PIPELINE_UNAVAILABLE'
  });

  function asArray(v){ return Array.isArray(v) ? v : []; }
  function text(v){ return String(v ?? '').trim(); }
  function now(){ return new Date().toISOString(); }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }

  function proposalPacketFrom(input, options){
    if(input && input.packet_type === '42ndMind_semantic_invariant_proposals_v0_4') return input;
    if(input && Array.isArray(input.proposals)) return input;
    if(global.KernelSemanticInvariantLearnerV04 && typeof global.KernelSemanticInvariantLearnerV04.proposeStable === 'function') {
      return global.KernelSemanticInvariantLearnerV04.proposeStable(input || options && options.key, options || {});
    }
    return null;
  }

  function normalizeProposal(proposal){
    const next = clone(proposal || {});
    if(!text(next.target_layer)) next.target_layer = 'semantic_invariant_adapter';
    if(!Array.isArray(next.tests_required) || !next.tests_required.length) {
      next.tests_required = ['kernel-semantic-invariant-learner-v0-4-test.html','kernel-lexical-uncertainty-v0-4-test.html','kernel-promotion-pipeline-v0-4-test.html'];
    }
    if(!text(next.rationale)) next.rationale = 'Semantic invariant became stable through repeated observations and should be evaluated as pressure only.';
    if(!text(next.proposed_change) && next.invariant) next.proposed_change = `Use semantic invariant as pressure only: ${next.invariant.invariant_statement || next.invariant.term}`;
    if(!next.meta) next.meta = {};
    next.meta.semantic_promotion_bridge = true;
    next.meta.invariant_is_candidate_not_doctrine = true;
    next.meta.no_direct_self_patch = true;
    return next;
  }

  function evaluate(input, options = {}){
    const packet = proposalPacketFrom(input, options);
    if(!global.KernelPromotionPipelineV04 || typeof global.KernelPromotionPipelineV04.evaluateMany !== 'function') {
      return {
        packet_type:'42ndMind_semantic_promotion_bridge_report_v0_4',
        packet_version:VERSION,
        created_at:now(),
        decision:DECISIONS.HOLD_PIPELINE_UNAVAILABLE,
        reason:'KernelPromotionPipelineV04 unavailable.',
        proposals:[],
        promotion_batch:null,
        belief_movement:'none',
        doctrine:doctrine()
      };
    }
    const proposals = asArray(packet && packet.proposals).map(normalizeProposal);
    if(!proposals.length) {
      return {
        packet_type:'42ndMind_semantic_promotion_bridge_report_v0_4',
        packet_version:VERSION,
        created_at:now(),
        decision:DECISIONS.HOLD_NO_STABLE_INVARIANTS,
        reason:'No stable semantic invariant proposals were supplied or generated.',
        proposals:[],
        promotion_batch:null,
        belief_movement:'none',
        doctrine:doctrine()
      };
    }
    const batch = global.KernelPromotionPipelineV04.evaluateMany(proposals, options);
    return {
      packet_type:'42ndMind_semantic_promotion_bridge_report_v0_4',
      packet_version:VERSION,
      created_at:now(),
      decision:DECISIONS.PROMOTION_BRIDGE_READY,
      source_packet_type:text(packet && packet.packet_type),
      proposal_count:proposals.length,
      proposals,
      promotion_batch:batch,
      summary:batch.summary,
      next_step:'PATCH_CANDIDATE_ONLY reports can be sent to patch-candidate planner; no source write is allowed here.',
      promotion_effect:{ runtime_enabled:false, patch_applied:false, source_rewritten:false, import_executed:false, core_doctrine_changed:false },
      belief_movement:'none',
      doctrine:doctrine()
    };
  }

  function stableToPatchPlans(input, options = {}){
    const report = evaluate(input, options);
    if(report.decision !== DECISIONS.PROMOTION_BRIDGE_READY) return Object.assign({}, report, { patch_plans:[] });
    const patchPlans = [];
    if(global.KernelPatchCandidateV04 && typeof global.KernelPatchCandidateV04.createPlan === 'function') {
      asArray(report.promotion_batch.reports).forEach(r => {
        if(r.decision === 'PATCH_CANDIDATE_ONLY') patchPlans.push(global.KernelPatchCandidateV04.createPlan(r));
      });
    }
    return Object.assign({}, report, {
      packet_type:'42ndMind_semantic_promotion_bridge_patch_plan_report_v0_4',
      patch_plans:patchPlans,
      patch_plan_count:patchPlans.length,
      patch_plans_are_not_source_writes:true
    });
  }

  function doctrine(){ return {
    semantic_invariant_promotion_is_evaluation_only:true,
    stable_invariant_is_not_live_doctrine:true,
    promotion_pipeline_must_evaluate_before_patch_plan:true,
    bridge_does_not_patch_source:true,
    bridge_does_not_enable_runtime:true,
    bridge_does_not_move_belief:true
  }; }

  function sampleProposalPacket(){
    const inv = { id:'semantic_invariant_debunked_closure_pressure', term:'debunked', term_key:'debunked', pressure:'closure_pressure', observation_count:3, maturity_score:1, decision:'INVARIANT_STABLE', invariant_statement:'Term "debunked" tends to apply dispute-closure pressure.' };
    return { packet_type:'42ndMind_semantic_invariant_proposals_v0_4', packet_version:'0.4.0', count:1, proposals:[{ id:'proposal_semantic_debunked_closure', target_layer:'semantic_invariant_adapter', title:'Recognize semantic invariant: debunked', proposed_change:'Use candidate invariant as lexical/semantic pressure: Term "debunked" tends to apply dispute-closure pressure.', rationale:'Invariant became stable through repeated observations. Use as pressure only, not doctrine.', tests_required:['kernel-semantic-invariant-learner-v0-4-test.html','kernel-lexical-uncertainty-v0-4-test.html'], invariant:inv, promotion_state:{ implemented:false, enabled:false } }], belief_movement:'none' };
  }

  global.KernelSemanticPromotionBridgeV04 = Object.freeze({ VERSION, DECISIONS, evaluate, stableToPatchPlans, normalizeProposal, sampleProposalPacket, doctrine });
})(typeof window !== 'undefined' ? window : globalThis);
