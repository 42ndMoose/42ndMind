/*
  42ndMind Dossier Source Graph v0.1

  Purpose:
  Convert curated dossier-style packets into a small source graph without
  treating coherence as automatic truth.

  This is intentionally pure and browser-safe. It does not fetch URLs, does not
  verify facts by itself, and does not mutate the core kernel automatically.
*/
(function (global) {
  const VERSION = '0.1.1';
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
    return {
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
    samplePacket
  };
})(typeof window !== 'undefined' ? window : globalThis);
