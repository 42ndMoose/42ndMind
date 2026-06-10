(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindRecursiveUnitBrainCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-9;

  function A(value) { return Array.isArray(value) ? value : []; }
  function O(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function text(value) { return String(value == null ? '' : value); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function clamp01(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
  }
  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }

  function cleanId(value) {
    const s = text(value).trim();
    return s || 'unit';
  }

  function rawWeight(row) {
    const value = row && row.w != null ? row.w : row && row.weight != null ? row.weight : 1;
    return Math.max(0, Math.abs(Number(value) || 0));
  }

  function normalizeWeights(rows) {
    const clean = A(rows).map((row, index) => {
      const source = O(row);
      return Object.assign({}, source, {
        id: cleanId(source.id || source.dimension || source.name || ('child_' + index)),
        raw: rawWeight(source)
      });
    }).filter(row => row.id);
    if (!clean.length) return [];
    const total = clean.reduce((sum, row) => sum + row.raw, 0) || 1;
    let used = 0;
    return clean.map((row, index) => {
      const w = index === clean.length - 1 ? R(Math.max(0, 1 - used)) : R(row.raw / total);
      used = R(used + w);
      const out = Object.assign({}, row, { w });
      delete out.raw;
      return out;
    });
  }

  function l1(children) {
    return R(A(children).reduce((sum, child) => sum + Math.abs(Number(child.w || 0)), 0));
  }

  function normalizeNode(input) {
    const source = O(input);
    const rows = normalizeWeights(source.children || source.dimensions || []);
    const children = rows.map(row => {
      const child = normalizeNode(Object.assign({}, row, { children: row.children || row.dimensions || [] }));
      child.w = row.w;
      child.parent_weight = row.w;
      return child;
    });
    const childTotal = l1(children);
    const leaf = children.length === 0;
    return {
      id: cleanId(source.id || source.dimension || source.name || 'unit'),
      equation: cleanId(source.id || source.dimension || source.name || 'unit') + ' = 1',
      invariant: 'sum(children) = 1 when defined; leaf remains vague unit',
      unit: 1,
      w: source.w == null ? 1 : R(source.w),
      parent_weight: source.parent_weight == null ? source.w == null ? 1 : R(source.w) : R(source.parent_weight),
      child_total: leaf ? 0 : childTotal,
      ok: leaf || Math.abs(childTotal - 1) < 1e-6,
      leaf,
      vague: leaf && source.vague !== false,
      children,
      meta: O(source.meta),
      empty_text: ''
    };
  }

  function walk(node, path, out) {
    const currentPath = A(path).concat([node.id]);
    out.push({ path: currentPath.join('/'), id: node.id, leaf: node.leaf, vague: node.vague, child_total: node.child_total, ok: node.ok, child_count: A(node.children).length, w: node.w });
    A(node.children).forEach(child => walk(child, currentPath, out));
    return out;
  }

  function stats(root) {
    const rows = walk(root, [], []);
    const unitViolations = rows.filter(row => !row.ok);
    const vagueMass = rows.filter(row => row.vague).reduce((sum, row) => sum + Number(row.w || 0), 0);
    const maxDepth = rows.reduce((max, row) => Math.max(max, row.path.split('/').length), 0);
    return {
      node_count: rows.length,
      leaf_count: rows.filter(row => row.leaf).length,
      vague_count: rows.filter(row => row.vague).length,
      vague_mass: R(vagueMass),
      max_depth: maxDepth,
      unit_violation_count: unitViolations.length,
      unit_violations: unitViolations,
      rows
    };
  }

  function project(input, context) {
    const root = normalizeNode(input || { id: 'brain' });
    const s = stats(root);
    const kernelError = R(s.unit_violation_count ? 1 : 0);
    return {
      packet_type: '42ndMind_recursive_unit_brain_projection_v0_1',
      version: VERSION,
      principle: 'recursive_unit_total_state_projected_through_kernel_constraints',
      ok: kernelError === 0,
      invariant: 'every defined local one normalizes its children to one; undefined leaves remain valid vague units',
      root,
      kernel_error: kernelError,
      unit_violation_count: s.unit_violation_count,
      vague_mass: s.vague_mass,
      node_count: s.node_count,
      leaf_count: s.leaf_count,
      max_depth: s.max_depth,
      context: O(context),
      empty_text: ''
    };
  }

  function mergeChildren(existing, incoming) {
    const byId = {};
    A(existing).forEach(row => { byId[cleanId(row.id)] = clone(row); });
    A(incoming).forEach(row => {
      const id = cleanId(row.id || row.dimension || row.name);
      const prev = O(byId[id]);
      byId[id] = Object.assign({}, prev, clone(row), { id, w: rawWeight(prev) + rawWeight(row) });
    });
    return Object.keys(byId).sort().map(id => byId[id]);
  }

  function refineAt(node, path, children) {
    const target = A(path);
    if (!target.length || target[0] === node.id) {
      if (target.length <= 1) {
        return normalizeNode(Object.assign({}, node, { children: mergeChildren(node.children, children), vague: false }));
      }
      const rest = target.slice(1);
      return normalizeNode(Object.assign({}, node, {
        children: A(node.children).map(child => child.id === rest[0] ? refineAt(child, rest, children) : child)
      }));
    }
    return normalizeNode(node);
  }

  function refineByContact(input, contact) {
    const base = normalizeNode(input || { id: 'brain' });
    const path = A(contact && contact.path).length ? A(contact.path) : [base.id];
    const children = A(contact && contact.children).length ? A(contact.children) : A(contact && contact.dimensions);
    const refined = refineAt(base, path, children);
    return Object.assign(project(refined, { contact: O(contact) }), {
      refinement: {
        path,
        added_or_reweighted_children: children.map(row => cleanId(row.id || row.dimension || row.name)),
        source: 'contact_defined_vague_or_underweighted_unit'
      }
    });
  }

  function liveProjection(input) {
    const value = O(input);
    const c = O(value.coupling || value.state && value.state.reflection && value.state.reflection.coupling);
    const internal = O(value.internal_state || value.state && value.state.internal_state);
    const expression = O(value.expression);
    const truthContact = clamp01(c.truth && c.truth.contact || expression.objective_reality_gate && expression.objective_reality_gate.score || 0);
    const truthDamage = clamp01(c.truth && c.truth.damage || 0);
    const languageGrowth = clamp01(c.language && c.language.growth_pressure || 0);
    const languageCoherence = clamp01(c.language && c.language.coherence || 0);
    const sourceIdentity = clamp01(c.source && c.source.identity || 0);
    const actionMutation = clamp01(c.action && c.action.mutation_pressure || 0);
    const symbols = Math.min(1, A(internal.symbols).length / 128);
    const relations = Math.min(1, A(internal.relations).length / 128);
    const mutations = Math.min(1, A(internal.mutations).length / 32);
    const virtualEdits = Math.min(1, A(internal.virtual_edits).length / 32);
    const root = {
      id: 'one_logic_brain',
      children: [
        { id: 'kernel', w: 1, children: [
          { id: 'unit_total_constraint', w: 1 },
          { id: 'proof_obligation_constraint', w: expression.objective_reality_gate ? 1 : 0.5 },
          { id: 'reality_contact_constraint', w: truthContact + EPS },
          { id: 'source_body_identity_constraint', w: sourceIdentity + EPS }
        ] },
        { id: 'language', w: 1, children: [
          { id: 'coherence', w: languageCoherence + EPS },
          { id: 'symbol_memory', w: symbols + EPS },
          { id: 'relation_memory', w: relations + EPS },
          { id: 'growth_pressure', w: languageGrowth + EPS },
          { id: 'vague_abstraction_capacity', w: Math.max(EPS, 1 - Math.max(symbols, relations)) }
        ] },
        { id: 'truth', w: 1, children: [
          { id: 'contact', w: truthContact + EPS },
          { id: 'damage_guard', w: Math.max(EPS, 1 - truthDamage) },
          { id: 'belief_separation', w: 1 }
        ] },
        { id: 'memory', w: 1, children: [
          { id: 'mutation_memory', w: mutations + EPS },
          { id: 'virtual_state_memory', w: virtualEdits + EPS },
          { id: 'current_body_memory', w: 1 }
        ] },
        { id: 'action', w: 1, children: [
          { id: 'mutation_pressure', w: actionMutation + EPS },
          { id: 'source_promotion_boundary', w: 1 }
        ] }
      ]
    };
    const projection = project(root, { source: 'live_self_stable_expression', generation: internal.generation || 0, t: value.state && value.state.t || 0 });
    projection.contact = {
      truth_contact: R(truthContact),
      language_growth_pressure: R(languageGrowth),
      source_identity: R(sourceIdentity),
      mutation_pressure: R(actionMutation),
      symbol_memory: R(symbols),
      relation_memory: R(relations)
    };
    return projection;
  }

  return Object.freeze({ VERSION, normalizeWeights, normalizeNode, project, refineByContact, liveProjection, stats, l1 });
});
