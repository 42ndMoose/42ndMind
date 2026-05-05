/* Epistemic Kernel v0.2
   Transparent belief-state engine: scoped belief graph, meaning-packet import,
   low-signal guard, dependency propagation, and self-audit.
   No dependencies. Browser-friendly. */

(function (global) {
  const DEFAULT_GATE_WEIGHTS = {
    G1_counter_consideration: 0.8,
    G2_non_strawman: 1.0,
    G3_self_correction: 1.1,
    G4_contradiction_handling: 1.2,
    G5_reality_contact: 1.25,
    G6_non_self_sealing: 1.1,
  };

  const GATE_LABELS = {
    G1_counter_consideration: 'Counter-consideration',
    G2_non_strawman: 'Non-strawman',
    G3_self_correction: 'Self-correction',
    G4_contradiction_handling: 'Contradiction handling',
    G5_reality_contact: 'Reality contact',
    G6_non_self_sealing: 'Non-self-sealing',
  };

  const SCOPE_WEIGHTS = {
    observation: 0.05,
    thought: 0.2,
    claim: 0.35,
    contradiction: 0.55,
    stance: 0.65,
    principle_candidate: 0.55,
    worldview_fragment: 0.8,
    core_principle: 0.95,
    full_profile_summary: 1.0,
  };

  const GATE_TO_SIGNAL = {
    positive: {
      G1_counter_consideration: 'counter_consideration',
      G2_non_strawman: 'non_strawman_fairness',
      G3_self_correction: 'self_correction',
      G4_contradiction_handling: 'coherence',
      G5_reality_contact: 'reality_contact',
      G6_non_self_sealing: 'revision_openness',
    },
    negative: {
      G1_counter_consideration: 'dogmatic_closure',
      G2_non_strawman: 'strawman_dependence',
      G3_self_correction: 'false_certainty',
      G4_contradiction_handling: 'contradiction_evasion',
      G5_reality_contact: 'reality_detachment',
      G6_non_self_sealing: 'self_sealing',
    },
  };

  const LOCAL_Y_SIGNAL_WEIGHTS = {
    positive: {
      counter_consideration: 1.15,
      self_correction: 1.25,
      reality_contact: 1.25,
      coherence: 1.1,
      error_awareness: 1.15,
      revision_openness: 1.2,
      non_strawman_fairness: 1.0,
    },
    negative: {
      false_certainty: 0.5,
      self_sealing: 1.3,
      contradiction_evasion: 1.2,
      reality_detachment: 1.2,
      dogmatic_closure: 0.95,
      collapse_marker: 1.4,
      strawman_dependence: 0.4,
      broad_motive_attribution: 0.25,
    },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function clean(value) {
    return String(value ?? '').trim();
  }

  function lower(value) {
    return clean(value).toLowerCase();
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function unique(items) {
    return Array.from(new Set((items || []).map(clean).filter(Boolean)));
  }

  function strengthValue(strength) {
    const s = lower(strength);
    if (s === 'weak') return 0.25;
    if (s === 'strong') return 0.85;
    if (s === 'low') return 0.25;
    if (s === 'high') return 0.85;
    return 0.5;
  }

  function scopeWeight(scope) {
    const key = lower(scope).replace(/[^a-z0-9]+/g, '_');
    return SCOPE_WEIGHTS[key] ?? SCOPE_WEIGHTS.claim;
  }

  function containsAny(text, terms) {
    const t = lower(text);
    return terms.some((term) => t.includes(term));
  }

  function wordCount(text) {
    return clean(text).split(/\s+/).filter(Boolean).length;
  }

  function signalScore(text) {
    const t = lower(text);
    let score = 0;
    if (wordCount(t) >= 4) score += 0.25;
    if (/\b(i|you|he|she|they|we|alex|user|person|government|model|belief|claim)\b/i.test(t)) score += 0.15;
    if (/\b(is|are|was|were|did|does|submitted|took|found|deleted|believes|means|causes|supports|attacks)\b/i.test(t)) score += 0.2;
    if (realityContactLanguage(t)) score += 0.15;
    if (absoluteOrClosureLanguage(t) || selfSealingLanguage(t) || positiveAdmissionLanguage(t) || negativeClaimLanguage(t)) score += 0.2;
    if (/^[^a-z0-9]+$/i.test(t)) score -= 0.3;
    if (/(.)\1{8,}/.test(t)) score -= 0.3;
    return clamp(score, 0, 1);
  }

  function createGateStateMap() {
    return Object.fromEntries(Object.keys(DEFAULT_GATE_WEIGHTS).map((gate) => [
      gate,
      { score: 0, status: 'dormant', positive_events: 0, negative_events: 0, last_evidence_span: null },
    ]));
  }

  function gateStatusFromScore(score) {
    const value = Number(score) || 0;
    if (Math.abs(value) < 0.15) return 'dormant';
    if (value >= 0.75) return 'strong_positive';
    if (value >= 0.4) return 'established_positive';
    if (value >= 0.15) return 'lean_positive';
    if (value <= -0.75) return 'strong_negative';
    if (value <= -0.4) return 'established_negative';
    return 'lean_negative';
  }

  function projectSemanticTriple(a, s, b) {
    const xSemantic = clamp(a, -3, 3);
    const ySemantic = clamp(s, -3, 3);
    const zSemantic = clamp(b, -3, 3);
    const magnitude = Math.abs(xSemantic) + Math.abs(ySemantic) + Math.abs(zSemantic);
    if (magnitude <= 1e-9) {
      return {
        point: { x: 0, y: 0, z: 0 },
        debug: { state: 'null_origin', semantic: { a: xSemantic, s: ySemantic, b: zSemantic }, magnitude, surface_equation: '|x| + |y| + |z| = 0 because no active worldview is yet plotted' },
      };
    }
    const point = { x: xSemantic / magnitude, y: ySemantic / magnitude, z: zSemantic / magnitude };
    return {
      point,
      debug: { state: point.y >= 0 ? 'active_positive_or_mixed' : 'active_negative_or_collapse_pressure', semantic: { a: xSemantic, s: ySemantic, b: zSemantic }, magnitude, manhattan: Math.abs(point.x) + Math.abs(point.y) + Math.abs(point.z), surface_equation: '|x| + |y| + |z| = 1 for active worldview positions' },
    };
  }

  function absoluteOrClosureLanguage(text) {
    return /\b(always|never|impossible|no possible way|cannot be wrong|can't be wrong|nothing would change|nothing can change|everyone who disagrees|anyone who disagrees|only proves|proves how|brainwashed|no evidence could|no amount of evidence|settled forever|beyond question)\b/i.test(text);
  }

  function negativeClaimLanguage(text) {
    return /\b(never|did not|didn't|no longer|not|cannot|can't|wasn't|isn't|no way|none|nothing)\b/i.test(text);
  }

  function positiveAdmissionLanguage(text) {
    return /\b(actually|i did|i took|i borrowed|i submitted|i returned|i found|i deleted|i left|i heard only|only heard|i was wrong|i misunderstood|admit|admitted)\b/i.test(text);
  }

  function selfSealingLanguage(text) {
    return /\b(anyone who disagrees|everyone who disagrees|evidence against|counterevidence|only proves|proves how|brainwashed|part of the conspiracy|fake because|no evidence could|unfalsifiable|all criticism is|criticism means attack)\b/i.test(text);
  }

  function realityContactLanguage(text) {
    return /\b(timestamp|receipt|record|video|deadline|evidence|log|bank transfer|found in|measured|verified|document|official|photo|data|source|audit|test|benchmark|observed)\b/i.test(text);
  }

  function motiveLanguage(text) {
    return /\b(lied|deceived|malicious|hostile|attack|evil|corrupt|intended|motive|because he wanted|because she wanted|on purpose)\b/i.test(text);
  }

  function extractObjectGuess(text) {
    const t = lower(text).replace(/[.,!?;:]/g, ' ');
    const candidates = ['keys', 'key', 'charger', 'phone', 'book', 'money', 'form', 'car', 'messages', 'message', 'deadline', 'criticism', 'belief', 'claim', 'evidence', 'timestamp'];
    return candidates.find((c) => t.split(/\s+/).includes(c)) || '';
  }

  function contradictionReason(a, b) {
    const ta = lower(a.text);
    const tb = lower(b.text);
    const sameObject = a.object && b.object && a.object === b.object;
    if (sameObject && negativeClaimLanguage(ta) && positiveAdmissionLanguage(tb)) return 'Earlier negative or absolute claim conflicts with later admission involving the same object.';
    if (sameObject && negativeClaimLanguage(tb) && positiveAdmissionLanguage(ta)) return 'Later negative or absolute claim conflicts with earlier admission involving the same object.';
    if (ta.includes('before the deadline') && (tb.includes('after the deadline') || tb.includes('deadline was yesterday') || tb.includes('this morning'))) return 'Timeline contradiction: before-deadline claim conflicts with later timing evidence.';
    if (tb.includes('before the deadline') && (ta.includes('after the deadline') || ta.includes('deadline was yesterday') || ta.includes('this morning'))) return 'Timeline contradiction: before-deadline claim conflicts with earlier timing evidence.';
    if ((ta.includes('stole') || ta.includes('stolen')) && tb.includes('found') && tb.includes('backpack')) return 'Mistaken-accusation pressure: theft claim conflicts with later discovery in own possession.';
    if ((tb.includes('stole') || tb.includes('stolen')) && ta.includes('found') && ta.includes('backpack')) return 'Mistaken-accusation pressure: theft claim conflicts with earlier discovery in own possession.';
    if (ta.includes('nothing wrong') && tb.includes('deleted')) return 'Self-serving concealment pressure: broad innocence claim conflicts with deletion of damaging messages.';
    if (tb.includes('nothing wrong') && ta.includes('deleted')) return 'Self-serving concealment pressure: broad innocence claim conflicts with deletion of damaging messages.';
    if (selfSealingLanguage(ta) || selfSealingLanguage(tb)) return 'Self-sealing pressure detected: counterevidence or disagreement is being reinterpreted as confirmation.';
    return '';
  }

  class EpistemicKernel {
    constructor(seed = null) {
      this.state = this.migrateState(seed || this.createEmptyState());
      this.recalculate();
    }

    createEmptyState() {
      return {
        version: 'epistemic_kernel_v0_2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        observations: [], claims: [], evidence: [], contradictions: [], questions: [], principles: [], dependencies: [], mappings: [], audits: [], proposals: [],
        gateStates: createGateStateMap(), semantic: { a: 0, s: 0, b: 0 }, octahedron: { point: { x: 0, y: 0, z: 0 }, debug: {} },
        beliefGraph: { version: 'belief_graph_v0_2', root_id: 'root_worldview', nodes: [], links: [], notes: [] }, eventLog: [],
      };
    }

    migrateState(input) {
      const state = input && typeof input === 'object' ? JSON.parse(JSON.stringify(input)) : this.createEmptyState();
      const empty = this.createEmptyState();
      for (const key of Object.keys(empty)) {
        if (state[key] === undefined) state[key] = empty[key];
      }
      state.version = 'epistemic_kernel_v0_2';
      state.gateStates = { ...createGateStateMap(), ...(state.gateStates || {}) };
      return state;
    }

    reset() { this.state = this.createEmptyState(); this.recalculate(); return this.snapshot(); }
    snapshot() { return JSON.parse(JSON.stringify(this.state)); }
    log(type, detail) { this.state.eventLog.push({ id: uid('event'), at: new Date().toISOString(), type, detail }); this.state.updated_at = new Date().toISOString(); }

    applyGateEvent(gate, direction, { strength = 'moderate', confidence = 0.75, evidence = '', reason = '', scope = 'claim' } = {}) {
      const data = this.state.gateStates[gate];
      if (!data) return;
      const sign = direction === 'negative' ? -1 : 1;
      const gateWeight = DEFAULT_GATE_WEIGHTS[gate] || 1;
      const signalType = GATE_TO_SIGNAL[direction]?.[gate];
      const signalWeight = LOCAL_Y_SIGNAL_WEIGHTS[direction]?.[signalType] ?? 1;
      const delta = sign * strengthValue(strength) * clamp(confidence, 0, 1) * gateWeight * signalWeight * scopeWeight(scope);
      const old = Number(data.score) || 0;
      const multiplier = Math.sign(old) === Math.sign(delta) ? (1 - Math.min(0.88, Math.abs(old))) : 1.12;
      data.score = clamp(old + delta * multiplier, -1, 1);
      data.status = gateStatusFromScore(data.score);
      data.last_evidence_span = evidence || reason || data.last_evidence_span || null;
      if (direction === 'negative') data.negative_events += 1; else data.positive_events += 1;
    }

    addObservation({ text, status = 'low_signal', reason = 'insufficient claim structure', source = 'manual' }) {
      const obs = { id: uid('observation'), text: clean(text), status, reason, source, created_at: new Date().toISOString() };
      this.state.observations.push(obs);
      this.addQuestion(`Clarify low-signal input before treating it as belief: ${obs.text.slice(0, 100)}`, { observation_id: obs.id });
      this.log('observation_added', { observation_id: obs.id, status, reason });
      this.recalculate();
      return obs;
    }

    addClaim({ text, subject = 'unspecified', object = '', scope = 'claim', confidence = 0.5, source = 'manual', status = 'active', client_id = null }) {
      const claimText = clean(text);
      if (!claimText) throw new Error('Claim text is required.');
      if (signalScore(claimText) < 0.18 && source !== 'structured_packet') return this.addObservation({ text: claimText, source, reason: 'low signal; not promoted to claim' });
      const claim = { id: uid('claim'), client_id: clean(client_id) || null, text: claimText, subject: clean(subject) || 'unspecified', object: clean(object) || extractObjectGuess(claimText), scope: clean(scope) || 'claim', confidence: clamp(confidence, 0, 1), status: clean(status) || 'active', source: clean(source) || 'manual', evidence_for: [], evidence_against: [], contradictions: [], dependencies: [], live_hypotheses: [], created_at: new Date().toISOString() };
      this.state.claims.push(claim);
      this.log('claim_added', { claim_id: claim.id, text: claim.text });

      if (absoluteOrClosureLanguage(claim.text)) this.applyGateEvent('G3_self_correction', 'negative', { strength: 'moderate', confidence: 0.72, evidence: claim.text, reason: 'absolute or closure language increases false-certainty risk', scope: claim.scope });
      if (selfSealingLanguage(claim.text)) this.applyGateEvent('G6_non_self_sealing', 'negative', { strength: 'strong', confidence: 0.9, evidence: claim.text, reason: 'self-sealing language detected', scope: claim.scope });
      if (realityContactLanguage(claim.text)) this.applyGateEvent('G5_reality_contact', 'positive', { strength: 'weak', confidence: 0.62, evidence: claim.text, reason: 'claim refers to checkable evidence or concrete reality-contact signal', scope: claim.scope });
      if (motiveLanguage(claim.text) && !realityContactLanguage(claim.text)) {
        this.applyGateEvent('G1_counter_consideration', 'negative', { strength: 'weak', confidence: 0.55, evidence: claim.text, reason: 'motive language without separate motive evidence', scope: claim.scope });
        this.addQuestion('What evidence separates motive from mere benefit, pressure, or disagreement?', { claim_id: claim.id });
      }

      this.detectContradictionsForClaim(claim);
      this.recalculate();
      return claim;
    }

    findClaim(ref) {
      const value = clean(ref);
      if (!value) return null;
      return this.state.claims.find((c) => c.id === value || c.client_id === value || lower(c.text) === lower(value)) || null;
    }

    addEvidence({ text, relation = 'supports', claimId = '', target = '', target_client_id = '', target_claim_text = '', strength = 'moderate', confidence = 0.75, source = 'manual' }) {
      const evidenceText = clean(text);
      if (!evidenceText) throw new Error('Evidence text is required.');
      const claim = this.findClaim(claimId || target || target_client_id || target_claim_text);
      const ev = { id: uid('evidence'), text: evidenceText, relation: relation === 'attacks' ? 'attacks' : 'supports', claimId: claim?.id || clean(claimId), strength, confidence: clamp(confidence, 0, 1), source: clean(source) || 'manual', created_at: new Date().toISOString() };
      this.state.evidence.push(ev);
      if (claim) {
        if (ev.relation === 'supports') { claim.evidence_for.push(ev.id); claim.confidence = clamp(claim.confidence + 0.18 * strengthValue(strength) * ev.confidence, 0, 1); }
        else { claim.evidence_against.push(ev.id); claim.confidence = clamp(claim.confidence - 0.62 * strengthValue(strength) * ev.confidence, 0, 1); if (claim.confidence < 0.32) claim.status = 'weakened'; }
      }
      this.applyGateEvent('G5_reality_contact', 'positive', { strength: strength || 'moderate', confidence: ev.confidence, evidence: ev.text, reason: 'evidence was attached to belief state', scope: 'claim' });
      if (ev.relation === 'attacks') {
        this.applyGateEvent('G4_contradiction_handling', 'positive', { strength: 'moderate', confidence: 0.78, evidence: ev.text, reason: 'attacking evidence was allowed to weaken a claim', scope: 'claim' });
        this.addQuestion('What would fairly distinguish false, overbroad, partially true, and deceptive?', { claim_id: claim?.id || ev.claimId });
      }
      this.log('evidence_added', { evidence_id: ev.id, relation: ev.relation, claim_id: ev.claimId });
      this.propagateDependencies();
      this.detectAllContradictions();
      this.recalculate();
      return ev;
    }

    addDependency({ dependent, depends_on, relation = 'depends_on', strength = 'moderate', note = '' }) {
      const dependentClaim = this.findClaim(dependent);
      const supportClaim = this.findClaim(depends_on);
      if (!dependentClaim || !supportClaim) throw new Error('Dependency requires valid dependent and depends_on claim refs.');
      const dep = { id: uid('dependency'), dependent: dependentClaim.id, depends_on: supportClaim.id, relation, strength, note: clean(note), status: 'active', created_at: new Date().toISOString() };
      this.state.dependencies.push(dep);
      dependentClaim.dependencies.push(dep.id);
      this.log('dependency_added', { dependency_id: dep.id, dependent: dependentClaim.id, depends_on: supportClaim.id });
      this.propagateDependencies();
      this.recalculate();
      return dep;
    }

    propagateDependencies() {
      for (const dep of this.state.dependencies.filter((d) => d.status === 'active')) {
        const dependent = this.findClaim(dep.dependent);
        const support = this.findClaim(dep.depends_on);
        if (!dependent || !support) continue;
        if (support.confidence < 0.35) {
          const penalty = 0.18 * strengthValue(dep.strength);
          dependent.confidence = clamp(dependent.confidence - penalty, 0, 1);
          if (dependent.confidence < 0.32) dependent.status = 'weakened';
          this.addQuestion(`Dependent claim may be unstable because support weakened: ${dependent.text.slice(0, 80)}`, { dependency_id: dep.id });
        }
      }
    }

    addQuestion(text, links = {}) {
      const qText = clean(text);
      if (!qText) return null;
      const existing = this.state.questions.find((q) => lower(q.text) === lower(qText) && q.status === 'open');
      if (existing) return existing;
      const question = { id: uid('question'), text: qText, status: 'open', links, created_at: new Date().toISOString() };
      this.state.questions.push(question);
      return question;
    }

    addPrinciple({ text, source = 'manual', scope = 'principle_candidate', confidence = 0.45, status = 'candidate', testing_requirements = [] }) {
      const value = clean(text);
      if (!value) return null;
      const existing = this.state.principles.find((item) => lower(item.text) === lower(value));
      if (existing) return existing;
      const principle = { id: uid('principle'), text: value, source, scope, confidence: clamp(confidence, 0, 1), status, testing_requirements: unique(testing_requirements), evidence_for: [], evidence_against: [], created_at: new Date().toISOString() };
      this.state.principles.push(principle);
      if (!principle.testing_requirements.length) this.addQuestion(`What would test or falsify this principle? ${principle.text.slice(0, 100)}`, { principle_id: principle.id });
      this.log('principle_added', { principle_id: principle.id, status: principle.status });
      this.recalculate();
      return principle;
    }

    detectContradictionsForClaim(claim) {
      for (const other of this.state.claims) {
        if (other.id === claim.id) continue;
        const reason = contradictionReason(other, claim);
        if (!reason) continue;
        const pairKey = [other.id, claim.id].sort().join('|');
        const exists = this.state.contradictions.find((c) => [c.claim_a, c.claim_b].sort().join('|') === pairKey);
        if (exists) continue;
        const contradiction = { id: uid('contradiction'), claim_a: other.id, claim_b: claim.id, reason, status: 'active', severity: this.estimateContradictionSeverity(other, claim, reason), created_at: new Date().toISOString() };
        this.state.contradictions.push(contradiction);
        other.contradictions.push(contradiction.id);
        claim.contradictions.push(contradiction.id);
        this.applyContradictionPressure(contradiction, other, claim);
      }
    }

    detectAllContradictions() { for (const claim of this.state.claims) this.detectContradictionsForClaim(claim); }

    estimateContradictionSeverity(a, b, reason) {
      let severity = 0.65;
      if (reason.includes('Timeline')) severity = 0.8;
      if (reason.includes('Self-sealing')) severity = 0.9;
      if (reason.includes('Self-serving')) severity = 0.82;
      if (a.confidence > 0.7 || b.confidence > 0.7) severity += 0.05;
      return clamp(severity, 0, 1);
    }

    applyContradictionPressure(contradiction, a, b) {
      const evidence = `${a.text} ↔ ${b.text}`;
      this.applyGateEvent('G4_contradiction_handling', 'positive', { strength: 'moderate', confidence: contradiction.severity, evidence, reason: 'contradiction detected and preserved rather than ignored', scope: 'contradiction' });
      this.applyGateEvent('G1_counter_consideration', 'positive', { strength: 'moderate', confidence: 0.72, evidence, reason: 'contradiction created counter-consideration pressure', scope: 'contradiction' });
      const hypotheses = this.hypothesesForContradiction(contradiction);
      a.live_hypotheses = unique([...a.live_hypotheses, ...hypotheses]);
      b.live_hypotheses = unique([...b.live_hypotheses, ...hypotheses]);
      this.addQuestion('What evidence would distinguish mistake, scope shift, partial truth, and deliberate deception?', { contradiction_id: contradiction.id });
      this.addQuestion('What exactly changed between the earlier claim and the later claim?', { contradiction_id: contradiction.id });
      if (contradiction.reason.includes('Self-sealing')) {
        this.applyGateEvent('G6_non_self_sealing', 'negative', { strength: 'strong', confidence: 0.9, evidence, reason: 'belief appears to reinterpret disagreement or counterevidence as confirmation', scope: 'stance' });
        this.addQuestion('What evidence would count against this belief?', { contradiction_id: contradiction.id });
      }
      if (contradiction.reason.includes('Mistaken-accusation')) this.addPrinciple({ text: 'An accusation should weaken sharply when the allegedly stolen object is found in the accuser’s own possession.', source: 'kernel', confidence: 0.65, testing_requirements: ['Check whether the accuser knew the item was not stolen before accusing.'] });
      if (contradiction.reason.includes('Timeline')) this.addPrinciple({ text: 'A timeline claim should be checked against timestamps and deadlines before motive is concluded.', source: 'kernel', confidence: 0.65, testing_requirements: ['Verify timestamp, deadline, and claimant knowledge separately.'] });
      if (contradiction.reason.includes('Self-serving')) this.addPrinciple({ text: 'Concealment behavior damages credibility but does not automatically prove the underlying accusation.', source: 'kernel', confidence: 0.62, testing_requirements: ['Separate concealment evidence from underlying wrongdoing evidence.'] });
      this.log('contradiction_detected', { contradiction_id: contradiction.id, reason: contradiction.reason });
    }

    hypothesesForContradiction(contradiction) {
      const reason = contradiction.reason;
      if (reason.includes('Timeline')) return ['timeline misunderstanding', 'memory error', 'misstated timeline', 'avoidance of consequence', 'system timestamp error'];
      if (reason.includes('Mistaken-accusation')) return ['misplaced item', 'jumped to conclusion', 'frustration toward accused person', 'malice only if prior knowledge is shown'];
      if (reason.includes('Self-serving')) return ['embarrassment', 'privacy concern', 'reputation management', 'deliberate concealment', 'underlying wrongdoing unresolved'];
      if (reason.includes('Self-sealing')) return ['identity protection', 'group loyalty', 'fear of counterevidence', 'unfalsifiable belief defense'];
      return ['memory error', 'scope shift', 'wording problem', 'partial truth', 'deliberate deception'];
    }

    resolveQuestion(questionId, note = '') {
      const q = this.state.questions.find((item) => item.id === questionId);
      if (!q) return null;
      q.status = 'resolved'; q.resolution = clean(note); q.resolved_at = new Date().toISOString();
      this.applyGateEvent('G3_self_correction', 'positive', { strength: 'moderate', confidence: 0.75, evidence: q.text, reason: 'open inquiry was resolved or updated', scope: 'claim' });
      this.log('question_resolved', { question_id: q.id, note }); this.recalculate(); return q;
    }

    challengeClaim(claimId, challengeText = '') {
      const claim = this.findClaim(claimId); if (!claim) return null;
      this.addQuestion(`Challenge this claim: ${challengeText || claim.text}`, { claim_id: claim.id });
      this.applyGateEvent('G1_counter_consideration', 'positive', { strength: 'moderate', confidence: 0.8, evidence: challengeText || claim.text, reason: 'claim was explicitly challenged instead of passively accepted', scope: claim.scope });
      this.recalculate(); return claim;
    }

    quickIngest(text, options = {}) {
      const raw = clean(text); if (!raw) return [];
      const mode = lower(options.mode || 'auto');
      if (mode === 'observation' || signalScore(raw) < 0.18) return [this.addObservation({ text: raw, source: 'quick_ingest', reason: mode === 'observation' ? 'manual observation mode' : 'low signal quick ingest' })];
      if (mode === 'principle' || mode === 'philosophical_text') {
        return [this.addPrinciple({ text: raw, source: 'quick_ingest', scope: 'principle_candidate', confidence: 0.45, status: 'candidate' })];
      }
      if (mode === 'challenge') { this.addQuestion(`Challenge or counter-consideration: ${raw}`, {}); this.applyGateEvent('G1_counter_consideration', 'positive', { strength: 'moderate', confidence: 0.72, evidence: raw, scope: 'thought' }); this.recalculate(); return []; }
      if (mode === 'correction') { this.applyGateEvent('G3_self_correction', 'positive', { strength: 'moderate', confidence: 0.72, evidence: raw, scope: 'thought' }); this.addQuestion(`Correction entered; identify which claim it repairs: ${raw.slice(0, 120)}`, {}); this.recalculate(); return []; }
      const sentences = raw.split(/(?<=[.!?])\s+/).map(clean).filter(Boolean);
      const created = [];
      for (const sentence of sentences.length ? sentences : [raw]) {
        created.push(this.addClaim({ text: sentence, subject: sentence.toLowerCase().includes('alex') ? 'Alex/user' : 'user', object: extractObjectGuess(sentence), confidence: positiveAdmissionLanguage(sentence) ? 0.7 : 0.55, source: 'quick_ingest' }));
      }
      this.detectAllContradictions(); this.recalculate(); return created;
    }

    importExtractionPacket(packet) {
      if (typeof packet === 'string') packet = JSON.parse(packet);
      if (!packet || typeof packet !== 'object') throw new Error('Structured extraction packet must be an object.');
      const idMap = new Map();
      const results = { claims: [], evidence: [], principles: [], dependencies: [], questions: [], observations: [] };
      for (const obs of packet.observations || []) results.observations.push(this.addObservation({ ...obs, source: obs.source || 'structured_packet' }));
      for (const item of packet.claims || []) {
        const claim = this.addClaim({ ...item, source: 'structured_packet', client_id: item.client_id || item.id });
        results.claims.push(claim); if (item.client_id || item.id) idMap.set(item.client_id || item.id, claim.id);
      }
      const remap = (ref) => idMap.get(ref) || ref;
      for (const item of packet.evidence || []) results.evidence.push(this.addEvidence({ ...item, claimId: remap(item.claimId || item.target || item.target_client_id || item.target_claim_text), source: 'structured_packet' }));
      for (const item of packet.principles || []) results.principles.push(this.addPrinciple({ ...item, source: 'structured_packet' }));
      for (const item of packet.dependencies || []) results.dependencies.push(this.addDependency({ ...item, dependent: remap(item.dependent || item.dependent_client_id), depends_on: remap(item.depends_on || item.depends_on_client_id) }));
      for (const text of packet.questions || []) results.questions.push(this.addQuestion(typeof text === 'string' ? text : text.text, typeof text === 'object' ? (text.links || {}) : {}));
      for (const item of packet.gate_events || []) this.applyGateEvent(item.gate, item.direction, item);
      this.log('structured_packet_imported', { counts: Object.fromEntries(Object.entries(results).map(([k,v]) => [k, v.length])) });
      this.recalculate();
      return results;
    }

    getExtractionPrompt(text = '') {
      return `Convert the text below into an epistemic extraction packet for Epistemic Kernel v0.2. Return JSON only. Do not decide truth by rhetoric. Separate claims, evidence, principles, assumptions, dependencies, contradictions if explicit, uncertainty, and motive hypotheses. Use this schema:\n{\n  "packet_type": "epistemic_extraction_packet",\n  "claims": [{"client_id":"c1","text":"...","subject":"...","object":"...","scope":"claim|stance|worldview_fragment","confidence":0.5,"status":"active"}],\n  "evidence": [{"text":"...","relation":"supports|attacks","target_client_id":"c1","strength":"weak|moderate|strong","confidence":0.75}],\n  "principles": [{"text":"...","scope":"principle_candidate","confidence":0.45,"status":"candidate","testing_requirements":["..."]}],\n  "dependencies": [{"dependent_client_id":"c2","depends_on_client_id":"c1","relation":"depends_on","strength":"moderate","note":"..."}],\n  "questions": ["..."],\n  "observations": []\n}\n\nText:\n${text}`;
    }

    selfAudit() {
      const findings = [];
      const activeContradictions = this.state.contradictions.filter((c) => c.status === 'active');
      const rootY = Number(this.state.octahedron?.point?.y || 0);
      if (activeContradictions.length && rootY > 0.55) findings.push({ severity: 'medium', type: 'possible_over_reward', text: 'Root y is high while active contradictions remain unresolved. Detection should not count as full resolution.' });
      for (const claim of this.state.claims) {
        if (claim.confidence > 0.72 && !claim.evidence_for.length) findings.push({ severity: 'medium', type: 'unsupported_confidence', text: `Claim has high confidence without supporting evidence: ${claim.text}` });
        if (motiveLanguage(claim.text) && !claim.evidence_for.length) findings.push({ severity: 'medium', type: 'motive_overclaim_risk', text: `Motive language needs separate evidence: ${claim.text}` });
      }
      for (const c of activeContradictions) {
        const linkedOpen = this.state.questions.some((q) => q.status === 'open' && JSON.stringify(q.links || {}).includes(c.id));
        if (!linkedOpen) findings.push({ severity: 'high', type: 'unqueried_contradiction', text: `Active contradiction lacks open inquiry question: ${c.reason}` });
      }
      for (const p of this.state.principles) {
        if ((p.status === 'candidate' || p.scope === 'principle_candidate') && !(p.testing_requirements || []).length) findings.push({ severity: 'medium', type: 'untested_principle', text: `Candidate principle lacks testing requirements: ${p.text}` });
      }
      for (const dep of this.state.dependencies) {
        const support = this.findClaim(dep.depends_on); const dependent = this.findClaim(dep.dependent);
        if (support && dependent && support.confidence < 0.35 && dependent.confidence > 0.55) findings.push({ severity: 'high', type: 'dependency_not_propagated', text: `Dependent claim remains strong while support is weak: ${dependent.text}` });
      }
      if (!findings.length) findings.push({ severity: 'low', type: 'no_major_audit_flags', text: 'No major self-audit flags detected under current simple checks.' });
      const audit = { id: uid('audit'), created_at: new Date().toISOString(), findings, root_point: this.state.octahedron.point, counts: { claims: this.state.claims.length, evidence: this.state.evidence.length, contradictions: activeContradictions.length, questions: this.state.questions.filter((q) => q.status === 'open').length } };
      this.state.audits.push(audit);
      this.log('self_audit_created', { audit_id: audit.id, findings: findings.length });
      this.recalculate(false);
      return audit;
    }

    proposeRuleChange({ title = '', rationale = '', patch = '', expected_effect = '', falsification = '' } = {}) {
      const proposal = { id: uid('proposal'), title: clean(title) || 'Untitled rule proposal', rationale: clean(rationale), patch: clean(patch), expected_effect: clean(expected_effect), falsification: clean(falsification), status: 'candidate_requires_sandbox', created_at: new Date().toISOString() };
      this.state.proposals.push(proposal);
      this.addQuestion(`Sandbox rule proposal before promotion: ${proposal.title}`, { proposal_id: proposal.id });
      this.log('rule_proposal_created', { proposal_id: proposal.id, title: proposal.title });
      this.recalculate();
      return proposal;
    }

    answerAboutClaim(claimId) {
      const claim = this.findClaim(claimId);
      if (!claim) return { answer: 'unresolved', confidence: 0, reason: 'claim not found' };
      const attacks = claim.evidence_against.length; const supports = claim.evidence_for.length; const contradictions = claim.contradictions.length;
      let answer = 'unresolved';
      if (claim.confidence >= 0.72 && supports >= attacks && !contradictions) answer = 'yes';
      if (claim.confidence <= 0.28 || attacks > supports + 1) answer = 'no';
      return { answer, confidence: Number(claim.confidence.toFixed(3)), reason: this.reasonForClaim(claim), live_hypotheses: claim.live_hypotheses, next_questions: this.state.questions.filter((q) => q.status === 'open' && JSON.stringify(q.links || {}).includes(claim.id)).map((q) => q.text) };
    }

    reasonForClaim(claim) {
      if (claim.evidence_against.length) return 'claim has attacking evidence and should not be naively accepted';
      if (claim.contradictions.length) return 'claim is involved in unresolved contradiction pressure';
      if (claim.evidence_for.length) return 'claim has supporting evidence, but confidence remains proportional to evidence strength';
      return 'claim has no attached evidence yet';
    }

    semanticForText(text, { confidence = 0.5, contradictionPressure = 0, supportCount = 0, attackCount = 0, scope = 'claim' } = {}) {
      const t = lower(text); const sw = scopeWeight(scope);
      const empathy = containsAny(t, ['harm', 'person', 'people', 'care', 'fair', 'accuse', 'blame']) ? 0.08 : 0;
      const practicality = containsAny(t, ['deadline', 'timestamp', 'receipt', 'constraint', 'evidence', 'record', 'form']) ? 0.08 : 0;
      const wisdom = containsAny(t, ['motive', 'hypothesis', 'uncertain', 'unresolved', 'calibrated', 'principle', 'scope']) ? 0.08 : 0;
      const knowledge = containsAny(t, ['fact', 'record', 'timestamp', 'evidence', 'data', 'receipt']) ? 0.08 : 0;
      const closurePenalty = absoluteOrClosureLanguage(t) ? 0.2 : 0;
      const selfSealPenalty = selfSealingLanguage(t) ? 0.35 : 0;
      const motivePenalty = motiveLanguage(t) && !realityContactLanguage(t) ? 0.08 : 0;
      const realityBonus = realityContactLanguage(t) ? 0.1 : 0;
      const evidenceBalance = (supportCount * 0.09) - (attackCount * 0.2);
      const confidenceOffset = (Number(confidence || 0.5) - 0.5) * 0.16;
      const s = (confidenceOffset + realityBonus + evidenceBalance - contradictionPressure * 0.18 - closurePenalty - selfSealPenalty - motivePenalty) * sw;
      let a = (empathy - practicality) * sw; let b = (wisdom - knowledge) * sw;
      if (Math.abs(a) < 0.01 && Math.abs(b) < 0.01 && Math.abs(s) > 0.01) b = s > 0 ? 0.03 : -0.03;
      return { a: Number(a.toFixed(4)), s: Number(clamp(s, -1, 1).toFixed(4)), b: Number(b.toFixed(4)) };
    }

    blendSemantics(items = []) {
      const active = items.filter(Boolean); const totalWeight = active.reduce((sum, item) => sum + Math.max(0, Number(item.weight || 1)), 0);
      if (!active.length || totalWeight <= 0) return { a: 0, s: 0, b: 0 };
      const out = active.reduce((sum, item) => { const w = Math.max(0, Number(item.weight || 1)); const sem = item.semantic || item; sum.a += Number(sem.a || 0) * w; sum.s += Number(sem.s || 0) * w; sum.b += Number(sem.b || 0) * w; return sum; }, { a: 0, s: 0, b: 0 });
      return { a: Number((out.a / totalWeight).toFixed(4)), s: Number((out.s / totalWeight).toFixed(4)), b: Number((out.b / totalWeight).toFixed(4)) };
    }

    graphNode({ id, type, scope, label, semantic, weight = 1, parent_id = null, source_ids = [], status = 'active', notes = [] }) {
      return { id, type, scope, label, weight, parent_id, source_ids, status, semantic, octahedron: projectSemanticTriple(semantic.a, semantic.s, semantic.b), notes };
    }

    buildBeliefGraph() {
      const nodes = []; const links = []; const notes = ['Scoped octahedron states feed parent clusters; root is aggregate summary, not a permanent soul state.'];
      for (const obs of this.state.observations) nodes.push(this.graphNode({ id: `observation_node:${obs.id}`, type: 'observation', scope: 'observation', label: obs.text, semantic: { a: 0, s: 0, b: 0 }, weight: 0.05, parent_id: 'root_worldview', source_ids: [obs.id], status: obs.status, notes: [obs.reason] }));
      for (const claim of this.state.claims) {
        const contradictionPressure = (claim.contradictions || []).reduce((sum, id) => { const c = this.state.contradictions.find((item) => item.id === id && item.status === 'active'); return sum + (c ? Number(c.severity || 0) : 0); }, 0);
        const semantic = this.semanticForText(claim.text, { confidence: claim.confidence, contradictionPressure, supportCount: claim.evidence_for.length, attackCount: claim.evidence_against.length, scope: claim.scope });
        nodes.push(this.graphNode({ id: `claim_node:${claim.id}`, type: 'claim', scope: claim.scope, label: claim.text, semantic, weight: scopeWeight(claim.scope), parent_id: `stance_node:${claim.object || 'unclassified'}`, source_ids: [claim.id], status: claim.status, notes: claim.live_hypotheses.length ? [`live hypotheses: ${claim.live_hypotheses.join(', ')}`] : [] }));
      }
      for (const contradiction of this.state.contradictions) {
        const a = this.findClaim(contradiction.claim_a); const b = this.findClaim(contradiction.claim_b);
        const object = a?.object || b?.object || 'unclassified';
        const semantic = this.semanticForText(`${a?.text || ''} ${b?.text || ''}`, { confidence: 0.45, contradictionPressure: Number(contradiction.severity || 0), scope: 'contradiction' });
        nodes.push(this.graphNode({ id: `contradiction_node:${contradiction.id}`, type: 'contradiction', scope: 'contradiction', label: contradiction.reason, semantic, weight: scopeWeight('contradiction'), parent_id: `stance_node:${object}`, source_ids: [contradiction.id, contradiction.claim_a, contradiction.claim_b], status: contradiction.status, notes: ['Unresolved contradiction remains pressure until evidence resolves it.'] }));
      }
      const groups = new Map();
      for (const node of nodes.filter((n) => ['claim', 'contradiction'].includes(n.type))) { const key = node.parent_id || 'stance_node:unclassified'; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(node); }
      for (const [id, children] of groups.entries()) {
        const semantic = this.blendSemantics(children.map((child) => ({ semantic: child.semantic, weight: child.weight })));
        const activeContradictions = children.filter((child) => child.type === 'contradiction' && child.status === 'active').length;
        nodes.push(this.graphNode({ id, type: 'stance_cluster', scope: 'stance', label: `Stance cluster: ${id.replace('stance_node:', '')}`, semantic, weight: 0.75 + children.length * 0.08, parent_id: 'root_worldview', source_ids: children.flatMap((child) => child.source_ids || []), status: activeContradictions ? 'under_pressure' : 'active', notes: activeContradictions ? [`${activeContradictions} unresolved contradiction(s) in cluster`] : [] }));
      }
      if (this.state.principles.length) {
        const semantic = this.blendSemantics(this.state.principles.map((p) => ({ semantic: this.semanticForText(p.text, { confidence: p.confidence, supportCount: p.evidence_for?.length || 0, attackCount: p.evidence_against?.length || 0, scope: p.scope }), weight: scopeWeight(p.scope) })));
        nodes.push(this.graphNode({ id: 'principle_cluster', type: 'principle_cluster', scope: 'worldview_fragment', label: 'Principles currently formed', semantic, weight: 1.1, parent_id: 'root_worldview', source_ids: this.state.principles.map((p) => p.id), status: 'active', notes: this.state.principles.map((p) => `${p.status}: ${p.text}`) }));
      }
      const rootChildren = nodes.filter((node) => node.parent_id === 'root_worldview');
      const rootSemantic = (this.state.claims.length || this.state.evidence.length || this.state.contradictions.length || this.state.principles.length) ? this.state.semantic : this.blendSemantics(rootChildren.map((child) => ({ semantic: child.semantic, weight: child.weight })));
      const root = this.graphNode({ id: 'root_worldview', type: 'main_worldview', scope: 'full_profile_summary', label: 'Main worldview aggregate for current kernel memory', semantic: { a: Number(rootSemantic.a || 0), s: Number(rootSemantic.s || 0), b: Number(rootSemantic.b || 0) }, weight: 1, parent_id: null, source_ids: rootChildren.map((child) => child.id), status: 'aggregate', notes: ['Root summarizes active memory; it should not erase local unresolved states.'] });
      nodes.unshift(root);
      for (const node of nodes) if (node.parent_id) { const parent = nodes.find((item) => item.id === node.parent_id); links.push({ from: node.id, to: node.parent_id, relation: this.nodeParentRelation(node, parent), child_y: node.octahedron.point.y, parent_y: parent?.octahedron?.point?.y ?? null }); }
      for (const dep of this.state.dependencies) links.push({ from: `claim_node:${dep.depends_on}`, to: `claim_node:${dep.dependent}`, relation: `dependency:${dep.relation}`, strength: dep.strength });
      return { version: 'belief_graph_v0_2', root_id: 'root_worldview', nodes, links, notes };
    }

    nodeParentRelation(node, parent = null) {
      if (!parent) return 'unlinked';
      const childY = Number(node.octahedron?.point?.y || 0); const parentY = Number(parent.octahedron?.point?.y || 0);
      if (childY < -0.1) return 'pressure_against_parent';
      if (childY > 0.35 && parentY >= 0) return 'aligned_can_reinforce_parent';
      if (Math.abs(childY) <= 0.1) return 'local_unresolved_do_not_merge_strongly';
      return 'weak_or_mixed_influence';
    }

    recalculate(makeAudit = true) {
      let positive = 0, negative = 0, covered = 0, total = 0;
      for (const [gate, data] of Object.entries(this.state.gateStates)) {
        const weight = DEFAULT_GATE_WEIGHTS[gate] || 1; total += weight;
        if (data.positive_events || data.negative_events) covered += weight;
        if (data.score > 0) positive += data.score * weight;
        if (data.score < 0) negative += Math.abs(data.score) * weight;
      }
      const activeContradictions = this.state.contradictions.filter((c) => c.status === 'active');
      const contradictionPressure = activeContradictions.reduce((sum, c) => sum + c.severity, 0);
      const unresolvedQuestionPressure = this.state.questions.filter((q) => q.status === 'open').length * 0.035;
      const unsupportedConfidencePressure = this.state.claims.filter((c) => c.confidence > 0.7 && !c.evidence_for.length).length * 0.06;
      let s = 0;
      if (positive || negative || contradictionPressure || this.state.evidence.length || this.state.claims.length || this.state.principles.length) {
        s = (positive - negative - contradictionPressure * 0.14 - unresolvedQuestionPressure - unsupportedConfidencePressure) / Math.max(total, 1);
      }
      let a = 0, b = 0;
      const text = lower([...this.state.claims.map((c) => c.text), ...this.state.evidence.map((e) => e.text), ...this.state.principles.map((p) => p.text)].join(' '));
      if (text) {
        const empathy = containsAny(text, ['harm', 'person', 'people', 'care', 'fair', 'accuse', 'blame']) ? 0.08 : 0;
        const practicality = containsAny(text, ['deadline', 'timestamp', 'receipt', 'constraint', 'evidence', 'record']) ? 0.08 : 0;
        const wisdom = containsAny(text, ['motive', 'hypothesis', 'uncertain', 'unresolved', 'calibrated', 'scope']) ? 0.08 : 0;
        const knowledge = containsAny(text, ['fact', 'record', 'timestamp', 'evidence', 'data']) ? 0.08 : 0;
        a = empathy - practicality; b = wisdom - knowledge; if (Math.abs(a) < 0.01 && Math.abs(b) < 0.01 && Math.abs(s) > 0.01) b = s > 0 ? 0.04 : -0.04;
      }
      this.state.semantic = { a: Number(a.toFixed(4)), s: Number(clamp(s, -1, 1).toFixed(4)), b: Number(b.toFixed(4)), positive_gate_mass: Number(positive.toFixed(4)), negative_gate_mass: Number(negative.toFixed(4)), gate_coverage: total ? Number((covered / total).toFixed(4)) : 0, contradiction_pressure: Number(contradictionPressure.toFixed(4)), unresolved_question_pressure: Number(unresolvedQuestionPressure.toFixed(4)), unsupported_confidence_pressure: Number(unsupportedConfidencePressure.toFixed(4)) };
      this.state.octahedron = projectSemanticTriple(this.state.semantic.a, this.state.semantic.s, this.state.semantic.b);
      this.state.beliefGraph = this.buildBeliefGraph();
      if (makeAudit) this.state.currentAuditPreview = this.previewAudit();
      this.state.updated_at = new Date().toISOString();
      return this.snapshot();
    }

    previewAudit() {
      const findings = [];
      const activeContradictions = this.state.contradictions.filter((c) => c.status === 'active');
      const rootY = Number(this.state.octahedron?.point?.y || 0);
      if (activeContradictions.length && rootY > 0.55) findings.push({ severity: 'medium', type: 'possible_over_reward', text: 'Root y is high while active contradictions remain unresolved.' });
      for (const claim of this.state.claims) {
        if (claim.confidence > 0.72 && !claim.evidence_for.length) findings.push({ severity: 'medium', type: 'unsupported_confidence', text: `High confidence without support: ${claim.text}` });
        if (motiveLanguage(claim.text) && !claim.evidence_for.length) findings.push({ severity: 'medium', type: 'motive_overclaim_risk', text: `Motive needs separate evidence: ${claim.text}` });
      }
      if (!findings.length) findings.push({ severity: 'low', type: 'no_major_audit_flags', text: 'No major self-audit flags under current simple checks.' });
      return { created_at: new Date().toISOString(), findings };
    }
  }

  global.EpistemicKernel = EpistemicKernel;
  global.EpistemicKernelDefaults = { DEFAULT_GATE_WEIGHTS, GATE_LABELS, LOCAL_Y_SIGNAL_WEIGHTS, GATE_TO_SIGNAL, SCOPE_WEIGHTS, projectSemanticTriple };
  if (typeof module !== 'undefined' && module.exports) module.exports = { EpistemicKernel, DEFAULT_GATE_WEIGHTS, GATE_LABELS, projectSemanticTriple };
})(typeof window !== 'undefined' ? window : globalThis);
