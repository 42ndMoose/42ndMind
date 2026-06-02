(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FortySecondMindNestedRelationCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const VERSION = '0.1.0';
  const EPS = 1e-6;

  const A = value => Array.isArray(value) ? value : [];
  const R = value => Number((Number(value) || 0).toFixed(6));
  const C = value => JSON.parse(JSON.stringify(value == null ? null : value));

  function id(value, fallback) {
    return String(value == null ? fallback || 'x' : value).trim() || fallback || 'x';
  }

  function l1(field) {
    return R(A(field).reduce((sum, row) => sum + Math.abs(Number(row.w ?? row.weight) || 0), 0));
  }

  function normalize(rows, fallback) {
    const clean = A(rows).map(row => ({
      σ: id(row.σ ?? row.axis ?? row[0], fallback || '∅'),
      w: Number(row.w ?? row.weight ?? row[1]) || 0
    })).filter(row => row.σ && row.w !== 0);
    if (!clean.length) return [{ σ: fallback || '∅', w: 1 }];
    const total = clean.reduce((sum, row) => sum + Math.abs(row.w), 0) || 1;
    let used = 0;
    return clean.map((row, index) => {
      const sign = row.w < 0 ? -1 : 1;
      const magnitude = index === clean.length - 1 ? Math.max(0, 1 - used) : Math.abs(row.w) / total;
      const w = R(sign * magnitude);
      used = R(used + Math.abs(w));
      return { σ: row.σ, w };
    });
  }

  function node(value, kind) {
    return { id: id(value), kind: kind || 'symbol' };
  }

  function relation(rel) {
    const r = rel || {};
    return {
      id: id(r.id || 'ν' + String(Math.random()).slice(2, 8)),
      op: id(r.op || r.operator || 'rel'),
      from: id(r.from || r.a || '∅'),
      to: id(r.to || r.b || '∅'),
      scope: id(r.scope || 'local'),
      w: Number(r.w ?? r.weight ?? 1) || 1
    };
  }

  function create(seed) {
    const graph = {
      packet_type: '42ndMind_nested_relation_graph_v0_1',
      version: VERSION,
      nodes: {},
      relations: {},
      levels: {},
      relation_field: normalize([['ν∅', 1]], 'ν∅'),
      unit: { ν: 1, ok: true },
      errors: [],
      english: ''
    };
    A(seed && seed.nodes).forEach(n => addNode(graph, n.id || n, n.kind || 'symbol'));
    A(seed && seed.relations).forEach(r => addRelation(graph, r));
    refresh(graph);
    return graph;
  }

  function addNode(graph, value, kind) {
    const n = node(value, kind);
    graph.nodes[n.id] = n;
    return n;
  }

  function hasNodeOrRelation(graph, value) {
    const key = id(value);
    return !!(graph.nodes[key] || graph.relations[key]);
  }

  function addRelation(graph, rel) {
    const r = relation(rel);
    if (!hasNodeOrRelation(graph, r.from)) addNode(graph, r.from, 'symbol');
    if (!hasNodeOrRelation(graph, r.to)) addNode(graph, r.to, 'symbol');
    graph.relations[r.id] = r;
    refresh(graph);
    return r;
  }

  function relationDepth(graph, relationId, seen) {
    const rid = id(relationId);
    const r = graph.relations[rid];
    if (!r) return 0;
    const path = Object.assign({}, seen || {});
    if (path[rid]) return Infinity;
    path[rid] = true;
    const fromDepth = graph.relations[r.from] ? relationDepth(graph, r.from, path) : 0;
    const toDepth = graph.relations[r.to] ? relationDepth(graph, r.to, path) : 0;
    return 1 + Math.max(fromDepth, toDepth);
  }

  function detectCycles(graph) {
    const cyclic = [];
    Object.keys(graph.relations).forEach(rid => {
      if (!Number.isFinite(relationDepth(graph, rid, {}))) cyclic.push(rid);
    });
    return cyclic;
  }

  function refresh(graph) {
    const levels = {};
    Object.keys(graph.relations).forEach(rid => {
      const d = relationDepth(graph, rid, {});
      levels[rid] = d;
    });
    const cycles = detectCycles(graph);
    graph.levels = levels;
    graph.errors = cycles.map(rid => ({ kind: 'cycle', relation: rid }));
    graph.relation_field = normalize(Object.keys(graph.relations).map(rid => {
      const r = graph.relations[rid];
      const depth = Number.isFinite(levels[rid]) ? levels[rid] : 0;
      return { σ: rid, w: Math.max(0.0001, Math.abs(r.w) * Math.max(1, depth)) };
    }), 'ν∅');
    graph.unit = { ν: l1(graph.relation_field), ok: Math.abs(l1(graph.relation_field) - 1) < EPS && graph.errors.length === 0 };
    return graph;
  }

  function fromKernelPacket(packet) {
    const graph = create();
    const fields = packet && packet.fields ? packet.fields : packet || {};
    ['τ', 'ρ', 'μ', 'ε', 'λ', 'ι', 'κ', 'Ω'].forEach(key => {
      A(fields[key]).forEach(row => addNode(graph, row.σ || row.axis || row.dimension, key));
    });
    addRelation(graph, { id: 'ντλ', op: 'feeds', from: 'τ', to: 'λ', scope: 'kernel', w: 1 });
    addRelation(graph, { id: 'νρλ', op: 'feeds', from: 'ρ', to: 'λ', scope: 'kernel', w: 1 });
    addRelation(graph, { id: 'νμλ', op: 'feeds', from: 'μ', to: 'λ', scope: 'kernel', w: 1 });
    addRelation(graph, { id: 'νλι', op: 'feeds', from: 'λ', to: 'ι', scope: 'kernel', w: 1 });
    addRelation(graph, { id: 'νκΩ', op: 'constrains', from: 'κ', to: 'Ω', scope: 'kernel', w: 1 });
    addRelation(graph, { id: 'νnested1', op: 'supports', from: 'ντλ', to: 'νλι', scope: 'meta', w: 1 });
    addRelation(graph, { id: 'νnested2', op: 'bounds', from: 'νκΩ', to: 'νnested1', scope: 'meta', w: 1 });
    refresh(graph);
    return graph;
  }

  function serialize(graph) {
    refresh(graph);
    const nodePart = Object.keys(graph.nodes).sort().map(key => key + ':' + graph.nodes[key].kind).join(',');
    const relationPart = Object.keys(graph.relations).sort().map(key => {
      const r = graph.relations[key];
      return r.id + '(' + r.op + ',' + r.from + ',' + r.to + ',' + r.scope + ',' + R(r.w) + ')';
    }).join(';');
    return 'Ν{nodes[' + nodePart + '];relations[' + relationPart + ']}';
  }

  function parse(source) {
    const text = String(source == null ? '' : source).trim();
    const match = /^Ν\{nodes\[(.*)\];relations\[(.*)\]\}$/u.exec(text);
    if (!match) throw new Error('Invalid nested relation graph packet');
    const graph = create();
    const nodes = match[1].trim();
    if (nodes) {
      nodes.split(',').filter(Boolean).forEach(item => {
        const at = item.indexOf(':');
        if (at < 1) throw new Error('Invalid node row: ' + item);
        addNode(graph, item.slice(0, at), item.slice(at + 1));
      });
    }
    const rels = match[2].trim();
    if (rels) {
      rels.split(';').filter(Boolean).forEach(item => {
        const m = /^([^()]+)\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)\)$/u.exec(item);
        if (!m) throw new Error('Invalid relation row: ' + item);
        addRelation(graph, { id: m[1], op: m[2], from: m[3], to: m[4], scope: m[5], w: Number(m[6]) });
      });
    }
    refresh(graph);
    return graph;
  }

  function roundTrip(graphOrText) {
    const graph = typeof graphOrText === 'string' ? parse(graphOrText) : graphOrText;
    const text = serialize(graph);
    const again = parse(text);
    return {
      text,
      graph: C(graph),
      reparsed: C(again),
      same: serialize(again) === text,
      ok: again.unit.ok
    };
  }

  function nestedCount(graph) {
    return Object.values(graph.relations || {}).filter(r => graph.relations[r.from] || graph.relations[r.to]).length;
  }

  function validate(graphOrText) {
    try {
      const graph = typeof graphOrText === 'string' ? parse(graphOrText) : graphOrText;
      refresh(graph);
      return { ok: graph.unit.ok, graph, errors: C(graph.errors) };
    } catch (err) {
      return { ok: false, graph: null, errors: [String(err && err.message || err)] };
    }
  }

  return Object.freeze({
    VERSION,
    create,
    addNode,
    addRelation,
    refresh,
    fromKernelPacket,
    serialize,
    parse,
    roundTrip,
    validate,
    nestedCount,
    relationDepth,
    l1,
    normalize
  });
});
