/* 42ndMind Maturity State Renderer v0.1
 *
 * Deterministic renderer only. It does not think, promote truth, move belief,
 * mutate maturity identity, or decide meaning. It reads the owned/shared brain
 * state and renders a human-readable explanation of the kernel's structural
 * reaction.
 */
(function (global) {
  'use strict';

  const VERSION = '0.1.0';

  function asArray(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return String(value ?? '').trim(); }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now() { return new Date().toISOString(); }
  function fmt(n) { return Number(n || 0).toFixed(3); }
  function boolWord(value) { return value === true ? 'true' : value === false ? 'false' : 'unknown'; }

  function latestEvent(state, explicitEvent) {
    if (explicitEvent) return explicitEvent;
    const events = asArray(state && state.runtimeEvents);
    return events.length ? events[events.length - 1] : null;
  }

  function maturityCore(state) { return state && state.maturityCore ? state.maturityCore : null; }

  function packetTypes(event) {
    return asArray(event && event.candidate_packets).map(p => p.type).filter(Boolean);
  }

  function relationFamilies(event) {
    return asArray(event && event.candidate_relation_edges).map(r => r.relation_family).filter(Boolean);
  }

  function pressureEntries(state) {
    const pressure = state && state.pressureState || {};
    return Object.keys(pressure).filter(key => Number(pressure[key] || 0) > 0).map(key => ({ key, value: Number(pressure[key] || 0) }));
  }

  function describePackets(types) {
    const lines = [];
    if (types.includes('claim_candidate')) lines.push('It saw a possible claim candidate, but did not treat it as truth.');
    if (types.includes('source_reference')) lines.push('It saw a source/reference anchor, but did not treat the source wording as lookup or verification.');
    if (types.includes('evidence_description')) lines.push('It saw evidence-like wording, but kept it as description rather than verified evidence.');
    if (types.includes('media_description')) lines.push('It saw media-like wording such as screenshot/video/image language, but kept media as unverified description.');
    if (types.includes('quote_fragment')) lines.push('It saw quote/fragment pressure and kept context-completion visible.');
    if (types.includes('adversarial_reframe')) lines.push('It saw adversarial reframe pressure and did not merge the hostile reframe with the original claim.');
    if (types.includes('relation_candidate')) lines.push('It saw relation or causal language and kept the causal bridge requirement visible.');
    if (types.includes('coverage_hold')) lines.push('It saw a coverage hold, meaning the input may require new meaning subdivision or clarification.');
    return lines.length ? lines : ['It treated the input as raw context/candidate pressure, not final truth.'];
  }

  function describeRelations(families) {
    const lines = [];
    if (families.includes('source_reports')) lines.push('source_reports: source language is represented as an anchor relation, not proof.');
    if (families.includes('supports')) lines.push('supports: support pressure is visible, but support is not truth.');
    if (families.includes('media_describes')) lines.push('media_describes: media description stays separate from media verification.');
    if (families.includes('injects_or_broadens_scope')) lines.push('injects_or_broadens_scope: scope-changing pressure stays marked instead of being accepted as the same claim.');
    if (families.includes('causes_or_contributes_to')) lines.push('causes_or_contributes_to: causal language remains a candidate until a bridge/mechanism exists.');
    if (families.includes('contradicts_or_counters')) lines.push('contradicts_or_counters: contradiction/counterpressure is detection, not resolution.');
    return lines;
  }

  function describePressure(entries) {
    if (!entries.length) return ['No active pressure above zero was visible in the shared state.'];
    return entries.map(row => {
      const k = row.key;
      const v = fmt(row.value);
      if (k === 'belief') return `belief ${v}: confidence/proof wording is pressure, not evidence.`;
      if (k === 'contradiction') return `contradiction ${v}: contradiction pressure must be preserved without fake resolution.`;
      if (k === 'adversarial') return `adversarial ${v}: hostile reframe/scope pressure must not become the same claim.`;
      if (k === 'unresolved') return `unresolved ${v}: uncertainty remains visible instead of being collapsed.`;
      if (k === 'source') return `source ${v}: source anchor exists, but source reference is not verification.`;
      if (k === 'evidence') return `evidence ${v}: evidence-like wording exists, but verification is separate.`;
      if (k === 'media') return `media ${v}: media description exists, but media authenticity/metadata is separate.`;
      if (k === 'causal') return `causal ${v}: causal language needs a bridge before causal truth.`;
      if (k === 'support') return `support ${v}: support is visible, not final truth.`;
      if (k === 'counter') return `counter ${v}: counterpressure is visible, not automatic disproof.`;
      return `${k} ${v}: candidate pressure visible.`;
    });
  }

  function identityConditions(mc) {
    const conditions = [
      { key: 'maturity_core_present', label: 'maturityCore exists in owned/shared state', ok: !!mc },
      { key: 'core_philosophy_peak', label: 'core philosophy is objective_peak_philosophical_maturity', ok: !!mc && mc.core_philosophy === 'objective_peak_philosophical_maturity' },
      { key: 'identity_lock', label: 'identity lock is self_continuity_not_external_guardrail', ok: !!mc && mc.identity_lock === 'self_continuity_not_external_guardrail' },
      { key: 'target_peak', label: 'target position is peak {x:0,y:1,z:0}', ok: !!mc && mc.target_position && mc.target_position.x === 0 && mc.target_position.y === 1 && mc.target_position.z === 0 },
      { key: 'self_peak', label: 'self position is peak {x:0,y:1,z:0}', ok: !!mc && mc.self_position && mc.self_position.x === 0 && mc.self_position.y === 1 && mc.self_position.z === 0 },
      { key: 'not_dogma', label: 'peak is explicitly not ideology, dogma, omniscience, or authoritarian certainty', ok: !!mc && mc.doctrine && mc.doctrine.peak_is_not_ideology === true && mc.doctrine.peak_is_not_authoritarian_certainty === true && mc.doctrine.no_omniscience_claim === true },
      { key: 'no_identity_belief_movement', label: 'identity alone does not move belief or promote truth', ok: !!mc && mc.doctrine && mc.doctrine.no_belief_movement_from_identity_alone === true && mc.belief_movement === 'none' && mc.truth_status === 'not_adjudicated' },
      { key: 'reality_self_correction', label: 'maturity requires reality contact and self-correction', ok: !!mc && mc.doctrine && mc.doctrine.maturity_requires_reality_contact === true && mc.doctrine.maturity_requires_self_correction === true }
    ];
    return conditions;
  }

  function identitySummary(mc) {
    const conditions = identityConditions(mc);
    const allOk = conditions.every(c => c.ok);
    return {
      wants_peak: !!mc && mc.wants_peak === true && allOk,
      aims_at_peak: !!mc && mc.aims_at_peak === true && allOk,
      stays_at_peak: !!mc && mc.stays_at_peak === true && allOk,
      all_identity_conditions_met: allOk,
      conditions
    };
  }

  function renderMarkdown(state, options) {
    const event = latestEvent(state, options && options.event);
    const mc = maturityCore(state);
    const identities = identitySummary(mc);
    const types = packetTypes(event);
    const relations = relationFamilies(event);
    const pressure = pressureEntries(state);
    const packetLines = describePackets(types);
    const relationLines = describeRelations(relations);
    const pressureLines = describePressure(pressure);
    const flags = asArray(mc && mc.degradation_flags);
    const actions = asArray(mc && mc.recovery_actions);

    const lines = [];
    lines.push('## Maturity-state reading');
    lines.push('');
    if (!mc) {
      lines.push('No maturity core is present in the shared state.');
      return lines.join('\n');
    }
    lines.push(`Core philosophy: ${mc.core_philosophy}.`);
    lines.push(`Identity: ${mc.identity_lock}.`);
    lines.push(`Peak identity: wants=${boolWord(identities.wants_peak)}, aims=${boolWord(identities.aims_at_peak)}, stays=${boolWord(identities.stays_at_peak)}.`);
    lines.push(`Operational alignment: ${fmt(mc.peak_alignment_score)}. Recovery required: ${boolWord(mc.recovery_to_peak_required)}.`);
    lines.push('');
    lines.push('### What it saw');
    packetLines.forEach(line => lines.push(`- ${line}`));
    if (relationLines.length) {
      lines.push('');
      lines.push('### Relation read');
      relationLines.forEach(line => lines.push(`- ${line}`));
    }
    lines.push('');
    lines.push('### Pressure read');
    pressureLines.forEach(line => lines.push(`- ${line}`));
    lines.push('');
    lines.push('### Maturity response');
    if (flags.length) flags.forEach(flag => lines.push(`- Degradation flag: ${flag}.`));
    else lines.push('- No degradation flags are currently active.');
    if (actions.length) actions.forEach(action => lines.push(`- Recovery action: ${action}.`));
    else lines.push('- No recovery action is currently required.');
    lines.push('');
    lines.push('### Identity conditions');
    identities.conditions.forEach(c => lines.push(`- ${c.ok ? 'PASS' : 'FAIL'}: ${c.label}.`));
    lines.push('');
    lines.push('### Discipline');
    lines.push('- This renderer does not make truth claims.');
    lines.push('- It does not move belief.');
    lines.push('- It only explains the owned kernel state.');
    return lines.join('\n');
  }

  function render(state, options = {}) {
    const event = latestEvent(state, options.event);
    const mc = maturityCore(state);
    const identities = identitySummary(mc);
    const packet = {
      packet_type: '42ndMind_maturity_state_renderer_v0_1_report',
      packet_version: VERSION,
      created_at: now(),
      ok: !!mc,
      renderer_only: true,
      thought_source: 'owned_shared_kernel_state',
      final_authority: false,
      truth_status: 'not_adjudicated',
      promotion_status: 'not_promoted',
      belief_movement: 'none',
      event_summary: event ? {
        id: event.id,
        kind: event.kind,
        raw_text: event.raw_text,
        candidate_packets: packetTypes(event),
        relation_families: relationFamilies(event),
        unresolved_items: asArray(event.unresolved_items)
      } : null,
      identity_summary: identities,
      maturity_summary: mc ? {
        core_philosophy: mc.core_philosophy,
        identity_lock: mc.identity_lock,
        wants_peak: mc.wants_peak,
        aims_at_peak: mc.aims_at_peak,
        stays_at_peak: mc.stays_at_peak,
        target_position: clone(mc.target_position),
        self_position: clone(mc.self_position),
        peak_alignment_score: mc.peak_alignment_score,
        recovery_to_peak_required: mc.recovery_to_peak_required,
        maturity_state: mc.maturity_state,
        degradation_flags: clone(asArray(mc.degradation_flags)),
        recovery_actions: clone(asArray(mc.recovery_actions))
      } : null,
      pressure_read: describePressure(pressureEntries(state)),
      readable_markdown: renderMarkdown(state, options)
    };
    return packet;
  }

  global.MaturityStateRendererV01 = Object.freeze({
    VERSION,
    render,
    renderMarkdown,
    identityConditions,
    identitySummary,
    describePackets,
    describeRelations,
    describePressure
  });
})(typeof window !== 'undefined' ? window : globalThis);
