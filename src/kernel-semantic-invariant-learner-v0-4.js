/* 42ndMind Semantic Invariant Learner v0.4
 * Learns repeated semantic-pressure patterns as candidate invariants.
 * It does not decide truth, rewrite source, promote doctrine, import commands,
 * or move belief state. Stable invariants can only become promotion candidates.
 */
(function (global) {
  'use strict';

  const VERSION = '0.4.0';
  const DEFAULT_KEY = '42ndMind_semantic_invariants_v0_4';
  const DECISIONS = Object.freeze({
    NO_SEMANTIC_SIGNAL: 'NO_SEMANTIC_SIGNAL',
    HOLD_MORE_OBSERVATIONS: 'HOLD_MORE_OBSERVATIONS',
    INVARIANT_CANDIDATE: 'INVARIANT_CANDIDATE',
    INVARIANT_STABLE: 'INVARIANT_STABLE'
  });
  const PRESSURES = Object.freeze({
    CLOSURE: 'closure_pressure',
    AUTHORITY: 'authority_transfer_pressure',
    TRUST: 'trust_inflation_pressure',
    AMBIGUITY: 'ambiguity_pressure',
    MOTIVE: 'motive_agency_pressure',
    DISMISSAL: 'dismissal_pressure',
    SOURCE_TRUST: 'source_trust_pressure',
    TECHNICAL: 'technical_definition_pressure'
  });
  const RULES = Object.freeze([
    { terms:['debunked','debunk','fact-checked','factchecked'], pressures:[PRESSURES.CLOSURE, PRESSURES.DISMISSAL] },
    { terms:['certified','verified','trusted','authoritative','expert','consensus','science-backed'], pressures:[PRESSURES.AUTHORITY, PRESSURES.TRUST] },
    { terms:['ifcn','fact-check','factchecker','fact-checker'], pressures:[PRESSURES.SOURCE_TRUST, PRESSURES.AUTHORITY] },
    { terms:['they','them','this','that','those','these','someone','something'], pressures:[PRESSURES.AMBIGUITY] },
    { terms:['coordinated','coordination','collusion','agenda','motive','intent','apparatus','network'], pressures:[PRESSURES.MOTIVE] },
    { terms:['misinformation','disinformation','malinformation','propaganda','conspiracy','extremist','radical','harmful','unsafe','dangerous','anti-science'], pressures:[PRESSURES.DISMISSAL, PRESSURES.CLOSURE] },
    { terms:['cda-eos','iapws','llm','ees','sha'], pressures:[PRESSURES.TECHNICAL] }
  ]);

  function text(v){ return String(v ?? '').trim(); }
  function lower(v){ return text(v).toLowerCase(); }
  function asArray(v){ return Array.isArray(v) ? v : []; }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function now(){ return new Date().toISOString(); }
  function round(v){ return Number(Math.max(0, Math.min(1, Number(v)||0)).toFixed(3)); }
  function id(p){ return `${p}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
  function unique(items){ const s=new Set(), out=[]; asArray(items).forEach(x=>{ const t=text(x), k=lower(t); if(t&&!s.has(k)){s.add(k); out.push(t);} }); return out; }
  function storageAvailable(){ try { return typeof localStorage !== 'undefined'; } catch(e){ return false; } }
  function parse(raw, fallback){ try { return JSON.parse(raw); } catch(e){ return fallback; } }

  function doctrine(){ return {
    semantic_invariants_are_candidates_not_doctrine: true,
    learner_does_not_decide_truth: true,
    learner_does_not_patch_source: true,
    stable_invariant_requires_promotion_pipeline: true,
    objective_language_math_is_discovered_as_pressure_patterns: true,
    belief_movement: 'none'
  }; }

  function emptyLedger(){ return { packet_type:'42ndMind_semantic_invariant_ledger_v0_4', packet_version:VERSION, created_at:now(), updated_at:now(), observations:[], invariants:[], doctrine:doctrine() }; }
  function load(key=DEFAULT_KEY){ if(!storageAvailable()) return emptyLedger(); const raw=localStorage.getItem(key); if(!raw) return emptyLedger(); const led=parse(raw, emptyLedger()); return led && Array.isArray(led.observations) && Array.isArray(led.invariants) ? led : emptyLedger(); }
  function save(ledger, key=DEFAULT_KEY){ if(!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key }; ledger.updated_at=now(); localStorage.setItem(key, JSON.stringify(ledger,null,2)); return { ok:true, reason:'saved_semantic_invariants', key, ledger }; }
  function clear(key=DEFAULT_KEY){ if(!storageAvailable()) return { ok:false, reason:'localStorage_unavailable', key }; localStorage.removeItem(key); return { ok:true, reason:'cleared_semantic_invariants', key }; }

  function rawText(input){
    if(typeof input === 'string') return input;
    if(!input || typeof input !== 'object') return '';
    if(input.raw_text) return text(input.raw_text);
    if(input.text) return text(input.text);
    if(input.claim) return text(input.claim);
    if(input.label) return text(input.label);
    if(input.packet_type === '42ndMind_lexical_uncertainty_report_v0_4') return text(input.raw_text);
    if(input.packet_type === '42ndMind_epistemic_memory_recall_v0_4') return asArray(input.entries).map(e => e.label || e.reason || '').join(' ');
    return text(JSON.stringify(input));
  }
  function tokenize(raw){ return unique(text(raw).match(/[A-Za-z][A-Za-z0-9_-]{1,}/g)||[]); }
  function inferOutcome(input, options){ return text(options && options.outcome || input && (input.outcome || input.decision || input.final_decision) || 'unresolved'); }
  function inferConfirmed(input, options){ return options && options.confirmed === true || input && input.confirmed === true || /PASS_NO_BEHAVIOR_DELTA|TRUST_PRIOR_STRONG|IMPORT_WITH_CAUTION/.test(inferOutcome(input, options)); }
  function inferContradicted(input, options){ return options && options.contradicted === true || input && input.contradicted === true || /CONTRADICTION|BLOCK|CONFLICTED|DRIFT|FAILED/.test(inferOutcome(input, options)); }

  function pressuresForTerm(term, raw, input){
    const key=lower(term), hay=lower(raw), out=[];
    RULES.forEach(rule => { if(rule.terms.some(t => key === t || key.includes(t) || hay.includes(t))) rule.pressures.forEach(p => out.push({ pressure:p, source:'term_rule' })); });
    if(input && input.packet_type === '42ndMind_lexical_uncertainty_report_v0_4') asArray(input.unresolved_terms).forEach(t => { if(lower(t.term) === key) out.push({ pressure:t.type === 'ambiguous_reference' ? PRESSURES.AMBIGUITY : PRESSURES.TECHNICAL, source:'lexical_uncertainty' }); });
    if(input && input.packet_type === '42ndMind_source_trust_bridge_packet_v0_4') asArray(input.aggregate && input.aggregate.source_pressure_tags).forEach(() => out.push({ pressure:PRESSURES.SOURCE_TRUST, source:'source_trust_bridge' }));
    const seen=new Set(); return out.filter(x => { const k=x.pressure+'::'+x.source; if(seen.has(k)) return false; seen.add(k); return true; });
  }

  function observationFrom(input={}, options={}){
    const raw=rawText(input), terms=tokenize(raw), obs=[];
    terms.forEach(term => pressuresForTerm(term, raw, input).forEach(sig => obs.push({
      id:id('semantic_obs'), term, term_key:lower(term), pressure:sig.pressure, signal_source:sig.source,
      context:text(options.context || input.context || input.packet_type || 'raw_text'), outcome:inferOutcome(input, options),
      confirmed:inferConfirmed(input, options), contradicted:inferContradicted(input, options), raw_excerpt:raw.slice(0,240)
    })));
    return { packet_type:'42ndMind_semantic_observation_batch_v0_4', packet_version:VERSION, created_at:now(), raw_text:raw, term_observations:obs, count:obs.length, belief_movement:'none', doctrine:doctrine() };
  }

  function statement(term, pressure){
    const map={
      closure_pressure:'tends to apply dispute-closure pressure', authority_transfer_pressure:'tends to transfer authority/status into claim support', trust_inflation_pressure:'tends to inflate source trust pressure', ambiguity_pressure:'tends to create unresolved reference pressure', motive_agency_pressure:'tends to create motive/agency pressure', dismissal_pressure:'tends to dismiss or morally frame a claim/source before evidence is resolved', source_trust_pressure:'tends to invoke source-certification or provenance pressure', technical_definition_pressure:'requires contextual definition before strong claim pressure'
    };
    return `Term "${term}" ${map[pressure] || 'has repeated semantic pressure'}.`;
  }
  function maturity(count, contradictionRate, minObs){ const c=Math.min(1, count/Math.max(1,minObs)); return round(c*0.55 + (1-contradictionRate)*0.45); }
  function decision(count, score, minObs){ if(count < minObs) return DECISIONS.HOLD_MORE_OBSERVATIONS; if(score >= 0.82) return DECISIONS.INVARIANT_STABLE; if(score >= 0.6) return DECISIONS.INVARIANT_CANDIDATE; return DECISIONS.HOLD_MORE_OBSERVATIONS; }

  function learnInvariants(observations, options={}){
    const minObs=Number(options.min_observations || 3), groups={};
    asArray(observations).forEach(o => { const k=`${o.term_key}::${o.pressure}`; (groups[k]||(groups[k]=[])).push(o); });
    return Object.keys(groups).map(k => { const rows=groups[k], s=rows[0], contradictions=rows.filter(r=>r.contradicted).length, confirmations=rows.filter(r=>r.confirmed).length, cr=rows.length?contradictions/rows.length:0, score=maturity(rows.length, cr, minObs); return {
      id:`semantic_invariant_${s.term_key}_${s.pressure}`.replace(/[^a-z0-9_]+/gi,'_').slice(0,120), term:s.term, term_key:s.term_key, pressure:s.pressure,
      observation_count:rows.length, confirmation_rate:round(confirmations/Math.max(1,rows.length)), contradiction_rate:round(cr), maturity_score:score,
      decision:decision(rows.length, score, minObs), invariant_statement:statement(s.term, s.pressure), examples:rows.slice(-5).map(r=>({context:r.context,outcome:r.outcome,raw_excerpt:r.raw_excerpt})), active_belief_effect:'none', doctrine:{ invariant_is_candidate_not_doctrine:true, patch_requires_promotion_pipeline:true }
    }; }).sort((a,b)=>b.maturity_score-a.maturity_score || b.observation_count-a.observation_count);
  }

  function record(input={}, options={}){
    const key=options.key||DEFAULT_KEY, ledger=load(key), batch=input.packet_type==='42ndMind_semantic_observation_batch_v0_4'?input:observationFrom(input, options);
    if(!batch.term_observations.length) return { ok:false, decision:DECISIONS.NO_SEMANTIC_SIGNAL, reason:'no_semantic_observations', batch, ledger, belief_movement:'none' };
    batch.term_observations.forEach(o=>ledger.observations.push(o)); ledger.invariants=learnInvariants(ledger.observations, options); const saved=save(ledger,key);
    return { ok:saved.ok, decision:saved.ok?'OBSERVATIONS_RECORDED':'OBSERVATIONS_HELD', reason:saved.reason, key, recorded_count:batch.term_observations.length, batch, ledger:saved.ledger||ledger, belief_movement:'none', doctrine:doctrine() };
  }

  function stableInvariants(ledgerOrKey, options={}){ const ledger=typeof ledgerOrKey==='string'?load(ledgerOrKey):(ledgerOrKey||load(options.key)); return asArray(ledger.invariants).filter(i=>i.decision===DECISIONS.INVARIANT_STABLE); }
  function proposalForInvariant(inv){ return { id:`proposal_${inv.id}`, target_layer:'semantic_invariant_adapter', title:`Recognize semantic invariant: ${inv.term}`, proposed_change:`Use candidate invariant as lexical/semantic pressure: ${inv.invariant_statement}`, rationale:'Invariant became stable through repeated observations. It should be used as pressure only, not doctrine.', tests_required:['kernel-semantic-invariant-learner-v0-4-test.html','kernel-lexical-uncertainty-v0-4-test.html'], invariant:clone(inv), promotion_state:{ implemented:false, enabled:false } }; }
  function proposeStable(ledgerOrKey, options={}){ const stable=stableInvariants(ledgerOrKey, options); return { packet_type:'42ndMind_semantic_invariant_proposals_v0_4', packet_version:VERSION, created_at:now(), count:stable.length, proposals:stable.map(proposalForInvariant), belief_movement:'none', doctrine:doctrine() }; }

  function sampleInput(kind){
    if(kind==='closure') return 'The certified source debunked the misinformation claim.';
    if(kind==='motive') return 'They coordinated the agenda through that network.';
    if(kind==='technical') return 'The CDA-EOS result changes the IAPWS baseline.';
    if(kind==='clear') return 'The primary document supports the claim but questions remain.';
    return sampleInput('closure');
  }

  global.KernelSemanticInvariantLearnerV04 = Object.freeze({ VERSION, DEFAULT_KEY, DECISIONS, PRESSURES, load, save, clear, observationFrom, record, learnInvariants, stableInvariants, proposeStable, proposalForInvariant, sampleInput, doctrine });
})(typeof window !== 'undefined' ? window : globalThis);
