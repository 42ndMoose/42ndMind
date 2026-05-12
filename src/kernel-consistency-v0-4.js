/* 42ndMind Kernel Consistency v0.4
 *
 * Purpose:
 * Track consistency across candidate claims, recovered intentions, evidence,
 * and v0.4 state entries before probability/confidence is trusted.
 *
 * This module does not decide truth. It detects pressure:
 * - apparent contradiction
 * - duplicate claim/provenance pressure
 * - unresolved tension
 * - consistency support
 *
 * Doctrine:
 * - contradiction is not failure; hidden contradiction is failure
 * - duplicate provenance is not independent convergence
 * - consistency should constrain probability, not replace evidence
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DECISIONS = Object.freeze({
    CONSISTENT: 'CONSISTENT',
    TENSION_VISIBLE: 'TENSION_VISIBLE',
    CONTRADICTION_VISIBLE: 'CONTRADICTION_VISIBLE',
    INSUFFICIENT_STRUCTURE: 'INSUFFICIENT_STRUCTURE'
  });

  function text(value) { return String(value ?? '').trim(); }
  function lower(value) { return text(value).toLowerCase(); }
  function asArray(value) { return Array.isArray(value) ? value : []; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function unique(items) { return Array.from(new Set(asArray(items).map(text).filter(Boolean))); }

  const STOP = new Set('the a an and or but if then because therefore this that those these of to in on for with from by as at be is are was were it its they them he she we you i claim claims source evidence record document form issue matter thing whole'.split(' '));

  function tokens(value) {
    return lower(value).match(/[a-z0-9][a-z0-9'_-]*/g) || [];
  }

  function contentTokens(value) {
    return tokens(value).filter(t => !STOP.has(t) && t.length > 2);
  }

  function signature(value) {
    return unique(contentTokens(value)).sort().join('|');
  }

  function hasNegation(value) {
    return /\b(no|not|never|none|without|false|wrong|contradicts|contradicted|cannot|can't|isn't|aren't|wasn't|weren't|didn't|doesn't|don't|failed|fails|invalid)\b/i.test(value);
  }

  function hasAffirmation(value) {
    return /\b(is|are|was|were|does|did|has|have|supports|supported|proves|shown|shows|confirms|confirmed|valid|true|submitted|exists|present)\b/i.test(value) && !hasNegation(value);
  }

  function provenanceIds(item) {
    const links = item && item.links || {};
    const meta = item && item.meta || {};
    return unique(asArray(item && item.source_ids)
      .concat(asArray(links.source_ids))
      .concat(asArray(meta.source_ids))
      .concat(asArray(item && item.provenance_ids))
      .concat(asArray(item && item.sources)));
  }

  function normalizeItem(item, index) {
    if (typeof item === 'string') item = { text:item };
    item = item && typeof item === 'object' ? item : { text:String(item ?? '') };
    const body = text(item.text || item.claim || item.meaning || item.input_preview || item.title || item.label);
    const sig = signature(body);
    return {
      id: text(item.id || item.client_id || item.entry_id || `item_${index}`),
      index,
      text: body,
      signature: sig,
      token_count: contentTokens(body).length,
      negated: hasNegation(body),
      affirmed: hasAffirmation(body),
      confidence: Number.isFinite(Number(item.confidence)) ? clamp(item.confidence, 0, 1) : null,
      source_ids: provenanceIds(item),
      support_status: text(item.support_status || item.source_review_status || item.review_status || (item.links && item.links.support_status) || ''),
      raw: item
    };
  }

  function overlap(a, b) {
    const A = new Set(contentTokens(a));
    const B = new Set(contentTokens(b));
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach(t => { if (B.has(t)) inter += 1; });
    return inter / Math.min(A.size, B.size);
  }

  function sameProvenance(a, b) {
    if (!a.source_ids.length || !b.source_ids.length) return false;
    const B = new Set(b.source_ids);
    return a.source_ids.some(id => B.has(id));
  }

  function pairwise(items) {
    const conflicts = [];
    const duplicates = [];
    const reinforcements = [];
    for (let i = 0; i < items.length; i += 1) {
      for (let j = i + 1; j < items.length; j += 1) {
        const a = items[i], b = items[j];
        const sim = overlap(a.text, b.text);
        if (sim < 0.45) continue;
        const sameProv = sameProvenance(a, b);
        if (a.negated !== b.negated && (a.affirem || true)) {
          conflicts.push({
            type: 'apparent_contradiction',
            item_a: a.id,
            item_b: b.id,
            similarity: Number(sim.toFixed(3)),
            same_provenance: sameProv,
            reason: 'similar content with opposite polarity or contradiction language'
          });
        } else if (sim >= 0.82 || a.signature === b.signature) {
          duplicates.push({
            type: sameProv ? 'duplicate_same_provenance' : 'duplicate_or_restated_claim',
            item_a: a.id,
            item_b: b.id,
            similarity: Number(sim.toFixed(3)),
            same_provenance: sameProv,
            independent_convergence: !sameProv
          });
        } else if (!sameProv && sim >= 0.55) {
          reinforcements.push({
            type: 'possible_independent_reinforcement',
            item_a: a.id,
            item_b: b.id,
            similarity: Number(sim.toFixed(3)),
            same_provenance: false
          });
        }
      }
    }
    return { conflicts, duplicates, reinforcements };
  }

  function score(items, pairs) {
    if (!items.length) return 0;
    let s = 1;
    s -= Math.min(0.55, pairs.conflicts.length * 0.18);
    s -= Math.min(0.25, pairs.duplicates.filter(d => d.same_provenance).length * 0.08);
    s += Math.min(0.12, pairs.reinforcements.length * 0.03);
    const unstructured = items.filter(i => i.token_count < 2).length;
    s -= Math.min(0.2, unstructured * 0.04);
    return clamp(Number(s.toFixed(3)), 0, 1);
  }

  function decide(items, pairs, consistencyScore) {
    if (!items.length || items.every(i => i.token_count < 2)) return DECISIONS.INSUFFICIENT_STRUCTURE;
    if (pairs.conflicts.length > 0) return DECISIONS.CONTRADICTION_VISIBLE;
    if (pairs.duplicates.some(d => d.same_provenance)) return DECISIONS.TENSION_VISIBLE;
    if (consistencyScore < 0.78) return DECISIONS.TENSION_VISIBLE;
    return DECISIONS.CONSISTENT;
  }

  function analyze(input, options = {}) {
    const rawItems = Array.isArray(input) ? input : asArray(input && (input.items || input.claims || input.interpretations || input.entries));
    const items = rawItems.map(normalizeItem).filter(i => i.text);
    const pairs = pairwise(items);
    const consistencyScore = score(items, pairs);
    const decision = decide(items, pairs, consistencyScore);
    return {
      packet_type: '42ndMind_kernel_consistency_report_v0_4',
      packet_version: VERSION,
      created_at: new Date().toISOString(),
      decision,
      consistency_score: consistencyScore,
      item_count: items.length,
      items,
      conflicts: pairs.conflicts,
      duplicates: pairs.duplicates,
      reinforcements: pairs.reinforcements,
      probability_constraints: {
        max_probability_if_contradiction_visible: decision === DECISIONS.CONTRADICTION_VISIBLE ? 0.5 : 1,
        duplicate_same_provenance_counts_as_independent: false,
        consistency_should_constrain_probability: true
      },
      doctrine: {
        contradiction_is_not_failure_hidden_contradiction_is_failure: true,
        duplicate_provenance_is_not_independent_convergence: true,
        consistency_does_not_replace_evidence: true,
        consistency_precedes_probability_calibration: true
      }
    };
  }

  function sampleItems(kind) {
    if (kind === 'contradiction') return [
      { id:'a', text:'The form was submitted before the deadline.', source_ids:['s1'], confidence:0.7 },
      { id:'b', text:'The form was not submitted before the deadline.', source_ids:['s2'], confidence:0.7 }
    ];
    if (kind === 'duplicate_same_provenance') return [
      { id:'a', text:'The timestamp supports the bounded claim.', source_ids:['s1'], confidence:0.6 },
      { id:'b', text:'The timestamp supports the bounded claim.', source_ids:['s1'], confidence:0.6 }
    ];
    if (kind === 'reinforcement') return [
      { id:'a', text:'The timestamp supports the bounded claim.', source_ids:['s1'], confidence:0.6 },
      { id:'b', text:'The record confirms the bounded claim.', source_ids:['s2'], confidence:0.62 }
    ];
    return [
      { id:'a', text:'The source supports the bounded claim but motive remains unresolved.', source_ids:['s1'], confidence:0.55 },
      { id:'b', text:'Motive remains unresolved until direct evidence is reviewed.', source_ids:['s2'], confidence:0.55 }
    ];
  }

  global.KernelConsistencyV04 = Object.freeze({
    VERSION,
    DECISIONS,
    analyze,
    sampleItems,
    normalizeItem,
    overlap,
    signature
  });
})(typeof window !== 'undefined' ? window : globalThis);
