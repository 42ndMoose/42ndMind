/* 42ndMind Semantic Source Bridge v0.4
 *
 * Purpose:
 * Convert semantic promotion patch-plan reports into source patch bridge packets.
 * This is still planner-only: no source write, no runtime enablement, no import,
 * no belief movement.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    SOURCE_PACKETS_READY: 'SOURCE_PACKETS_READY',
    HOLD_NO_PATCH_PLANS: 'HOLD_NO_PATCH_PLANS',
    HOLD_BRIDGE_UNAVAILABLE: 'HOLD_BRIDGE_UNAVAILABLE'
  });

  function asArray(v){ return Array.isArray(v) ? v : []; }
  function text(v){ return String(v ?? '').trim(); }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function now(){ return new Date().toISOString(); }

  function patchPlanReportFrom(input, options){
    if(input && input.packet_type === '42ndMind_semantic_promotion_bridge_patch_plan_report_v0_4') return input;
    if(input && Array.isArray(input.patch_plans)) return input;
    if(global.KernelSemanticPromotionBridgeV04 && typeof global.KernelSemanticPromotionBridgeV04.stableToPatchPlans === 'function') {
      return global.KernelSemanticPromotionBridgeV04.stableToPatchPlans(input, options || {});
    }
    return null;
  }

  function sourcePacketForPlan(plan, options){
    if(!global.KernelSourcePatchBridgeV04 || typeof global.KernelSourcePatchBridgeV04.createPacket !== 'function') return null;
    return global.KernelSourcePatchBridgeV04.createPacket(plan, options || {});
  }

  function build(input, options = {}){
    const report = patchPlanReportFrom(input, options);
    if(!global.KernelSourcePatchBridgeV04 || typeof global.KernelSourcePatchBridgeV04.createPacket !== 'function') {
      return {
        packet_type:'42ndMind_semantic_source_bridge_report_v0_4',
        packet_version:VERSION,
        created_at:now(),
        decision:DECISIONS.HOLD_BRIDGE_UNAVAILABLE,
        reason:'KernelSourcePatchBridgeV04 unavailable.',
        source_packets:[],
        belief_movement:'none',
        doctrine:doctrine()
      };
    }
    const plans = asArray(report && report.patch_plans).filter(p => p && p.decision === 'PATCH_PLAN_READY');
    if(!plans.length) {
      return {
        packet_type:'42ndMind_semantic_source_bridge_report_v0_4',
        packet_version:VERSION,
        created_at:now(),
        decision:DECISIONS.HOLD_NO_PATCH_PLANS,
        reason:'No PATCH_PLAN_READY semantic patch plans were supplied or generated.',
        source_packets:[],
        source_packet_count:0,
        raw_patch_plan_report: report ? clone(report) : null,
        belief_movement:'none',
        doctrine:doctrine()
      };
    }
    const packets = plans.map(plan => sourcePacketForPlan(plan, options)).filter(Boolean);
    const ready = packets.filter(p => p.decision === 'PATCH_PACKET_READY').length;
    const hold = packets.filter(p => p.decision === 'HOLD_NOT_READY').length;
    const blocked = packets.filter(p => p.decision === 'BLOCKED').length;
    return {
      packet_type:'42ndMind_semantic_source_bridge_report_v0_4',
      packet_version:VERSION,
      created_at:now(),
      decision:DECISIONS.SOURCE_PACKETS_READY,
      patch_plan_count:plans.length,
      source_packet_count:packets.length,
      source_packets:packets,
      summary:{ patch_packet_ready:ready, hold_not_ready:hold, blocked },
      external_write_ready:ready > 0 && blocked === 0,
      next_step:'Use external GitHub SHA/write/fetch-back/test flow only after manual review; browser kernel still does not write source.',
      application_state:{ source_written:false, commit_created:false, fetch_back_verified:false, tests_run:false, belief_movement:'none' },
      raw_patch_plan_report: report ? clone(report) : null,
      belief_movement:'none',
      doctrine:doctrine()
    };
  }

  function doctrine(){ return {
    semantic_source_bridge_is_planner_only:true,
    source_packets_are_not_source_writes:true,
    external_sha_write_fetch_back_required:true,
    stable_invariants_remain_candidates_until_external_review:true,
    bridge_does_not_import_or_move_belief:true,
    browser_kernel_never_writes_source_directly:true
  }; }

  function sampleInput(){
    if(global.KernelSemanticPromotionBridgeV04 && typeof global.KernelSemanticPromotionBridgeV04.sampleProposalPacket === 'function') {
      return global.KernelSemanticPromotionBridgeV04.sampleProposalPacket();
    }
    return { packet_type:'42ndMind_semantic_invariant_proposals_v0_4', proposals:[] };
  }

  global.KernelSemanticSourceBridgeV04 = Object.freeze({ VERSION, DECISIONS, build, sampleInput, doctrine });
})(typeof window !== 'undefined' ? window : globalThis);
