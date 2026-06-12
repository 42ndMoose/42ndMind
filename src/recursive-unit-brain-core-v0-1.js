(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindRecursiveUnitBrainCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.8.0';
  const EPS = 1e-9;

  function A(value) { return Array.isArray(value) ? value : []; }
  function O(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
  function text(value) { return String(value == null ? '' : value); }
  function R(value) { return Number((Number(value) || 0).toFixed(6)); }
  function clamp01(value) { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function clone(value) { return JSON.parse(JSON.stringify(value == null ? null : value)); }
  function cleanId(value) { const s = text(value).trim(); return s || 'unit'; }

  function rawWeight(row) {
    const value = row && row.w != null ? row.w : row && row.weight != null ? row.weight : 1;
    return Math.max(0, Math.abs(Number(value) || 0));
  }

  function normalizeWeights(rows) {
    const clean = A(rows).map((row, index) => {
      const source = O(row);
      return Object.assign({}, source, { id: cleanId(source.id || source.dimension || source.name || ('aspect_' + index)), raw: rawWeight(source) });
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

  function l1(children) { return R(A(children).reduce((sum, child) => sum + Math.abs(Number(child.w || 0)), 0)); }

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
    return { id, equation: id + ' = 1', invariant: 'sum(aspects) = 1 when defined; leaf remains vague unit', unit: 1, w: source.w == null ? 1 : R(source.w), parent_weight: source.parent_weight == null ? source.w == null ? 1 : R(source.w) : R(source.parent_weight), child_total: leaf ? 0 : childTotal, ok: leaf || Math.abs(childTotal - 1) < 1e-6, leaf, vague: leaf && source.vague !== false, children, meta: O(source.meta), empty_text: '' };
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
    return { node_count: rows.length, leaf_count: rows.filter(row => row.leaf).length, vague_count: rows.filter(row => row.vague).length, vague_mass: R(vagueMass), max_depth: maxDepth, unit_violation_count: unitViolations.length, unit_violations: unitViolations, rows };
  }

  function symbolBase(id, fallback) {
    const words = cleanId(id || fallback || 'aspect').split(/[^A-Za-z0-9]+/).filter(Boolean);
    return (words.slice(0, 3).map(word => word.charAt(0)).join('') || 'A').toUpperCase();
  }

  function symbolMap(root) {
    const map = {}, used = {};
    map[root.id] = 'B';
    (function visit(node) {
      A(node.children).forEach((child, index) => {
        const meta = O(child.meta);
        const explicit = text(meta.symbol || meta.local_one_symbol || '').trim();
        const base = explicit || symbolBase(child.id, 'A' + (index + 1));
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
    return [s + ' = ' + terms.join(' ⊕ '), '|' + s + '| = 1', terms.map(term => '|' + term + '|').join(' + ') + ' = 1', s + '_current = ' + children.map(child => R(child.w) + '·' + (symbols[child.id] || symbolBase(child.id))).join(' + ')];
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

  function child(node, id) { return A(node && node.children).find(row => row.id === id) || null; }
  function childAny(node, ids) { return A(ids).map(id => child(node, id)).find(Boolean) || null; }
  function findFirst(root, id) { return walk(root, [], []).map(row => findPath(root, row.path.split('/'))).find(node => node && node.id === id) || null; }
  function pathOf(root, targetId) {
    const row = walk(root, [], []).find(item => item.id === targetId);
    return row ? row.path : null;
  }

  function activeMathLaw() {
    return {
      packet_type: '42ndMind_universal_active_math_law_v0_1',
      law: [
        'B = U ⊕ R ⊕ X ⊕ C ⊕ Ω ⊕ Φ ⊕ P ⊕ G',
        '|B| = 1',
        '∀q ∈ B: q = U_q ⊕ R_q ⊕ X_q ⊕ C_q ⊕ Ω_q ⊕ Φ_q ⊕ P_q ⊕ G_q',
        'B_next = closure(B ⊕ input_unit)',
        'unknown(q) ⇔ ¬stable(R(q))',
        'expression(F_φ(B)) is valid only when P(F_φ(B)) = 1'
      ],
      variables: {
        U: 'units',
        R: 'relations',
        X: 'transformations',
        C: 'constraints',
        'Ω': 'unresolveds',
        'Φ': 'focus field',
        P: 'proof obligations',
        G: 'growth and optimization pressure'
      }
    };
  }

  function languageMathLaw(language, symbols) {
    const L = language ? symbols[language.id] || 'L' : 'L';
    return {
      packet_type: '42ndMind_active_math_language_law_v0_1',
      statement: 'language is a projection of the universal active math, not a separate module',
      symbol: L,
      invariant: '|' + L + '| = 1',
      law: [
        L + ' = U_L ⊕ R_L ⊕ X_L ⊕ C_L ⊕ Ω_L ⊕ Φ_L ⊕ P_L ⊕ G_L',
        '|' + L + '| = 1',
        '∀u ∈ U_L: |u| = 1',
        'definition(u) = stable_closure(R_L(u))',
        'unknown(u) ⇔ ¬stable(R_L(u))',
        'F_φ(' + L + ') = stable_expression selected from ' + L + ' under active focus φ'
      ],
      expression_rule: 'language output is not a UI event; it is the active mathematical expression selected from L',
      unknown_rule: 'an input without stable relations remains an unresolved local one rather than being forced into meaning',
      conservation_rule: 'every expression unit remains one whether defined, partially defined, or unresolved',
      ui_role: 'display only'
    };
  }

  function constructedSequence(node) {
    const meta = O(node && node.meta);
    const children = A(node && node.children);
    if (meta.expression_construction !== 'ordered_symbol_sequence' || !children.length) return null;
    const parts = children.map((child, index) => {
      const m = O(child.meta);
      const position = Number(m.position || index + 1);
      const symbol = text(m.symbol_letter || m.letter || '').trim();
      return { id: child.id, position, symbol, ok: !!symbol && Number.isFinite(position) };
    }).sort((a, b) => a.position - b.position);
    const ok = parts.length > 0 && parts.every(part => part.ok);
    const visible = ok ? parts.map(part => part.symbol).join('') : '';
    return { operator: 'ordered_symbol_sequence', ok, visible_expression: visible, parts, reduction: ok ? parts.map(part => part.symbol).join(' + ') + ' -> ' + visible : '' };
  }

  function candidateExpression(candidate) {
    const direct = constructedSequence(candidate);
    if (direct && direct.ok) return { visible_expression: direct.visible_expression, construction: direct, construction_node_id: candidate.id };
    const childConstruction = A(candidate && candidate.children).map(node => ({ node, construction: constructedSequence(node) })).find(row => row.construction && row.construction.ok);
    if (childConstruction) return { visible_expression: childConstruction.construction.visible_expression, construction: childConstruction.construction, construction_node_id: childConstruction.node.id };
    const metaText = text(O(candidate && candidate.meta).candidate_expression).trim();
    return metaText ? { visible_expression: metaText, construction: null, construction_node_id: null } : null;
  }

  function proofObligationsNode() {
    return { id: 'P_proof_obligations', w: 1, vague: false, meta: { symbol: 'P', active_math_law: 'P(B) = P_B ⊕ P_L ⊕ P_U ⊕ P_Ω ⊕ P_F', role: 'internal proof obligations are part of the same math, not external tests' }, children: [
      { id: 'P_B_universal_active_math', w: 1, meta: { proof: 'B = U ⊕ R ⊕ X ⊕ C ⊕ Ω ⊕ Φ ⊕ P ⊕ G' } },
      { id: 'P_B_brain_conservation', w: 1, meta: { proof: '|B| = 1' } },
      { id: 'P_L_language_projection', w: 1, meta: { proof: 'L is π_language(B)' } },
      { id: 'P_L_language_conservation', w: 1, meta: { proof: '|L| = 1' } },
      { id: 'P_U_local_unit_closure', w: 1, meta: { proof: '∀q ∈ B: |q| = 1' } },
      { id: 'P_Omega_unknown_preservation', w: 1, meta: { proof: 'unknown(q) ⇔ ¬stable(R(q))' } },
      { id: 'P_F_focus_preserves_B_and_L', w: 1, meta: { proof: 'F_φ(B) preserves |B| = 1 and |L| = 1 when expressing language' } }
    ] };
  }

  function semanticFocus(root, requested) {
    const language = findFirst(root, 'language');
    const expressionUnits = childAny(language, ['U_L_expression_units', 'U_expression_units', 'expression_units']);
    const noun = child(expressionUnits, 'word_class_noun') || child(language, 'word_class_noun');
    const food = child(noun, 'semantic_domain_food');
    const set = child(food, 'candidate_set_food_noun');
    const routeNodes = [root, child(root, 'U_units'), language, expressionUnits || noun, expressionUnits ? noun : food, expressionUnits ? food : set, expressionUnits ? set : null].filter(Boolean);
    if (!language || !noun || !food || !set) return null;
    const candidates = A(set.children).map(candidate => {
      const expr = candidateExpression(candidate);
      return { id: candidate.id, weight: candidate.w, visible_expression: expr && expr.visible_expression || '', has_ordered_symbol_construction: !!(expr && expr.construction), construction_node_id: expr && expr.construction_node_id || null, local_one: candidate.unit === 1 };
    });
    const selected = A(set.children).slice().sort((a, b) => Number(b.w || 0) - Number(a.w || 0))[0] || null;
    const selectedExpr = candidateExpression(selected);
    const visible = selectedExpr && selectedExpr.visible_expression || '';
    const requestedText = text(requested || visible).trim();
    const ok = !!selected && !!selectedExpr && (!requestedText || visible === requestedText);
    const selectedPath = selected ? pathOf(root, selected.id) : null;
    const constructionPath = selectedExpr && selectedExpr.construction_node_id ? pathOf(root, selectedExpr.construction_node_id) : selectedPath;
    return { ok, focus_operator: 'F_food_noun', formula: 'F_food_noun(B) -> ' + (ok ? visible : ''), brain_invariant: '|B| = 1', language_invariant: '|L| = 1', route: routeNodes.map(node => node.id), candidate_set_path: pathOf(root, set.id), candidates, selection_rule: 'select highest current focus weight inside noun/food expression units', selected_candidate: selected ? { id: selected.id, weight: selected.w, path: selectedPath, local_one: selected.unit === 1 } : null, visible_expression: ok ? visible : '', construction_path: constructionPath, construction: selectedExpr && selectedExpr.construction || null };
  }

  function proofState(root, symbols) {
    const U = child(root, 'U_units');
    const Rr = child(root, 'R_relations');
    const X = child(root, 'X_transformations');
    const Cc = child(root, 'C_constraints');
    const Om = child(root, 'Omega_unresolveds');
    const Phi = child(root, 'Phi_focus');
    const P = child(root, 'P_proof');
    const G = child(root, 'G_growth');
    const POb = findFirst(root, 'P_proof_obligations');
    const language = findFirst(root, 'language');
    const LU = childAny(language, ['U_L_expression_units', 'U_expression_units']);
    const LR = childAny(language, ['R_L_relations', 'R_relations']);
    const LX = childAny(language, ['X_L_transformations', 'X_transformations']);
    const LC = childAny(language, ['C_L_constraints', 'C_constraints']);
    const LOm = childAny(language, ['Omega_L_unresolveds', 'Omega_unresolveds']);
    const LPhi = childAny(language, ['Phi_L_focus', 'Phi_focus']);
    const LP = childAny(language, ['P_L_proof', 'P_proof']);
    const LG = childAny(language, ['G_L_growth', 'G_growth']);
    const focus = semanticFocus(root, 'potato');
    const checks = [
      { id: 'P_B_universal_active_math', formula: 'B = U ⊕ R ⊕ X ⊕ C ⊕ Ω ⊕ Φ ⊕ P ⊕ G', satisfied: !!(U && Rr && X && Cc && Om && Phi && P && G) },
      { id: 'P_B_brain_conservation', formula: '|B| = 1', satisfied: root && root.ok === true && Math.abs(Number(root.child_total || 0) - 1) < 1e-6 },
      { id: 'P_L_language_projection', formula: 'L = π_language(B)', satisfied: !!language && !!pathOf(root, language.id) },
      { id: 'P_L_language_conservation', formula: '|L| = 1', satisfied: !!language && language.ok === true && Math.abs(Number(language.child_total || 0) - 1) < 1e-6 },
      { id: 'P_L_local_active_math', formula: 'L = U_L ⊕ R_L ⊕ X_L ⊕ C_L ⊕ Ω_L ⊕ Φ_L ⊕ P_L ⊕ G_L', satisfied: !!(language && LU && LR && LX && LC && LOm && LPhi && LP && LG) },
      { id: 'P_U_local_unit_closure', formula: '∀q ∈ B: |q| = 1', satisfied: walk(root, [], []).every(row => row.ok === true || row.leaf === true) },
      { id: 'P_Omega_unknown_preservation', formula: 'unknown(q) ⇔ ¬stable(R(q))', satisfied: !!Om && !!LOm && A(LOm.children).some(row => row.id === 'unresolved_input_ledger') },
      { id: 'P_F_focus_preserves_B_and_L', formula: 'F_φ(B) preserves |B| = 1 and |L| = 1', satisfied: !!(focus && focus.ok && focus.brain_invariant === '|B| = 1' && focus.language_invariant === '|L| = 1') }
    ];
    const satisfied = checks.every(row => row.satisfied === true);
    return { packet_type: '42ndMind_internal_math_proof_state_v0_1', symbol: 'P', formula: 'P(B) = P_B ⊕ P_L ⊕ P_U ⊕ P_Ω ⊕ P_F', invariant: '|P| = 1', proof_node_path: POb ? pathOf(root, POb.id) : null, satisfied, checks, failed: checks.filter(row => !row.satisfied), universal_law: activeMathLaw(), language_law: languageMathLaw(language, symbols) };
  }

  function findConstructedToken(root, wanted) {
    const rows = walk(root, [], []);
    for (const row of rows) {
      const node = findPath(root, row.path.split('/'));
      const construction = constructedSequence(node);
      if (construction && construction.ok && construction.visible_expression === wanted) return { row, node, construction };
    }
    return null;
  }

  function selfDefine(root) {
    const symbols = symbolMap(root);
    const rows = walk(root, [], []);
    const localOnes = rows.map(row => {
      const node = findPath(root, row.path.split('/'));
      const construction = constructedSequence(node);
      return { id: row.id, symbol: symbols[row.id] || symbolBase(row.id), path: row.path, leaf: row.leaf, vague: row.vague, ok: row.ok, child_count: row.child_count, child_total: row.child_total, formulas: node ? formulasFor(node, symbols) : [], construction: construction || null };
    });
    const language = findFirst(root, 'language');
    const languageRows = rows.filter(row => row.path.indexOf(pathOf(root, 'language') || 'no-language') === 0);
    const langLaw = languageMathLaw(language, symbols);
    const internalProof = proofState(root, symbols);
    return { packet_type: '42ndMind_recursive_unit_self_definition_v0_1', root_id: root.id, root_symbol: 'B', statement: 'the current brain defines its visible law from its active math structure', symbols, root_formulas: formulasFor(root, symbols), universal_math: activeMathLaw(), language_math: langLaw, internal_math_proof: internalProof, language_one: language ? { id: language.id, symbol: symbols[language.id] || 'L', invariant: '|L| = 1', active_math_law: langLaw.law, formulas: formulasFor(language, symbols), child_total: language.child_total, ok: language.ok, local_expression_unit_count: languageRows.length } : null, immediate_aspects: A(root.children).map(child => ({ id: child.id, symbol: symbols[child.id] || symbolBase(child.id), weight: child.w, child_total: child.child_total, child_count: A(child.children).length, vague: child.vague, ok: child.ok })), constructed_expressions: localOnes.filter(row => row.construction && row.construction.ok).map(row => ({ id: row.id, path: row.path, visible_expression: row.construction.visible_expression, reduction: row.construction.reduction })), semantic_focuses: [semanticFocus(root, 'potato')].filter(Boolean), local_ones: localOnes, empty_text: '' };
  }

  function project(input, context) {
    const root = normalizeNode(input || { id: 'brain' });
    const symbols = symbolMap(root);
    const internalProof = proofState(root, symbols);
    const s = stats(root);
    const kernelError = R((s.unit_violation_count || !internalProof.satisfied) ? 1 : 0);
    return { packet_type: '42ndMind_recursive_unit_brain_projection_v0_1', version: VERSION, principle: 'universal_active_math_state_projected_through_internal_proof_constraints', ok: kernelError === 0, invariant: 'B is one active math: units, relations, transformations, constraints, unresolveds, focus, proof, and growth are one conserved state', active_math: { universal_law: activeMathLaw(), proof_state: internalProof, language_law: languageMathLaw(findFirst(root, 'language'), symbols) }, root, self_definition: selfDefine(root), kernel_error: kernelError, unit_violation_count: s.unit_violation_count, proof_violation_count: internalProof.failed.length, vague_mass: s.vague_mass, node_count: s.node_count, leaf_count: s.leaf_count, max_depth: s.max_depth, context: O(context), empty_text: '' };
  }

  function focusExpression(projectionOrRoot, focus) {
    const packet = projectionOrRoot && projectionOrRoot.packet_type ? projectionOrRoot : project(projectionOrRoot || { id: 'brain' });
    const root = packet.root;
    const f = O(focus);
    const token = text(f.expression_token || f.token || 'potato').trim();
    const semantic = semanticFocus(root, token);
    const semanticOk = !!(semantic && semantic.ok);
    const fallback = semanticOk ? null : findConstructedToken(root, token);
    const focusPath = semanticOk ? semantic.construction_path : fallback && fallback.row.path;
    const derived = semanticOk ? semantic.visible_expression : fallback && fallback.construction.visible_expression || '';
    const ok = packet.ok === true && derived === token;
    return { packet_type: '42ndMind_recursive_unit_focus_expression_v0_1', focus_id: cleanId(f.id || 'symbolic_token_focus'), ok, visible_expression: ok ? derived : '', requested_expression: token, whole_brain_present: true, brain_invariant: '|B| = 1', language_invariant: semantic && semantic.language_invariant || '|L| = 1', selective_focus: true, focus_formula: semanticOk ? semantic.formula : 'F_symbol_sequence(B) -> ' + (ok ? derived : ''), source: semanticOk ? 'semantic_focus_then_ordered_symbol_sequence' : ok ? 'body_ordered_symbol_sequence' : 'no_brain_route_derived_the_requested_expression', brain_packet_type: packet.packet_type, brain_root_id: root.id, brain_ok: packet.ok === true, body_kernel_error: packet.kernel_error, focus_path: focusPath || null, trace: focusPath ? focusPath.split('/') : [], semantic_focus: semantic || null, construction: semanticOk ? semantic.construction : fallback && fallback.construction || null, obligation: { focused_expression_must_preserve_brain_one: true, focused_expression_must_preserve_language_one: true, selected_expression_must_be_derived_by_focus_route: true, expression_must_not_bypass_brain: true, satisfied: ok }, empty_text: '' };
  }

  function mergeChildren(existing, incoming) {
    const byId = {};
    A(existing).forEach(row => { byId[cleanId(row.id)] = clone(row); });
    A(incoming).forEach(row => { const id = cleanId(row.id || row.dimension || row.name); const prev = O(byId[id]); byId[id] = Object.assign({}, prev, clone(row), { id, w: rawWeight(prev) + rawWeight(row) }); });
    return Object.keys(byId).sort().map(id => byId[id]);
  }

  function refineAt(node, path, children) {
    const target = A(path);
    if (!target.length || target[0] === node.id) {
      if (target.length <= 1) return normalizeNode(Object.assign({}, node, { children: mergeChildren(node.children, children), vague: false }));
      const rest = target.slice(1);
      return normalizeNode(Object.assign({}, node, { children: A(node.children).map(child => child.id === rest[0] ? refineAt(child, rest, children) : child) }));
    }
    return normalizeNode(node);
  }

  function refineByContact(input, contact) {
    const base = normalizeNode(input || { id: 'brain' });
    const path = A(contact && contact.path).length ? A(contact.path) : [base.id];
    const children = A(contact && contact.children).length ? A(contact.children) : A(contact && contact.dimensions);
    const refined = refineAt(base, path, children);
    return Object.assign(project(refined, { contact: O(contact) }), { refinement: { path, added_or_reweighted_children: children.map(row => cleanId(row.id || row.dimension || row.name)), source: 'contact_defined_vague_or_underweighted_unit' } });
  }

  function letter(id, symbol, position) { return { id, w: 1, vague: false, meta: { symbol_letter: symbol, position, local_one: true, role: 'ordered_language_symbol' } }; }
  function potatoConstruction() { return { id: 'symbolic_token_potato', w: 1, vague: false, meta: { role: 'controlled_focus_proof_token', local_one: true, expression_construction: 'ordered_symbol_sequence' }, children: [letter('letter_p_1', 'p', 1), letter('letter_o_2', 'o', 2), letter('letter_t_3', 't', 3), letter('letter_a_4', 'a', 4), letter('letter_t_5', 't', 5), letter('letter_o_6', 'o', 6)] }; }
  function foodCandidate(id, word, w, constructed) { return { id, w, vague: !constructed, meta: { local_one: true, candidate_expression: word, semantic_kind: 'food_noun_expression_unit', definition_mode: constructed ? 'defined_by_ordered_symbol_relation' : 'vague_until_relations_stabilize' }, children: constructed ? [constructed] : [] }; }
  function foodNounRoute() { return { id: 'word_class_noun', w: 1, vague: false, meta: { local_one: true, language_unit_type: 'noun_space' }, children: [{ id: 'semantic_domain_food', w: 1, vague: false, meta: { local_one: true, relation_domain: 'food' }, children: [{ id: 'candidate_set_food_noun', w: 1, vague: false, meta: { local_one: true, focus_selection_rule: 'highest_current_focus_weight' }, children: [foodCandidate('candidate_rice', 'rice', 1, null), foodCandidate('candidate_bread', 'bread', 1, null), foodCandidate('candidate_apple', 'apple', 1, null), foodCandidate('candidate_potato', 'potato', 4, potatoConstruction())] }] }] }; }

  function languageState(params) {
    const p = O(params);
    return { id: 'language', w: 1, vague: false, meta: { local_one_symbol: 'L', projection: 'π_language(B)', invariant: '|L| = 1', active_math_law: 'L = U_L ⊕ R_L ⊕ X_L ⊕ C_L ⊕ Ω_L ⊕ Φ_L ⊕ P_L ⊕ G_L' }, children: [
      { id: 'U_L_expression_units', w: 1, vague: false, meta: { symbol: 'U_L', role: 'language expression units' }, children: [foodNounRoute(), { id: 'sentence_units', w: EPS, meta: { status: 'vague_expression_unit_space' } }, { id: 'narrative_units', w: EPS, meta: { status: 'vague_expression_unit_space' } }, { id: 'unknown_input_units', w: EPS, meta: { status: 'unknown_until_relations_stabilize' } }] },
      { id: 'R_L_relations', w: 1, vague: false, meta: { symbol: 'R_L', role: 'language relations' }, children: [{ id: 'grammar_relations', w: p.languageCoherence + EPS }, { id: 'symbol_relations', w: p.symbols + EPS }, { id: 'semantic_relations', w: p.relations + EPS }, { id: 'context_relations', w: EPS }] },
      { id: 'X_L_transformations', w: 1, vague: false, meta: { symbol: 'X_L', role: 'language transformations' }, children: [{ id: 'ordered_symbol_sequence_transform', w: 1 }, { id: 'reference_resolution_transform', w: EPS }, { id: 'translation_transform', w: EPS }] },
      { id: 'C_L_constraints', w: 1, vague: false, meta: { symbol: 'C_L', role: 'language constraints' }, children: [{ id: 'local_one_constraint', w: 1 }, { id: 'coherence_constraint', w: p.languageCoherence + EPS }, { id: 'unknown_preservation_constraint', w: 1 }] },
      { id: 'Omega_L_unresolveds', w: Math.max(EPS, 1 - Math.max(p.symbols, p.relations)), vague: false, meta: { symbol: 'Ω_L', role: 'language unknowns' }, children: [{ id: 'vague_expression_capacity', w: 1 }, { id: 'unresolved_input_ledger', w: 1 }] },
      { id: 'Phi_L_focus', w: 1, vague: false, meta: { symbol: 'Φ_L', role: 'language focus field' }, children: [{ id: 'active_language_focus', w: 1 }, { id: 'ambiguity_focus', w: EPS }] },
      { id: 'P_L_proof', w: 1, vague: false, meta: { symbol: 'P_L', role: 'language proof obligations' }, children: [{ id: 'language_conservation_proof', w: 1 }, { id: 'unknown_preservation_proof', w: 1 }] },
      { id: 'G_L_growth', w: p.languageGrowth + EPS, vague: false, meta: { symbol: 'G_L', role: 'language definition growth' }, children: [{ id: 'definition_growth_pressure', w: 1 }, { id: 'relation_growth_pressure', w: p.languageGrowth + EPS }] }
    ] };
  }

  function truthProjection(params) {
    const p = O(params);
    return { id: 'truth_projection', w: 1, vague: false, meta: { local_one_symbol: 'T', projection: 'π_truth(B)', invariant: '|T| = 1' }, children: [{ id: 'contact', w: p.truthContact + EPS }, { id: 'damage_guard', w: Math.max(EPS, 1 - p.truthDamage) }, { id: 'belief_separation', w: 1 }, { id: 'unknown_truth_boundary', w: 1 }] };
  }

  function memoryProjection(params) {
    const p = O(params);
    return { id: 'memory_projection', w: 1, vague: false, meta: { local_one_symbol: 'M', projection: 'π_memory(B)', invariant: '|M| = 1' }, children: [{ id: 'mutation_memory', w: p.mutations + EPS }, { id: 'virtual_state_memory', w: p.virtualEdits + EPS }, { id: 'stable_relation_memory', w: p.relations + EPS }, { id: 'unknown_memory', w: 1 }] };
  }

  function actionProjection(params) {
    const p = O(params);
    return { id: 'action_projection', w: 1, vague: false, meta: { local_one_symbol: 'A', projection: 'π_action(B)', invariant: '|A| = 1' }, children: [{ id: 'mutation_pressure', w: p.actionMutation + EPS }, { id: 'source_promotion_boundary', w: 1 }, { id: 'expression_boundary', w: 1 }] };
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
    const params = { truthContact, truthDamage, languageGrowth, languageCoherence, sourceIdentity, actionMutation, symbols, relations, mutations, virtualEdits };
    const root = { id: 'one_logic_brain', meta: { active_math_law: 'B = U ⊕ R ⊕ X ⊕ C ⊕ Ω ⊕ Φ ⊕ P ⊕ G' }, children: [
      { id: 'U_units', w: 1, vague: false, meta: { symbol: 'U', role: 'all units and projections' }, children: [languageState(params), truthProjection(params), memoryProjection(params), actionProjection(params), { id: 'raw_input_units', w: EPS, meta: { status: 'input becomes unit before meaning' } }] },
      { id: 'R_relations', w: 1, vague: false, meta: { symbol: 'R', role: 'universal relation field' }, children: [{ id: 'observed_relations', w: relations + EPS }, { id: 'candidate_relations', w: 1 }, { id: 'contradiction_relations', w: EPS }] },
      { id: 'X_transformations', w: 1, vague: false, meta: { symbol: 'X', role: 'universal transformations' }, children: [{ id: 'sequence_transform', w: 1 }, { id: 'closure_transform', w: 1 }, { id: 'projection_transform', w: 1 }] },
      { id: 'C_constraints', w: 1, vague: false, meta: { symbol: 'C', role: 'universal constraints' }, children: [{ id: 'unit_conservation_constraint', w: 1 }, { id: 'proof_satisfaction_constraint', w: 1 }, { id: 'unknown_preservation_constraint', w: 1 }, { id: 'source_identity_constraint', w: sourceIdentity + EPS }] },
      { id: 'Omega_unresolveds', w: 1, vague: false, meta: { symbol: 'Ω', role: 'universal unknown field' }, children: [{ id: 'unresolved_input_ledger', w: 1 }, { id: 'vague_unit_capacity', w: 1 }, { id: 'unproven_relation_capacity', w: 1 }] },
      { id: 'Phi_focus', w: 1, vague: false, meta: { symbol: 'Φ', role: 'universal focus field' }, children: [{ id: 'active_focus_state', w: 1 }, { id: 'uncertainty_focus_pressure', w: EPS }, { id: 'definition_focus_pressure', w: languageGrowth + EPS }] },
      { id: 'P_proof', w: 1, vague: false, meta: { symbol: 'P', role: 'proof is internal active math' }, children: [proofObligationsNode()] },
      { id: 'G_growth', w: 1, vague: false, meta: { symbol: 'G', role: 'whole-state growth and optimization pressure' }, children: [{ id: 'relation_growth', w: languageGrowth + EPS }, { id: 'stability_growth', w: 1 }, { id: 'unknown_boundary_growth', w: 1 }] }
    ] };
    const projection = project(root, { source: 'universal_active_math_state', generation: internal.generation || 0, t: value.state && value.state.t || 0 });
    projection.contact = { truth_contact: R(truthContact), language_growth_pressure: R(languageGrowth), source_identity: R(sourceIdentity), mutation_pressure: R(actionMutation), symbol_memory: R(symbols), relation_memory: R(relations) };
    projection.focus_expression_demonstrations = [focusExpression(projection, { id: 'food_noun_focus_potato', token: 'potato' })];
    return projection;
  }

  return Object.freeze({ VERSION, normalizeWeights, normalizeNode, project, refineByContact, liveProjection, stats, l1, selfDefine, focusExpression, activeMathLaw, languageMathLaw, proofState });
});