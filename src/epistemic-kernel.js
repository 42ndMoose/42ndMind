/* Epistemic Kernel v0
   A tiny transparent belief-state engine inspired by the Epistemic Octahedron and Philosopher's Stone profiler logic.
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

  const LOCAL_SIGNAL_WEIGHTS = {
    positive: {
      counter_consideration: 1.15,
      self_correction: 1.25,
      reality_contact: 1.25,
      coherence: 1.1,
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

  function createGateStateMap() {
    return Object.fromEntries(Object.keys(DEFAULT_GATE_WEIGHTS).map((gate) => [
      gate,
      {
        score: 0,
        status: 'dormant',
        positive_events: 0,
        negative_events: 0,
        last_evidence_span: null,
      },
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

  function strengthValue(strength) {
    const s = lower(strength);
    if (s === 'weak') return 0.25;
    if (s === 'strong') return 0.85;
    return 0.5;
  }

  function projectSemanticTriple(a, s, b) {
    const xSemantic = clamp(a, -3, 3);
    const ySemantic = clamp(s, -3, 3);
    const zSemantic = clamp(b, -3, 3);
    const magnitude = Math.abs(xSemantic) + Math.abs(ySemantic) + Math.abs(zSemantic);
    if (magnitude <= 1e-9) {
      return {
        point: { x: 0, y: 0, z: 0 },
        debug: {
          state: 'null_origin',
          semantic: { a: xSemantic, s: ySemantic, b: zSemantic },
          magnitude,
          surface_equation: '|x| + |y| + |z| = 0 because no active worldview is yet plotted',
        },
      };
    }
    const point = {
      x: xSemantic / magnitude,
      y: ySemantic / magnitude,
      z: zSemantic / magnitude,
    };
    return {
      point,
      debug: {
        state: point.y >= 0 ? 'active_positive_or_mixed' : 'active_negative_or_collapse_pressure',
        semantic: { a: xSemantic, s: ySemantic, b: zSemantic },
        magnitude,
        manhattan: Math.abs(point.x) + Math.abs(point.y) + Math.abs(point.z),
        surface_equation: '|x| + |y| + |z| = 1 for active worldview positions',
      },
    };
  }

  function containsAny(text, terms) {
    const t = lower(text);
    return terms.some((term) => t.includes(term));
  }

  function absoluteOrClosureLanguage(text) {
    return /\b(always|never|impossible|no possible way|cannot be wrong|can't be wrong|nothing would change|nothing can change|everyone who disagrees|anyone who disagrees|only proves|proves how|brainwashed|no evidence could|no amount of evidence)\b/i.test(text);
  }

  function negativeClaimLanguage(text) {
    return /\b(never|did not|didn't|no longer|not|cannot|can't|wasn't|isn't|no way)\b/i.test(text);
  }

  function positiveAdmissionLanguage(text) {
    return /\b(actually|i did|i took|i borrowed|i submitted|i returned|i found|i deleted|i left|i heard only|only heard|i was wrong|i misunderstood)\b/i.test(text);
  }

  function selfSealingLanguage(text) {
    return /\b(anyone who disagrees|everyone who disagrees|evidence against|counterevidence|only proves|proves how|brainwashed|part of the conspiracy|fake because|no evidence could|unfalsifiable)\b/i.test(text);
  }

  function realityContactLanguage(text) {
    return /\b(timestamp|receipt|record|video|deadline|evidence|log|bank transfer|found in|measured|verified|document|official|photo|data|source)\b/i.test(text);
  }

  function extractObjectGuess(text) {
    const t = lower(text).replace(/[.,!?;:]/g, ' ');
    const candidates = ['keys', 'key', 'charger', 'phone', 'book', 'money', 'form', 'car', 'messages', 'message', 'deadline'];
    return candidates.find((c) => t.split(/\s+/).includes(c)) || '';
  }

  function contradictionReason(a, b) {
    const ta = lower(a.text);
    const tb = lower(b.text);
    const sameObject = a.object && b.object && a.object === b.object;

    if (sameObject && negativeClaimLanguage(ta) && positiveAdmissionLanguage(tb)) {
      return 'Earlier negative or absolute claim conflicts with later admission involving the same object.';
    }
    if (sameObject && negativeClaimLanguage(tb) && positiveAdmissionLanguage(ta)) {
      return 'Later negative or absolute claim conflicts with earlier admission involving the same object.';
    }
    if (ta.includes('before the deadline') && (tb.includes('after the deadline') || tb.includes('deadline was yesterday') || tb.includes('this morning'))) {
      return 'Timeline contradiction: before-deadline claim conflicts with later timing evidence.';
    }
    if (tb.includes('before the deadline') && (ta.includes('after the deadline') || ta.includes('deadline was yesterday') || ta.includes('this morning'))) {
      return 'Timeline contradiction: before-deadline claim conflicts with earlier timing evidence.';
    }
    if ((ta.includes('stole') || ta.includes('stolen')) && tb.includes('found') && tb.includes('backpack')) {
      return 'Mistaken-accusation pressure: theft claim conflicts with later discovery in own possession.';
    }
    if ((tb.includes('stole') || tb.includes('stolen')) && ta.includes('found') && ta.includes('backpack')) {
      return 'Mistaken-accusation pressure: theft claim conflicts with earlier discovery in own possession.';
    }
    if (ta.includes('nothing wrong') && tb.includes('deleted')) {
      return 'Self-serving concealment pressure: broad innocence claim conflicts with deletion of damaging messages.';
    }
    if (tb.includes('nothing wrong') && ta.includes('deleted')) {
      return 'Self-serving concealment pressure: broad innocence claim conflicts with deletion of damaging messages.';
    }
    if (selfSealingLanguage(ta) || selfSealingLanguage(tb)) {
      return 'Self-sealing pressure detected: counterevidence or disagreement is being reinterpreted as confirmation.';
    }
    return '';
  }

  class EpistemicKernel {
    constructor(seed = null) {
      this.state = seed || this.createEmptyState();
      this.recalculate();
    }

    createEmptyState() {
      return {
        version: 'epistemic_kernel_v0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        claims: [],
        evidence: [],
        contradictions: [],
        questions: [],
        principles: [],
        gateStates: createGateStateMap(),
        semantic: { a: 0, s: 0, b: 0 },
        octahedron: { point: { x: 0, y: 0, z: 0 }, debug: {} },
        eventLog: [],
      };
    }

    reset() {
      this.state = this.createEmptyState();
      this.recalculate();
      return this.snapshot();
    }

    snapshot() {
      return JSON.parse(JSON.stringify(this.state));
    }

    log(type, detail) {
      this.state.eventLog.push({ id: uid('event'), at: new Date().toISOString(), type, detail });
      this.state.updated_at = new Date().toISOString();
    }

    applyGateEvent(gate, direction, { strength = 'moderate', confidence = 0.75, evidence = '', reason = '' } = {}) {
      const data = this.state.gateStates[gate];
      if (!data) return;
      const sign = direction === 'negative' ? -1 : 1;
      const weight = DEFAULT_GATE_WEIGHTS[gate] || 1;
      const delta = sign * strengthValue(strength) * clamp(confidence, 0, 1) * weight;
      const old = Number(data.score) || 0;
      const multiplier = Math.sign(old) === Math.sign(delta) ? (1 - Math.min(0.85, Math.abs(old))) : 1.15;
      data.score = clamp(old + delta * multiplier, -1, 1);
      data.status = gateStatusFromScore(data.score);
      data.last_evidence_span = evidence || reason || data.last_evidence_span || null;
      if (direction === 'negative') data.negative_events += 1;
      else data.positive_events += 1;
    }

    addClaim({ text, subject = 'unspecified', object = '', scope = 'specific', confidence = 0.5, source = 'manual' }) {
      const claim = {
        id: uid('claim'),
        text: clean(text),
        subject: clean(subject) || 'unspecified',
        object: clean(object) || extractObjectGuess(text),
        scope: clean(scope) || 'specific',
        confidence: clamp(confidence, 0, 1),
        status: 'active',
        source: clean(source) || 'manual',
        evidence_for: [],
        evidence_against: [],
        contradictions: [],
        live_hypotheses: [],
        created_at: new Date().toISOString(),
      };
      if (!claim.text) throw new Error('Claim text is required.');
      this.state.claims.push(claim);
      this.log('claim_added', { claim_id: claim.id, text: claim.text });

      if (absoluteOrClosureLanguage(claim.text)) {
        this.applyGateEvent('G3_self_correction', 'negative', {
          strength: 'moderate', confidence: 0.65, evidence: claim.text,
          reason: 'absolute or closure language increases false-certainty risk',
        });
      }
      if (selfSealingLanguage(claim.text)) {
        this.applyGateEvent('G6_non_self_sealing', 'negative', {
          strength: 'strong', confidence: 0.85, evidence: claim.text,
          reason: 'self-sealing language detected',
        });
      }
      if (realityContactLanguage(claim.text)) {
        this.applyGateEvent('G5_reality_contact', 'positive', {
          strength: 'weak', confidence: 0.55, evidence: claim.text,
          reason: 'claim refers to checkable evidence or concrete reality-contact signal',
        });
      }

      this.detectContradictionsForClaim(claim);
      this.recalculate();
      return claim;
    }

    addEvidence({ text, relation = 'supports', claimId = '', strength = 'moderate', confidence = 0.75, source = 'manual' }) {
      const ev = {
        id: uid('evidence'),
        text: clean(text),
        relation: relation === 'attacks' ? 'attacks' : 'supports',
        claimId: clean(claimId),
        strength,
        confidence: clamp(confidence, 0, 1),
        source: clean(source) || 'manual',
        created_at: new Date().toISOString(),
      };
      if (!ev.text) throw new Error('Evidence text is required.');
      this.state.evidence.push(ev);
      const claim = this.state.claims.find((item) => item.id === ev.claimId);
      if (claim) {
        if (ev.relation === 'supports') {
          claim.evidence_for.push(ev.id);
          claim.confidence = clamp(claim.confidence + 0.15 * strengthValue(strength) * ev.confidence, 0, 1);
        } else {
          claim.evidence_against.push(ev.id);
          claim.confidence = clamp(claim.confidence - 0.55 * strengthValue(strength) * ev.confidence, 0, 1);
          if (claim.confidence < 0.25) claim.status = 'weakened';
        }
      }
      this.applyGateEvent('G5_reality_contact', 'positive', {
        strength: strength || 'moderate', confidence: ev.confidence, evidence: ev.text,
        reason: 'evidence was attached to a belief',
      });
      if (ev.relation === 'attacks') {
        this.applyGateEvent('G4_contradiction_handling', 'positive', {
          strength: 'moderate', confidence: 0.75, evidence: ev.text,
          reason: 'attacking evidence was allowed to weaken a claim',
        });
        this.addQuestion(`What would fairly distinguish whether this attacked claim is false, overbroad, or only partly true?`, { claim_id: ev.claimId });
      }
      this.log('evidence_added', { evidence_id: ev.id, relation: ev.relation, claim_id: ev.claimId });
      this.detectAllContradictions();
      this.recalculate();
      return ev;
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

    addPrinciple(text, source = 'kernel') {
      const value = clean(text);
      if (!value) return null;
      const existing = this.state.principles.find((item) => lower(item.text) === lower(value));
      if (existing) return existing;
      const principle = { id: uid('principle'), text: value, source, created_at: new Date().toISOString(), status: 'active' };
      this.state.principles.push(principle);
      return principle;
    }

    detectContradictionsForClaim(claim) {
      for (const other of this.state.claims) {
        if (other.id === claim.id) continue;
        const reason = contradictionReason(other, claim);
        if (!reason) continue;
        const exists = this.state.contradictions.find((c) => {
          const ids = [c.claim_a, c.claim_b].sort().join('|');
          const next = [other.id, claim.id].sort().join('|');
          return ids === next;
        });
        if (exists) continue;
        const contradiction = {
          id: uid('contradiction'),
          claim_a: other.id,
          claim_b: claim.id,
          reason,
          status: 'active',
          severity: this.estimateContradictionSeverity(other, claim, reason),
          created_at: new Date().toISOString(),
        };
        this.state.contradictions.push(contradiction);
        other.contradictions.push(contradiction.id);
        claim.contradictions.push(contradiction.id);
        this.applyContradictionPressure(contradiction, other, claim);
      }
    }

    detectAllContradictions() {
      for (const claim of this.state.claims) this.detectContradictionsForClaim(claim);
    }

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
      this.applyGateEvent('G4_contradiction_handling', 'positive', {
        strength: 'moderate', confidence: contradiction.severity, evidence,
        reason: 'contradiction detected and preserved rather than ignored',
      });
      this.applyGateEvent('G1_counter_consideration', 'positive', {
        strength: 'moderate', confidence: 0.7, evidence,
        reason: 'contradiction created counter-consideration pressure',
      });

      const hypotheses = this.hypothesesForContradiction(contradiction, a, b);
      a.live_hypotheses = Array.from(new Set([...a.live_hypotheses, ...hypotheses]));
      b.live_hypotheses = Array.from(new Set([...b.live_hypotheses, ...hypotheses]));

      this.addQuestion('What evidence would distinguish mistake, scope shift, partial truth, and deliberate deception?', { contradiction_id: contradiction.id });
      this.addQuestion('What exactly changed between the earlier claim and the later claim?', { contradiction_id: contradiction.id });

      if (contradiction.reason.includes('Self-sealing')) {
        this.applyGateEvent('G6_non_self_sealing', 'negative', {
          strength: 'strong', confidence: 0.9, evidence,
          reason: 'belief appears to reinterpret disagreement or counterevidence as confirmation',
        });
        this.addQuestion('What evidence would count against this belief?', { contradiction_id: contradiction.id });
      }

      if (contradiction.reason.includes('Mistaken-accusation')) {
        this.addPrinciple('An accusation should weaken sharply when the allegedly stolen object is found in the accuser’s own possession.');
      }
      if (contradiction.reason.includes('Timeline')) {
        this.addPrinciple('A timeline claim should be checked against timestamps and deadlines before motive is concluded.');
      }
      if (contradiction.reason.includes('Self-serving')) {
        this.addPrinciple('Concealment behavior damages credibility but does not automatically prove the underlying accusation.');
      }

      this.log('contradiction_detected', { contradiction_id: contradiction.id, reason: contradiction.reason });
    }

    hypothesesForContradiction(contradiction, a, b) {
      const reason = contradiction.reason;
      if (reason.includes('Timeline')) return [
        'timeline misunderstanding', 'memory error', 'misstated timeline', 'avoidance of consequence', 'system timestamp error',
      ];
      if (reason.includes('Mistaken-accusation')) return [
        'misplaced item', 'jumped to conclusion', 'frustration toward accused person', 'malice only if prior knowledge is shown',
      ];
      if (reason.includes('Self-serving')) return [
        'embarrassment', 'privacy concern', 'reputation management', 'deliberate concealment', 'underlying wrongdoing unresolved',
      ];
      if (reason.includes('Self-sealing')) return [
        'identity protection', 'group loyalty', 'fear of counterevidence', 'unfalsifiable belief defense',
      ];
      return ['memory error', 'scope shift', 'wording problem', 'partial truth', 'deliberate deception'];
    }

    resolveQuestion(questionId, note = '') {
      const q = this.state.questions.find((item) => item.id === questionId);
      if (!q) return null;
      q.status = 'resolved';
      q.resolution = clean(note);
      q.resolved_at = new Date().toISOString();
      this.applyGateEvent('G3_self_correction', 'positive', {
        strength: 'moderate', confidence: 0.7, evidence: q.text,
        reason: 'open inquiry was resolved or updated',
      });
      this.log('question_resolved', { question_id: q.id, note });
      this.recalculate();
      return q;
    }

    challengeClaim(claimId, challengeText = '') {
      const claim = this.state.claims.find((item) => item.id === claimId);
      if (!claim) return null;
      claim.status = claim.status === 'accepted' ? 'active' : claim.status;
      this.addQuestion(`Challenge this claim: ${challengeText || claim.text}`, { claim_id: claim.id });
      this.applyGateEvent('G1_counter_consideration', 'positive', {
        strength: 'moderate', confidence: 0.8, evidence: challengeText || claim.text,
        reason: 'claim was explicitly challenged instead of passively accepted',
      });
      this.recalculate();
      return claim;
    }

    quickIngest(text) {
      const raw = clean(text);
      if (!raw) return [];
      const sentences = raw
        .split(/(?<=[.!?])\s+/)
        .map((s) => clean(s))
        .filter(Boolean);
      const created = [];
      for (const sentence of sentences.length ? sentences : [raw]) {
        const claim = this.addClaim({
          text: sentence,
          subject: sentence.toLowerCase().includes('alex') ? 'Alex/user' : 'user',
          object: extractObjectGuess(sentence),
          confidence: positiveAdmissionLanguage(sentence) ? 0.7 : 0.55,
          source: 'quick_ingest',
        });
        created.push(claim);
      }
      this.detectAllContradictions();
      this.recalculate();
      return created;
    }

    answerAboutClaim(claimId) {
      const claim = this.state.claims.find((item) => item.id === claimId);
      if (!claim) return { answer: 'unresolved', confidence: 0, reason: 'claim not found' };
      const attacks = claim.evidence_against.length;
      const supports = claim.evidence_for.length;
      const contradictions = claim.contradictions.length;
      let answer = 'unresolved';
      if (claim.confidence >= 0.72 && supports >= attacks) answer = 'yes';
      if (claim.confidence <= 0.28 || attacks > supports + 1) answer = 'no';
      if (contradictions && claim.confidence > 0.28 && claim.confidence < 0.72) answer = 'unresolved';
      return {
        answer,
        confidence: Number(claim.confidence.toFixed(3)),
        reason: this.reasonForClaim(claim),
        live_hypotheses: claim.live_hypotheses,
        next_questions: this.state.questions.filter((q) => q.status === 'open' && JSON.stringify(q.links || {}).includes(claim.id)).map((q) => q.text),
      };
    }

    reasonForClaim(claim) {
      if (claim.evidence_against.length) return 'claim has attacking evidence and should not be naively accepted';
      if (claim.contradictions.length) return 'claim is involved in unresolved contradiction pressure';
      if (claim.evidence_for.length) return 'claim has supporting evidence, but confidence remains proportional to evidence strength';
      return 'claim has no attached evidence yet';
    }

    recalculate() {
      const gateStates = this.state.gateStates;
      let positive = 0;
      let negative = 0;
      let covered = 0;
      let total = 0;
      for (const [gate, data] of Object.entries(gateStates)) {
        const weight = DEFAULT_GATE_WEIGHTS[gate] || 1;
        total += weight;
        if (data.positive_events || data.negative_events) covered += weight;
        if (data.score > 0) positive += data.score * weight;
        if (data.score < 0) negative += Math.abs(data.score) * weight;
      }
      const contradictionPressure = this.state.contradictions.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.severity, 0);
      const unresolvedQuestionPressure = this.state.questions.filter((q) => q.status === 'open').length * 0.03;
      const evidenceCount = this.state.evidence.length;
      const claimCount = this.state.claims.length;

      let s = 0;
      if (positive || negative || contradictionPressure || evidenceCount || claimCount) {
        s = (positive - negative - contradictionPressure * 0.08 - unresolvedQuestionPressure) / Math.max(total, 1);
      }

      // Small lateral seeds keep active philosophical states from looking like fake pure verticality.
      // These do not claim strong empathy/practicality/wisdom/knowledge positions; they simply mark active reasoning as non-null.
      let a = 0;
      let b = 0;
      if (claimCount || evidenceCount) {
        const text = lower(this.state.claims.map((c) => c.text).join(' ') + ' ' + this.state.evidence.map((e) => e.text).join(' '));
        const empathy = containsAny(text, ['harm', 'person', 'people', 'care', 'fair', 'accuse', 'blame']) ? 0.08 : 0;
        const practicality = containsAny(text, ['deadline', 'timestamp', 'receipt', 'constraint', 'evidence', 'record']) ? 0.08 : 0;
        const wisdom = containsAny(text, ['motive', 'hypothesis', 'uncertain', 'unresolved', 'calibrated']) ? 0.08 : 0;
        const knowledge = containsAny(text, ['fact', 'record', 'timestamp', 'evidence', 'data']) ? 0.08 : 0;
        a = empathy - practicality;
        b = wisdom - knowledge;
        if (Math.abs(a) < 0.01 && Math.abs(b) < 0.01 && Math.abs(s) > 0.01) b = s > 0 ? 0.04 : -0.04;
      }

      this.state.semantic = {
        a: Number(a.toFixed(4)),
        s: Number(clamp(s, -1, 1).toFixed(4)),
        b: Number(b.toFixed(4)),
        positive_gate_mass: Number(positive.toFixed(4)),
        negative_gate_mass: Number(negative.toFixed(4)),
        gate_coverage: total ? Number((covered / total).toFixed(4)) : 0,
        contradiction_pressure: Number(contradictionPressure.toFixed(4)),
      };
      this.state.octahedron = projectSemanticTriple(this.state.semantic.a, this.state.semantic.s, this.state.semantic.b);
      return this.snapshot();
    }
  }

  global.EpistemicKernel = EpistemicKernel;
  global.EpistemicKernelDefaults = { DEFAULT_GATE_WEIGHTS, GATE_LABELS, LOCAL_SIGNAL_WEIGHTS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EpistemicKernel, DEFAULT_GATE_WEIGHTS, GATE_LABELS, projectSemanticTriple };
  }
})(typeof window !== 'undefined' ? window : globalThis);
