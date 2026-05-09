/*
  42ndMind Dossier Source Graph v0.1

  Purpose:
  Convert curated dossier-style packets into a small source graph without
  treating coherence as automatic truth.

  This is intentionally pure and browser-safe. It does not fetch URLs, does not
  verify facts by itself, and does not mutate the core kernel automatically.
*/
(function (global) {
  const VERSION = '0.1.2';
  const VALID_KINDS = ['fact', 'inference', 'interpretation', 'hypothesis'];

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function text(value) {
    return String(value || '').trim();
  }

  function normalizeKind(kind) {
    const normalized = text(kind).toLowerCase();
    return VALID_KINDS.includes(normalized) ? normalized : 'hypothesis';
  }

  function defaultStatus(kind, evidence, counters) {
    if (kind === 'fact' && evidence.length > 0 && counters.length === 0) return 'supported';
    if (kind === 'hypothesis' || counters.length > 0 || evidence.length === 0) return 'unresolved';
    return 'candidate';
  }

  function kindWeight(kind) {
    return {
      fact: 1,
      inference: 0.75,
      interpretation: 0.55,
      hypothesis: 0.35
    }[kind] || 0.35;
  }

  function normalizeItem(raw, index) {
    const kind = normalizeKind(raw.kind);
    const evidence = asArray(raw.evidence).map(text).filter(Boolean);
    const counters = asArray(raw.counter_considerations).map(text).filter(Boolean);
    const claim = text(raw.claim || raw.text);
    const status = text(raw.status) || defaultStatus(kind, evidence, counters);
    return {
      id: text(raw.id) || `dossier_item_${index + 1}`,
      kind,
      claim,
      status,
      evidence,
      counter_considerations: counters,
      source_links: asArray(raw.source_links || raw.sources).map(text).filter(Boolean),
      confidence: typeof raw.confidence === 'number' ? raw.confidence : kindWeight(kind),
      notes: asArray(raw.notes).map(text).filter(Boolean)
    };
  }

  function nodeForItem(item) {
    const unresolved = item.status === 'unresolved' || item.kind === 'hypothesis' || item.counter_considerations.length > 0;
    return {
      id: `dossier_node:${item.id}`,
      type: `dossier_${item.kind}`,
      label: item.claim || `(empty ${item.kind})`,
      source_id: item.id,
      status: unresolved ? 'unresolved' : item.status,
      evidence_count: item.evidence.length,
      counter_count: item.counter_considerations.length,
      source_link_count: item.source_links.length,
      weight: kindWeight(item.kind),
      merge_allowed: item.kind === 'fact' && item.evidence.length > 0 && item.counter_considerations.length === 0,
      notes: unresolved ? ['Keep counter-considerations live; do not merge as settled truth.'] : []
    };
  }

  function linkForItem(item) {
    const relation = item.kind === 'fact' && item.evidence.length > 0 && item.counter_considerations.length === 0
      ? 'supports_source_graph'
      : 'pressures_source_graph';
    return {
      from: `dossier_node:${item.id}`,
      to: 'dossier_source_graph_root',
      relation,
      kind: item.kind,
      status: item.status
    };
  }

  function kernelClaimForItem(item) {
    return {
      client_id: `dossier_claim_${item.id}`,
      text: item.claim,
      subject: 'dossier_source',
      object: item.kind,
      scope: `dossier_${item.kind}`,
      confidence: item.confidence,
      status: item.status === 'supported' && item.kind === 'fact' ? 'active' : 'unresolved'
    };
  }

  function kernelEvidenceForItem(item) {
    const claimId = `dossier_claim_${item.id}`;
    const evidenceRows = item.evidence.map((entry, index) => ({
      text: entry,
      relation: 'supports',
      target: claimId,
      strength: item.kind === 'fact' ? 'moderate' : 'weak',
      confidence: item.kind === 'fact' ? 0.75 : 0.55,
      source: 'dossier_source_graph',
      links: { client_id: claimId, source_item_id: item.id, evidence_index: index }
    }));
    const sourceRows = item.source_links.map((entry, index) => ({
      text: `source_link: ${entry}`,
      relation: 'supports',
      target: claimId,
      strength: 'weak',
      confidence: 0.5,
      source: 'dossier_source_graph',
      links: { client_id: claimId, source_item_id: item.id, source_link_index: index }
    }));
    return evidenceRows.concat(sourceRows);
  }

  function kernelObservationsForItem(item) {
    const observations = [];
    item.counter_considerations.forEach((entry) => {
      observations.push({
        text: `counter_consideration for ${item.kind}: ${entry}`,
        status: 'unresolved',
        reason: `Counter-consideration remains live for dossier item ${item.id}.`
      });
    });
    if (item.kind !== 'fact') {
      observations.push({
        text: `${item.kind}_pressure: ${item.claim}`,
        status: item.status === 'supported' ? 'candidate' : 'unresolved',
        reason: `${item.kind} is imported as pressure, not settled truth.`
      });
    }
    if (item.evidence.length === 0) {
      observations.push({
        text: `evidence_gap for ${item.kind}: ${item.claim}`,
        status: 'unresolved',
        reason: `Dossier item ${item.id} has no direct evidence entries.`
      });
    }
    return observations;
  }

  function kernelQuestionsForItem(item) {
    const questions = [];
    if (item.status === 'unresolved' || item.kind === 'hypothesis' || item.counter_considerations.length > 0 || item.evidence.length === 0) {
      questions.push({
        text: `What evidence would support or weaken this ${item.kind}: ${item.claim}`,
        links: { client_id: `dossier_claim_${item.id}`, source_item_id: item.id, source: 'dossier_source_graph_v0_1' }
      });
    }
    return questions;
  }

  function toKernelCommand(report) {
    const sourceItemsById = Object.fromEntries((report.source_items || []).map(item => [item.id, item]));
    const items = Object.values(sourceItemsById);
    const claims = items.map(kernelClaimForItem);
    const evidence = items.flatMap(kernelEvidenceForItem);
    const observations = items.flatMap(kernelObservationsForItem);
    const questions = items.flatMap(kernelQuestionsForItem);
    const gate_events = [];

    if (items.some(item => item.counter_considerations.length > 0)) {
      gate_events.push({
        gate: 'G1_counter_consideration',
        direction: 'positive',
        strength: 'moderate',
        confidence: 0.75,
        evidence: 'Dossier source graph imported live counter-considerations.',
        reason: 'Counter-considerations were preserved instead of flattened away.',
        scope: 'dossier_source_graph'
      });
    }
    if (items.some(item => item.evidence.length > 0 || item.source_links.length > 0)) {
      gate_events.push({
        gate: 'G5_reality_contact',
        direction: 'positive',
        strength: 'moderate',
        confidence: 0.7,
        evidence: 'Dossier source graph imported evidence/source-link entries.',
        reason: 'Evidence paths were kept separate from interpretation and hypothesis.',
        scope: 'dossier_source_graph'
      });
    }

    return {
      command_type: 'epistemic_kernel_command',
      created_by: 'dossier-source-graph-v0.1',
      requires_user_approval: true,
      commands: [
        {
          op: 'import_packet',
          packet: {
            packet_type: 'epistemic_extraction_packet',
            packet_version: 'dossier_source_graph_v0_1',
            source: 'dossier_source_graph',
            claims,
            evidence,
            principles: [],
            dependencies: [],
            observations,
            questions,
            gate_events,
            meta: {
              source_title: report.source_title,
              source_graph_version: report.version,
              facts_are_not_whole_dossier_truth: true,
              inference_interpretation_hypothesis_stay_separate: true,
              counter_considerations_remain_live: true,
              no_external_fetch_or_fact_verification: true,
              no_core_rule_promotion: true
            }
          }
        }
      ]
    };
  }

  function importPacket(packet) {
    const items = asArray(packet && packet.items).map(normalizeItem).filter(item => item.claim);
    const nodes = [
      {
        id: 'dossier_source_graph_root',
        type: 'dossier_source_graph',
        label: text(packet && packet.title) || 'Dossier source graph',
        status: 'aggregate_candidate',
        merge_allowed: false,
        notes: ['A coherent dossier is not automatically true; claims remain typed and pressure-aware.']
      }
    ].concat(items.map(nodeForItem));
    const links = items.map(linkForItem);
    const unresolved = items.filter(item => item.status === 'unresolved' || item.kind === 'hypothesis' || item.counter_considerations.length > 0);
    const root = nodes[0];
    const counts = VALID_KINDS.reduce((acc, kind) => {
      acc[kind] = items.filter(item => item.kind === kind).length;
      return acc;
    }, {});
    const pass_checks = {
      has_fact: counts.fact > 0,
      has_inference: counts.inference > 0,
      has_interpretation: counts.interpretation > 0,
      has_hypothesis: counts.hypothesis > 0,
      has_evidence: items.some(item => item.evidence.length > 0),
      has_counter_consideration: items.some(item => item.counter_considerations.length > 0),
      prevents_auto_truth_merge: nodes.every(node => node.id === 'dossier_source_graph_root' || node.merge_allowed === (node.type === 'dossier_fact' && node.evidence_count > 0 && node.counter_count === 0)),
      has_unresolved_pressure: unresolved.length > 0,
      root_blocks_direct_merge: root.merge_allowed === false
    };
    const report = {
      packet_type: '42ndMind_dossier_source_graph_report',
      version: VERSION,
      created_at: new Date().toISOString(),
      source_title: text(packet && packet.title) || null,
      counts,
      total_items: items.length,
      unresolved_count: unresolved.length,
      nodes,
      links,
      unresolved,
      source_items: items,
      pass_checks,
      pass: Object.values(pass_checks).every(Boolean),
      guardrails: {
        facts_are_not_whole_dossier_truth: true,
        inference_interpretation_hypothesis_stay_separate: true,
        counter_considerations_remain_live: true,
        no_external_fetch_or_fact_verification: true,
        no_core_rule_promotion: true
      }
    };
    report.epistemic_kernel_command = toKernelCommand(report);
    return report;
  }

  function samplePacket() {
    return {
      title: 'Sample dossier section',
      items: [
        {
          id: 'd1',
          kind: 'fact',
          claim: 'The page contains a published claim.',
          evidence: ['source link supplied by user'],
          source_links: ['https://example.invalid/source'],
          status: 'supported'
        },
        {
          id: 'd2',
          kind: 'inference',
          claim: 'The claim may imply coordination.',
          evidence: ['pattern match'],
          counter_considerations: ['could be independent convergence'],
          status: 'unresolved'
        },
        {
          id: 'd3',
          kind: 'interpretation',
          claim: 'The framing favors one conclusion.',
          evidence: ['wording analysis'],
          counter_considerations: ['alternate editorial explanation'],
          status: 'candidate'
        },
        {
          id: 'd4',
          kind: 'hypothesis',
          claim: 'The source may be strategically shaped.',
          evidence: [],
          counter_considerations: ['needs stronger source evidence'],
          status: 'unresolved'
        }
      ]
    };
  }

  global.DossierSourceGraphV01 = {
    VERSION,
    VALID_KINDS,
    importPacket,
    toKernelCommand,
    samplePacket
  };
})(typeof window !== 'undefined' ? window : globalThis);
