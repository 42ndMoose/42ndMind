(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindRecursiveUnitBrainCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.2.0';
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
        id: cleanId(source.id || source.dimension || source.name || ('aspect_' + index)),
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
    const id = cleanId(source.id || source.dimension || source.name || 'unit');
    const childTotal = l1(children);
    const leaf = children.length === 0;
    return {
      id,
      equation: id + ' = 1',
      invariant: 'sum(aspects) = 1 when defined; leaf remains vague unit',
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
    out.push({ path: currentPath.join('/'), id: node.id, leaf: node.leaf, vague: node.vague, child_total: node.child_total, ok: node.ok, child_count: A(node.children).length, w: node.w, meta: O(node.meta) });
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

  function symbolBase(id, fallback) {
    const words = cleanId(id || fallback || 'aspect').split(/[^A-Za-z0-9]+/).filter(Boolean);
    return (words.slice(0, 3).map(word => word.charAt(0)).join('') || 'A').toUpperCase();
  }

  function symbolMap(root) {
    const map = {};
    const used = {};
    map[root.id] = 'B';
    (function visit(node) {
      A(node.children).forEach((child, index) => {
        const base = symbolBase(child.id, 'A' + (index + 1));
        const count = used[base] || 0;
        used[base] = count + 1;
        map[child.id] = count ? base + (count + 1) : base;
        visit(child);
      });
    })(root);
    return map;
  }

  function formulasFor(node, symbols) {
    const s = symbols[node.id] || symbolBase(node.id);
    const children = A(node.children);
    if (!children.length) return [s + ' = 1', s + ' = unresolved local one'];
    const terms = children.map(child => symbols[child.id] || symbolBase(child.id));
    return [
      s + ' = ' + terms.join(' ⊕ '),
      '|' + s + '| = 1',
      terms.map(term => '|' + term + '|').join(' + ') + ' = 1',
      s + '_current = ' + children.map(child => R(child.w) + '·' + (symbols[child.id] || symbolBase(child.id))).join(' + ')
    ];
  }

  function selfDefine(root) {
    const symbols = symbolMap(root);
    const rows = walk(root, [], []);
    const localOnes = rows.map(row => {
      const node = findPath(root, row.path.split('/'));
      return {
        id: row.id,
        symbol: symbols[row.id] || symbolBase(row.id),
        path: row.path,
        leaf: row.leaf,
        vague: row.vague,
        ok: row.ok,
        child_count: row.child_count,
        child_total: row.child_total,
        formulas: node ? formulasFor(node, symbols) : []
      };
    });
    return {
      packet_type: '42ndMind_recursive_unit_self_definition_v0_1',
      root_id: root.id,
      root_symbol: 'B',
      statement: 'the current body defines its visible law from its active aspect structure',
      symbols,
      root_formulas: formulasFor(root, symbols),
      immediate_aspects: A(root.children).map(child => ({
        id: child.id,
        symbol: symbols[child.id] || symbolBase(child.id),
        weight: child.w,
        child_total: child.child_total,
        child_count: A(child.children).length,
        vague: child.vague,
        ok: child.ok
      })),
      local_ones: localOnes,
      empty_text: ''
    };
  }

  function findPath(root, path) {
    const ids = A(path).filter(Boolean);
    if (!ids.length) return null;
    let node = root;
    if (node.id !== ids[0]) return null;
    for (let i = 1; i < ids.length; i += 1) {
      node = A(node.children).find(child => child.id === ids[i]);
      if (!node) return null;
    }
    return node;
  }

  function findToken(root, token) {
    const rows = walk(root, [], []);
    const wanted = text(token).trim();
    const row = rows.find(item => O(item.meta).expression_token === wanted);
    return row || null;
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
      invariant: 'every defined local one normalizes its aspects to one; undefined leaves remain valid vague units',
      root,
      self_definition: selfDefine(root),
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

  function focusExpression(projectionOrRoot, focus) {
    const packet = projectionOrRoot && projectionOrRoot.packet_type ? projectionOrRoot : project(projectionOrRoot || { id: 'brain' });
    const root = packet.root;
    const f = O(focus);
    const token = text(f.expression_token || f.token || 'potato').trim();
    const tokenRow = findToken(root, token);
    const focusPath = A(f.path).length ? A(f.path).join('/') : tokenRow && tokenRow.path;
    const node = focusPath ? findPath(root, focusPath.split('/')) : null;
    const fromBody = !!(node && O(node.meta).expression_token === token);
    const ok = packet.ok === true && fromBody;
    return {
      packet_type: '42ndMind_recursive_unit_focus_expression_v0_1',
      focus_id: cleanId(f.id || 'symbolic_token_focus'),
      ok,
      visible_expression: ok ? token : '',
      expression_token: token,
      whole_body_present: true,
      selective_focus: true,
      source: ok ? 'body_node_meta_expression_token' : 'no_body_node_supplied_the_requested_token',
      body_packet_type: packet.packet_type,
      body_root_id: root.id,
      body_ok: packet.ok === true,
      body_kernel_error: packet.kernel_error,
      focus_path: focusPath || null,
      trace: focusPath ? focusPath.split('/') : [],
      obligation: {
        token_must_exist_inside_current_body: true,
        body_must_preserve_unit_total: true,
        expression_must_not_bypass_body: true,
        satisfied: ok
      },
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
          { id: 'vague_abstraction_capacity', w: Math.max(EPS, 1 - Math.max(symbols, relations)) },
          { id: 'symbolic_token_potato', w: EPS, vague: false, meta: { expression_token: 'potato', role: 'controlled_focus_proof_token' } }
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
    projection.focus_expression_demonstrations = [focusExpression(projection, { id: 'potato_symbolic_focus', token: 'potato' })];
    return projection;
  }

  return Object.freeze({ VERSION, normalizeWeights, normalizeNode, project, refineByContact, liveProjection, stats, l1, selfDefine, focusExpression });
});
