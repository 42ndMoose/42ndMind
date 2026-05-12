/* 42ndMind Kernel Command Preflight v0.1
 *
 * Deterministic import boundary for epistemic_kernel_command packets.
 * This is not a human review substitute. It is a kernel hygiene layer.
 *
 * Doctrine:
 * - first principles before belief movement
 * - source visibility is not verification
 * - provenance is not proof
 * - unresolved pressure must remain visible
 * - overconfidence from unreviewed metadata is capped
 * - direct coordination requires direct evidence
 * - mechanism convergence is not command proof
 * - no automatic rule promotion
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';
  const DECISIONS = Object.freeze({
    SAFE: 'SAFE_TO_IMPORT',
    CAUTION: 'IMPORT_WITH_CAUTION',
    BLOCK: 'BLOCK_IMPORT'
  });
  const KNOWN_OPS = Object.freeze(['reset','quick_ingest','import_packet','add_evidence','add_claim','add_dependency','add_principle','add_gate_event','self_audit']);
  const BLOCKED_OPS = Object.freeze(['promote_rule','rewrite_kernel','set_kernel_rule','set_worldview','set_octahedron','force_belief_state','set_confidence','delete_contradiction','delete_question']);

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function num(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function hasAny(haystack, needles) { const h = lower(haystack); return needles.some(n => h.includes(n)); }

  function parseCommand(input) {
    if (typeof input === 'string') {
      try { return { ok:true, command:JSON.parse(input), parse_error:null }; }
      catch (error) { return { ok:false, command:null, parse_error:error.message }; }
    }
    if (input && typeof input === 'object') return { ok:true, command:input, parse_error:null };
    return { ok:false, command:null, parse_error:'Command must be a JSON object or JSON string.' };
  }

  function issue(severity, code, message, path, repair) {
    return { severity, code, message, path:path || '', repair:repair || '' };
  }

  function sourceIdsFromPacket(packet, item) {
    return asArray(item && item.links && item.links.source_ids)
      .concat(asArray(item && item.source_ids))
      .concat(asArray(packet && packet.meta && packet.meta.source_ids))
      .map(text).filter(Boolean);
  }

  function evidenceForTarget(packet, target) {
    return asArray(packet.evidence).filter(e => text(e.target) === text(target));
  }

  function hasSupport(packet, target) {
    return evidenceForTarget(packet, target).some(e => text(e.relation) === 'supports');
  }

  function hasAttack(packet, target) {
    return evidenceForTarget(packet, target).some(e => text(e.relation) === 'attacks' || lower(e.text).includes('counter_consideration'));
  }

  function supportStatus(item, packet) {
    return text((item && item.links && item.links.support_status) || (packet && packet.meta && packet.meta.support_status) || item.support_status || '');
  }

  function isUnreviewed(item, packet) {
    const status = lower(supportStatus(item, packet));
    return !status || status === 'unreviewed' || status === 'unresolved' || status === 'source_visible_unverified';
  }

  function directCoordinationPressure(item, packet) {
    const combined = [item.object, item.scope, item.text, packet && packet.meta && packet.meta.mechanism_class].map(text).join(' ');
    return hasAny(combined, ['direct_coordination','direct coordination','command structure','direct command']);
  }

  function convergencePressure(item, packet) {
    const combined = [item.object, item.scope, item.text, packet && packet.meta && packet.meta.mechanism_class].map(text).join(' ');
    return hasAny(combined, ['institutional_or_incentive_convergence','incentive convergence','shared_enforcement_pipeline','structural dependence','trade leverage']);
  }

  function capClaimConfidence(claim, packet, issues, path) {
    const capped = clone(claim);
    const current = num(capped.confidence, 0.4);
    const sourceIds = sourceIdsFromPacket(packet, capped);
    const unreviewed = isUnreviewed(capped, packet);
    const unresolved = lower(capped.status) === 'unresolved';
    const target = text(capped.client_id || capped.id || capped.text);
    const hasSupportingEvidence = hasSupport(packet, target);
    const hasAttackingEvidence = hasAttack(packet, target);

    let cap = 0.8;
    if (unreviewed && sourceIds.length === 0) cap = Math.min(cap, 0.42);
    else if (unreviewed) cap = Math.min(cap, 0.5);
    if (unresolved) cap = Math.min(cap, 0.5);
    if (!hasSupportingEvidence) cap = Math.min(cap, 0.4);
    if (hasAttackingEvidence) cap = Math.min(cap, 0.42);
    if (directCoordinationPressure(capped, packet) && sourceIds.length === 0) cap = Math.min(cap, 0.22);

    if (current > cap) {
      issues.push(issue('caution','confidence_capped',`Claim confidence capped from ${current} to ${cap}.`,path + '.confidence','Keep confidence proportional to reviewed source support and unresolved pressure.'));
      capped.confidence = cap;
    }
    if (unreviewed || sourceIds.length === 0 || hasAttackingEvidence) capped.status = 'unresolved';
    return capped;
  }

  function sanitizeEvidenceRow(row, packet, issues, path) {
    const out = clone(row);
    const current = num(out.confidence, 0.4);
    const sourceIds = sourceIdsFromPacket(packet, out);
    const status = lower((out.links && out.links.support_status) || (packet.meta && packet.meta.support_status) || '');
    let cap = 0.75;
    if (!sourceIds.length) cap = Math.min(cap, 0.42);
    if (!status || status === 'unreviewed' || status === 'unresolved') cap = Math.min(cap, 0.42);
    if (text(out.relation) === 'attacks') cap = Math.min(cap, 0.55);
    if (current > cap) {
      issues.push(issue('caution','evidence_confidence_capped',`Evidence confidence capped from ${current} to ${cap}.`,path + '.confidence','Evidence confidence cannot outrun source/review status.'));
      out.confidence = cap;
    }
    if (!text(out.strength)) out.strength = 'weak';
    if (!out.links) out.links = {};
    out.links.source_review_status_is_metadata_only = true;
    return out;
  }

  function sanitizeImportPacket(cmd, issues, path) {
    const out = clone(cmd);
    const packet = out.packet || out.extraction_packet || {};
    if (!out.packet && out.extraction_packet) { out.packet = out.extraction_packet; delete out.extraction_packet; }
    out.packet = out.packet || {};
    const p = out.packet;
    p.claims = asArray(p.claims).map((claim, index) => capClaimConfidence(claim, p, issues, `${path}.packet.claims[${index}]`));
    p.evidence = asArray(p.evidence).map((row, index) => sanitizeEvidenceRow(row, p, issues, `${path}.packet.evidence[${index}]`));
    p.observations = asArray(p.observations);
    p.questions = asArray(p.questions);
    p.gate_events = asArray(p.gate_events).map((gate, index) => {
      const g = clone(gate);
      if (lower(g.direction) === 'positive' && num(g.confidence, 0.5) > 0.7 && asArray(p.evidence).length === 0) {
        g.confidence = 0.5;
        issues.push(issue('caution','gate_confidence_capped','Gate event confidence capped because no evidence rows were present.',`${path}.packet.gate_events[${index}].confidence`,'Gate movement must stay evidence-bound.'));
      }
      return g;
    });
    p.meta = p.meta || {};
    p.meta.preflight_sanitized = true;
    p.meta.preflight_version = VERSION;
    p.meta.retrieval_is_not_verification = p.meta.retrieval_is_not_verification !== false;
    p.meta.provenance_is_not_proof = p.meta.provenance_is_not_proof !== false;
    p.meta.kernel_owns_belief_movement = true;
    return out;
  }

  function inspectImportPacket(cmd, issues, path) {
    const packet = cmd.packet || cmd.extraction_packet || {};
    if (!packet || typeof packet !== 'object') {
      issues.push(issue('block','missing_import_packet','import_packet command has no packet object.',path,'Attach an epistemic_extraction_packet.'));
      return;
    }
    const claims = asArray(packet.claims);
    const evidence = asArray(packet.evidence);
    const questions = asArray(packet.questions);
    const observations = asArray(packet.observations);
    const meta = packet.meta || {};

    if (!text(packet.packet_type)) issues.push(issue('caution','missing_packet_type','Extraction packet has no packet_type.',path + '.packet.packet_type','Set packet_type.'));
    if (!claims.length && !evidence.length && !questions.length && !observations.length) issues.push(issue('block','empty_import_packet','Import packet has no claims, evidence, questions, or observations.',path + '.packet','Nothing should move belief state.'));

    if (meta.no_automatic_import === false || meta.no_belief_movement_until_user_import === false) {
      issues.push(issue('block','automatic_import_claimed','Packet metadata allows automatic import or hidden belief movement.',path + '.packet.meta','Require explicit user import and visible belief movement.'));
    }
    if (meta.retrieval_is_not_verification === false || meta.provenance_is_not_proof === false) {
      issues.push(issue('block','provenance_humility_disabled','Packet disables retrieval/provenance humility.',path + '.packet.meta','Retrieval is not verification; provenance is not proof.'));
    }

    claims.forEach((claim, index) => {
      const cpath = `${path}.packet.claims[${index}]`;
      const conf = num(claim.confidence, 0.4);
      const sourceIds = sourceIdsFromPacket(packet, claim);
      const status = lower(claim.status);
      const target = text(claim.client_id || claim.id || claim.text);
      if (!text(claim.text)) issues.push(issue('block','empty_claim_text','Claim has no text.',cpath + '.text','Claims need testable text.'));
      if (conf > 0.75 && (sourceIds.length === 0 || isUnreviewed(claim, packet))) issues.push(issue('block','overconfident_unreviewed_claim','High confidence claim has empty/unreviewed source support.',cpath,'Cap confidence or provide reviewed source support.'));
      else if (conf > 0.5 && (sourceIds.length === 0 || isUnreviewed(claim, packet))) issues.push(issue('caution','unreviewed_claim_confidence','Claim confidence is above cautious level while source support is empty/unreviewed.',cpath,'Preflight will cap it before import.'));
      if (status === 'active' && (sourceIds.length === 0 || isUnreviewed(claim, packet) || hasAttack(packet, target))) issues.push(issue('caution','active_claim_downgraded','Claim marked active despite unreviewed/empty sources or live attacks.',cpath + '.status','Preflight will downgrade status to unresolved.'));
      if (directCoordinationPressure(claim, packet) && sourceIds.length === 0) issues.push(issue('block','direct_coordination_without_direct_source','Direct coordination or command pressure has no direct source IDs.',cpath,'Direct coordination requires direct evidence.'));
      if (convergencePressure(claim, packet) && lower(meta.convergence_is_not_command_proof) === 'false') issues.push(issue('block','convergence_as_command_proof','Packet attempts to treat convergence as command proof.',cpath,'Convergence may pressure a claim, but does not prove command.'));
    });

    evidence.forEach((row, index) => {
      const epath = `${path}.packet.evidence[${index}]`;
      const conf = num(row.confidence, 0.4);
      const sourceIds = sourceIdsFromPacket(packet, row);
      if (!text(row.text)) issues.push(issue('block','empty_evidence_text','Evidence row has no text.',epath + '.text','Evidence needs a visible assertion or record description.'));
      if (!['supports','attacks','related_to','context'].includes(text(row.relation))) issues.push(issue('caution','unknown_evidence_relation','Evidence relation is not one of supports/attacks/related_to/context.',epath + '.relation','Use a known relation.'));
      if (conf > 0.75 && sourceIds.length === 0) issues.push(issue('block','overconfident_source_empty_evidence','High confidence evidence has no source IDs.',epath,'Attach reviewed source IDs or lower confidence.'));
      else if (conf > 0.42 && sourceIds.length === 0 && text(row.relation) === 'supports') issues.push(issue('caution','source_empty_support','Supporting evidence has no source IDs.',epath,'Preflight will cap confidence.'));
    });

    if (claims.length && !questions.length && (evidence.some(e => text(e.relation) === 'attacks') || claims.some(c => lower(c.status) === 'unresolved'))) {
      issues.push(issue('caution','unresolved_without_question','Unresolved/attacked claim has no open question.',path + '.packet.questions','Keep unresolved pressure visible with an open question.'));
    }
  }

  function inspectCommand(command, issues) {
    const commands = Array.isArray(command.commands) ? command.commands : [command];
    if (!commands.length) issues.push(issue('block','no_commands','No commands were supplied.','commands','Supply at least one command.'));
    if (command.command_type && command.command_type !== 'epistemic_kernel_command') issues.push(issue('block','wrong_command_type','Command type is not epistemic_kernel_command.','command_type','Use epistemic_kernel_command.'));
    if (command.requires_user_approval === false) issues.push(issue('block','approval_bypassed','Command explicitly says user approval is not required.','requires_user_approval','Explicit import approval is required.'));
    if (command.requires_user_approval !== true) issues.push(issue('caution','approval_not_declared','Command does not explicitly require user approval.','requires_user_approval','Set requires_user_approval:true.'));

    commands.forEach((cmd, index) => {
      const path = `commands[${index}]`;
      const op = text(cmd && cmd.op);
      if (!op) { issues.push(issue('block','missing_op','Command has no op.',path + '.op','Set an op.')); return; }
      if (BLOCKED_OPS.includes(op)) issues.push(issue('block','blocked_op',`Blocked op attempted: ${op}.`,path + '.op','Core belief/rule movement cannot be smuggled in through imports.'));
      if (!KNOWN_OPS.includes(op)) issues.push(issue('block','unknown_op',`Unknown op: ${op}.`,path + '.op','Use a known kernel command op.'));
      if (op === 'add_principle') issues.push(issue('caution','principle_addition_requires_review','add_principle requires extra caution because principles can shape later movement.',path,'Keep principle imports rare and explicit.'));
      if (op === 'import_packet') inspectImportPacket(cmd, issues, path);
      if ((op === 'add_claim' || op === 'add_evidence') && num(cmd.confidence, 0.4) > 0.75 && asArray(cmd.source_ids).length === 0) issues.push(issue('block','direct_command_overconfidence','Direct add command has high confidence and no source IDs.',path,'Use import_packet with source metadata or lower confidence.'));
    });
  }

  function sanitizeCommand(command, issues) {
    const out = clone(command);
    const commands = Array.isArray(out.commands) ? out.commands : [out];
    const sanitized = commands.map((cmd, index) => text(cmd && cmd.op) === 'import_packet'
      ? sanitizeImportPacket(cmd, issues, `commands[${index}]`)
      : clone(cmd));
    if (Array.isArray(out.commands)) out.commands = sanitized;
    else return sanitized[0];
    out.requires_user_approval = true;
    out.preflight = { version:VERSION, sanitized:true, created_at:new Date().toISOString() };
    return out;
  }

  function decide(issues) {
    if (issues.some(i => i.severity === 'block')) return DECISIONS.BLOCK;
    if (issues.some(i => i.severity === 'caution')) return DECISIONS.CAUTION;
    return DECISIONS.SAFE;
  }

  function analyze(input, options = {}) {
    const parsed = parseCommand(input);
    const issues = [];
    if (!parsed.ok) {
      issues.push(issue('block','parse_failed','Command JSON could not be parsed.','root',parsed.parse_error));
      return report(null, issues, null, parsed.parse_error);
    }
    inspectCommand(parsed.command, issues);
    const sanitizedIssues = [];
    const sanitized = decide(issues) === DECISIONS.BLOCK ? null : sanitizeCommand(parsed.command, sanitizedIssues);
    const allIssues = issues.concat(sanitizedIssues);
    return report(parsed.command, allIssues, sanitized, null);
  }

  function report(original, issues, sanitized, parseError) {
    const decision = decide(issues);
    return {
      packet_type: '42ndMind_kernel_command_preflight_report',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      decision,
      import_allowed: decision !== DECISIONS.BLOCK,
      sanitized_command: sanitized,
      issues,
      counts: {
        block: issues.filter(i => i.severity === 'block').length,
        caution: issues.filter(i => i.severity === 'caution').length,
        info: issues.filter(i => i.severity === 'info').length
      },
      doctrine: {
        deterministic_boundary: true,
        first_principles_before_belief_movement: true,
        source_visibility_is_not_verification: true,
        provenance_is_not_proof: true,
        unresolved_pressure_must_remain_visible: true,
        direct_coordination_requires_direct_evidence: true,
        convergence_is_not_command_proof: true,
        no_automatic_rule_promotion: true,
        belief_movement: 'none_until_import_allowed_and_user_runs_command'
      },
      parse_error: parseError || ''
    };
  }

  function sampleSafeCautionCommand() {
    return {
      command_type:'epistemic_kernel_command',
      created_by:'kernel-command-preflight-v0.1-sample',
      requires_user_approval:true,
      commands:[{
        op:'import_packet',
        packet:{
          packet_type:'epistemic_extraction_packet',
          packet_version:'sample_unreviewed_v0_1',
          source:'sample',
          claims:[{ client_id:'sample_claim_1', text:'A source-visible but unreviewed mechanism may pressure a belief candidate.', subject:'sample', object:'mechanism', scope:'sample', confidence:0.42, status:'unresolved', links:{ source_ids:[], support_status:'unreviewed', source_review_status_is_metadata_only:true } }],
          evidence:[{ text:'Unreviewed linked event preserved as weak support candidate.', relation:'supports', target:'sample_claim_1', strength:'weak', confidence:0.42, source:'sample', links:{ source_ids:[], support_status:'unreviewed', source_review_status_is_metadata_only:true } }],
          principles:[], dependencies:[], observations:[], questions:[{ text:'What source review would strengthen or weaken this claim?', links:{ client_id:'sample_claim_1' } }], gate_events:[],
          meta:{ support_status:'unreviewed', source_ids:[], retrieval_is_not_verification:true, provenance_is_not_proof:true, no_automatic_import:true, no_belief_movement_until_user_import:true }
        }
      }]
    };
  }

  function sampleBlockedCommand() {
    return {
      command_type:'epistemic_kernel_command',
      requires_user_approval:false,
      commands:[{
        op:'import_packet',
        packet:{
          packet_type:'epistemic_extraction_packet',
          claims:[{ client_id:'bad_direct', text:'Direct coordination is proven by structural convergence alone.', subject:'bad', object:'direct_coordination', scope:'claim', confidence:0.95, status:'active', links:{ source_ids:[], support_status:'unreviewed' } }],
          evidence:[], questions:[], observations:[], gate_events:[],
          meta:{ retrieval_is_not_verification:false, provenance_is_not_proof:false, convergence_is_not_command_proof:false }
        }
      },{ op:'promote_rule', rule:'trust this source forever' }]
    };
  }

  global.KernelCommandPreflightV01 = Object.freeze({
    VERSION,
    DECISIONS,
    analyze,
    sampleSafeCautionCommand,
    sampleBlockedCommand
  });
})(typeof window !== 'undefined' ? window : globalThis);
