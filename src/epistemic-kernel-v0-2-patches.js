/* Epistemic Kernel v0.2 compatibility patches
   Loaded after src/epistemic-kernel-v0-2.js.
   Purpose: repair low-signal quarantine and tighten unresolved-contradiction audit behavior without rewriting the base engine. */
(function (global) {
  if (!global.EpistemicKernel || global.EpistemicKernel.__v02PatchesApplied) return;

  const Kernel = global.EpistemicKernel;
  const originalQuickIngest = Kernel.prototype.quickIngest;
  const originalAddClaim = Kernel.prototype.addClaim;
  const originalPreviewAudit = Kernel.prototype.previewAudit;
  const originalSelfAudit = Kernel.prototype.selfAudit;

  function clean(value) { return String(value ?? '').trim(); }
  function lower(value) { return clean(value).toLowerCase(); }
  function tokenParts(text) { return clean(text).split(/\s+/).filter(Boolean); }
  function alphaTokens(text) { return (lower(text).match(/[a-z]{2,}/g) || []); }
  function hasMeaningAnchor(text) {
    return /\b(i|you|he|she|they|we|alex|user|person|people|government|model|belief|claim|evidence|timestamp|receipt|record|deadline|form|charger|keys|phone|document|data|source|audit|test|principle|motive|criticism|truth|false|wrong|right)\b/i.test(text);
  }
  function hasPredicateAnchor(text) {
    return /\b(is|are|was|were|be|being|been|did|does|do|submitted|took|found|deleted|believes|means|causes|supports|attacks|proves|shows|checked|verified|changed|accused|stole|returned|admit|admitted|misunderstood)\b/i.test(text);
  }
  function hasEpistemicAnchor(text) {
    return /\b(evidence|counterevidence|timestamp|receipt|record|verified|measured|document|data|source|audit|test|benchmark|observed|contradiction|uncertain|hypothesis|principle|claim|belief|truth|false|wrong|motive|deadline)\b/i.test(text);
  }
  function hasClosureOrCorrectionAnchor(text) {
    return /\b(always|never|impossible|cannot be wrong|can't be wrong|anyone who disagrees|everyone who disagrees|only proves|brainwashed|no evidence could|actually|i was wrong|i misunderstood|admit|admitted|did not|didn't|no longer|nothing)\b/i.test(text);
  }
  function gibberishRatio(tokens) {
    if (!tokens.length) return 1;
    const weird = tokens.filter((token) => {
      const t = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!t) return true;
      if (/^(.)\1{2,}$/.test(t)) return true;
      if (/^[bcdfghjklmnpqrstvwxyz]{4,}$/i.test(t)) return true;
      if (/^[a-z]{2,6}$/i.test(t) && !/[aeiouy]/i.test(t)) return true;
      return false;
    }).length;
    return weird / tokens.length;
  }
  function shouldQuarantineLowSignal(text) {
    const raw = clean(text);
    if (!raw) return true;
    const tokens = tokenParts(raw);
    const letters = alphaTokens(raw);
    const hasAnchor = hasMeaningAnchor(raw) || hasPredicateAnchor(raw) || hasEpistemicAnchor(raw) || hasClosureOrCorrectionAnchor(raw);
    if (/^[^a-z0-9]+$/i.test(raw)) return true;
    if (raw.length < 12 && !hasAnchor) return true;
    if (!letters.length && !hasAnchor) return true;
    if (tokens.length <= 5 && !hasAnchor) return true;
    if (tokens.length <= 6 && gibberishRatio(tokens) >= 0.5 && !hasAnchor) return true;
    return false;
  }
  function activeContradictions(state) {
    return (state?.contradictions || []).filter((item) => item.status === 'active');
  }
  function openQuestions(state) {
    return (state?.questions || []).filter((item) => item.status === 'open');
  }
  function pushUniqueFinding(findings, finding) {
    if (!findings.some((item) => item.type === finding.type && item.text === finding.text)) findings.push(finding);
  }
  function addAuditPressureFindings(kernel, auditLike) {
    const state = kernel.state || {};
    const findings = auditLike.findings || [];
    const contradictions = activeContradictions(state);
    const rootY = Number(state.octahedron?.point?.y || 0);
    const evidenceCount = (state.evidence || []).length;
    const openContradictionQuestions = openQuestions(state).filter((q) => JSON.stringify(q.links || {}).includes('contradiction'));

    if (contradictions.length && rootY > 0.45) {
      pushUniqueFinding(findings, {
        severity: 'medium',
        type: 'possible_over_reward',
        text: 'Root y is positive while active contradictions remain unresolved. Detection is not the same as resolution.'
      });
    }
    if (contradictions.length && evidenceCount === 0) {
      pushUniqueFinding(findings, {
        severity: 'medium',
        type: 'unresolved_contradiction_needs_evidence',
        text: 'Active contradiction exists with no attached evidence. Preserve pressure until evidence or resolution is added.'
      });
    }
    if (contradictions.length && openContradictionQuestions.length === 0) {
      pushUniqueFinding(findings, {
        severity: 'high',
        type: 'unqueried_contradiction',
        text: 'Active contradiction lacks an open inquiry question linked to contradiction pressure.'
      });
    }
    auditLike.findings = findings;
    return auditLike;
  }

  Kernel.prototype.quickIngest = function patchedQuickIngest(text, options = {}) {
    const raw = clean(text);
    const mode = lower(options.mode || 'auto');
    if (mode === 'auto' && shouldQuarantineLowSignal(raw)) {
      return [this.addObservation({ text: raw, source: 'quick_ingest', reason: 'low-signal or gibberish input quarantined before claim creation' })];
    }
    return originalQuickIngest.call(this, text, options);
  };

  Kernel.prototype.addClaim = function patchedAddClaim(args = {}) {
    const source = lower(args.source || 'manual');
    const scope = lower(args.scope || 'claim');
    const text = clean(args.text);
    const structured = source === 'structured_packet';
    const explicitlyPhilosophical = scope === 'principle_candidate' || scope === 'worldview_fragment' || scope === 'core_principle';
    if (!structured && !explicitlyPhilosophical && shouldQuarantineLowSignal(text)) {
      return this.addObservation({ text, source: args.source || 'manual', reason: 'low-signal or gibberish input quarantined before claim creation' });
    }
    return originalAddClaim.call(this, args);
  };

  Kernel.prototype.previewAudit = function patchedPreviewAudit() {
    const audit = originalPreviewAudit.call(this);
    return addAuditPressureFindings(this, audit);
  };

  Kernel.prototype.selfAudit = function patchedSelfAudit() {
    const audit = originalSelfAudit.call(this);
    addAuditPressureFindings(this, audit);
    return audit;
  };

  Kernel.lowSignalPatch = { shouldQuarantineLowSignal };
  Kernel.__v02PatchesApplied = true;
})(typeof window !== 'undefined' ? window : globalThis);
