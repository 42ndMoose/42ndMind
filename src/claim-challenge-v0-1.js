/* Claim Challenge v0.1
   Turns an external claim into structured epistemic pressure.
   No rule promotion. Contradiction detection is not contradiction resolution. */
(function (global) {
  const VERSION = '0.1.0';
  function clean(v){ return String(v ?? '').replace(/\s+/g,' ').trim(); }
  function lower(v){ return clean(v).toLowerCase(); }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, Number(v)||0)); }
  function unique(items){ const seen=new Set(); const out=[]; for(const item of items||[]){ const text=clean(item); const key=lower(text); if(text && !seen.has(key)){ seen.add(key); out.push(text); } } return out; }
  function wordCount(text){ return clean(text).split(/\s+/).filter(Boolean).length; }
  function has(text, re){ return re.test(clean(text)); }

  const P = {
    predicate:/\b(is|are|was|were|be|being|been|did|does|do|has|have|had|means|causes|caused|supports|attacks|proves|shows|submitted|stole|deleted|found|outperforms|works|fails|should|must|can|cannot|can't|will|would)\b/i,
    evidence:/\b(evidence|source|data|document|record|receipt|timestamp|video|photo|audit|test|benchmark|study|measurement|report|log|verified|confirmed|observed|according to)\b/i,
    absolute:/\b(always|never|all|every|everyone|anyone|no one|nothing|only|impossible|guaranteed|cannot be wrong|can't be wrong|settled|undeniable|objectively)\b/i,
    selfSealing:/\b(anyone who disagrees|everyone who disagrees|no evidence could|no amount of evidence|only proves|part of the conspiracy|fake because|brainwashed|all criticism is|criticism means attack|unfalsifiable)\b/i,
    motive:/\b(lied|lying|liar|deceived|deception|malicious|hostile|evil|corrupt|agenda|on purpose|intentionally|motive|wanted to|because he wanted|because she wanted|because they wanted|bad faith)\b/i,
    causal:/\b(causes|caused|because|therefore|due to|leads to|resulted in|proves that|shows that|means that|as a result)\b/i,
    comparative:/\b(better than|worse than|more than|less than|equal to|same as|different from|outperforms|underperforms|stronger than|weaker than)\b/i,
    prediction:/\b(will|going to|inevitable|must happen|cannot fail|guaranteed to)\b/i,
    definition:/\b(real|true|fair|harm|harmful|privilege|freedom|justice|propaganda|critical thinking|expert|credible|safe|dangerous|woman|man|collective|duty)\b/i,
    contradictionTimeline:/\bbefore the deadline\b[\s\S]*\b(this morning|after the deadline|deadline was yesterday)\b|\b(this morning|after the deadline|deadline was yesterday)\b[\s\S]*\bbefore the deadline\b/i,
    contradictionAdmission:/\b(never|did not|didn't|no longer|nothing|none)\b[\s\S]*\b(actually|i did|we did|they did|admit|admitted|found|deleted|submitted)\b|\b(actually|i did|we did|they did|admit|admitted|found|deleted|submitted)\b[\s\S]*\b(never|did not|didn't|no longer|nothing|none)\b/i,
    vagueCertainty:/\b(obvious|clearly|everyone knows|common sense|self-evident|obviously)\b/i
  };

  function projectSemanticTriple(a,s,b){
    const semantic={ a:clamp(a,-3,3), s:clamp(s,-3,3), b:clamp(b,-3,3) };
    const mag=Math.abs(semantic.a)+Math.abs(semantic.s)+Math.abs(semantic.b);
    if(mag<=1e-9){
      return { point:{x:0,y:0,z:0}, debug:{ state:'null_origin', semantic, magnitude:mag, surface_equation:'|x| + |y| + |z| = 0 because no active claim state is plotted' } };
    }
    const point={ x:semantic.a/mag, y:semantic.s/mag, z:semantic.b/mag };
    return { point, debug:{ state:'active_claim_challenge_state', semantic, magnitude:mag, manhattan:Math.abs(point.x)+Math.abs(point.y)+Math.abs(point.z), surface_equation:'|x| + |y| + |z| = 1 for active claim-challenge states' } };
  }

  function extractClaimText(input){
    const raw=clean(input);
    if(!raw) return '';
    const quotes=Array.from(raw.matchAll(/["“”']([^"“”']{8,})["“”']/g)).map(m=>clean(m[1]));
    if(quotes.length) return quotes.sort((a,b)=>b.length-a.length)[0];
    return clean(raw.replace(/^\s*(claim|their claim|the claim|speaker says|speaker argues|they say|they argue|he says|she says|someone says|a person says)\s*[:\-]\s*/i,'').replace(/^\s*that\s+/i,'').replace(/^\s*(according to them|in their view),?\s*/i,''));
  }

  function lowSignalReason(claim){
    if(!claim) return 'No input was provided.';
    if(wordCount(claim)<4 && !has(claim,P.predicate)) return 'Input is too short to treat as a claim.';
    if(!has(claim,P.predicate) && wordCount(claim)<9) return 'No clear predicate or assertion was detected.';
    if(/^[^a-z0-9]+$/i.test(claim)) return 'Input has no claim-bearing language.';
    return '';
  }

  function dependenciesFor(claim){
    const deps=[];
    if(has(claim,P.absolute)) deps.push({ type:'scope_dependency', text:'Universal or absolute wording needs a defined scope and counterexample check.', pressure:'unresolved' });
    if(has(claim,P.causal)) deps.push({ type:'causal_dependency', text:'The causal link needs a mechanism, timing, and comparison against alternative causes.', pressure:'unresolved' });
    if(has(claim,P.comparative)) deps.push({ type:'comparison_dependency', text:'The comparison needs a named baseline, metric, and time window.', pressure:'unresolved' });
    if(has(claim,P.motive)) deps.push({ type:'motive_dependency', text:'Intent or motive must be separated from outcome, benefit, dislike, or disagreement.', pressure:'unresolved' });
    if(has(claim,P.prediction)) deps.push({ type:'prediction_dependency', text:'The prediction needs a dated condition that can later be checked as true or false.', pressure:'unresolved' });
    if(has(claim,P.definition)) deps.push({ type:'definition_dependency', text:'Key terms need stable definitions before the claim can be tested cleanly.', pressure:'unresolved' });
    if(!has(claim,P.evidence)) deps.push({ type:'evidence_dependency', text:'The claim needs at least one concrete evidence path before confidence should rise.', pressure:'unresolved' });
    return deps;
  }

  function flagsFor(claim, deps){
    const flags=[];
    const evidence=has(claim,P.evidence);
    if(has(claim,P.selfSealing)) flags.push({ type:'self_sealing', severity:'high', text:'The claim appears to reinterpret disagreement or counterevidence as confirmation.', pressure:'negative_stability', repair:'Name evidence that would count against the claim.' });
    if(has(claim,P.contradictionTimeline) || has(claim,P.contradictionAdmission)) flags.push({ type:'internal_contradiction_pressure', severity:'high', text:'The claim contains timeline or admission language that appears internally unstable.', pressure:'negative_stability', repair:'Separate the conflicting subclaims and check the timeline or object involved.' });
    if(has(claim,P.motive) && !evidence) flags.push({ type:'motive_overclaim', severity:'medium', text:'The claim asserts motive without separate motive evidence.', pressure:'unresolved', repair:'Show intent evidence, not just who benefited or who disagreed.' });
    if(has(claim,P.absolute)) flags.push({ type:'scope_overclaim', severity:'medium', text:'Absolute wording increases the burden of proof.', pressure:'unresolved', repair:'Narrow the scope or state the counterexample condition.' });
    if(has(claim,P.causal) && !evidence) flags.push({ type:'causal_overclaim', severity:'medium', text:'The claim makes a causal move without naming the evidence path.', pressure:'unresolved', repair:'Provide mechanism, sequence, and alternative-cause checks.' });
    if(has(claim,P.vagueCertainty) && !evidence) flags.push({ type:'unsupported_certainty', severity:'low', text:'Certainty language appears before support is shown.', pressure:'unresolved', repair:'Replace certainty language with the actual support level.' });
    if(!evidence && deps.some(d=>d.type!=='evidence_dependency')) flags.push({ type:'evidence_gap', severity:'low', text:'The claim is testable, but no concrete evidence has been supplied inside the input.', pressure:'unresolved', repair:'Attach evidence or mark the claim as unresolved.' });
    return flags;
  }

  function supportEvidenceFor(claim,deps){
    const out=['A direct source, record, timestamp, dataset, document, or observation that bears on the claim.','A clear definition of the claim terms and the scope being asserted.'];
    if(deps.some(d=>d.type==='causal_dependency')) out.push('Mechanism evidence plus timing that rules out obvious alternative causes.');
    if(deps.some(d=>d.type==='comparison_dependency')) out.push('A named baseline, shared metric, and same-period comparison.');
    if(deps.some(d=>d.type==='motive_dependency')) out.push('Separate intent evidence such as prior statement, private instruction, pattern, or admission.');
    if(deps.some(d=>d.type==='prediction_dependency')) out.push('A dated prediction condition that can later be checked.');
    if(has(claim,P.absolute)) out.push('A counterexample search strong enough for the claim scope.');
    return unique(out);
  }

  function weakenEvidenceFor(claim,deps){
    const out=['A direct counterexample inside the stated scope.','A better-supported alternative explanation.','A mismatch between the claim wording and the available evidence.'];
    if(deps.some(d=>d.type==='causal_dependency')) out.push('Same outcome occurring without the proposed cause, or the proposed cause occurring without the outcome.');
    if(deps.some(d=>d.type==='comparison_dependency')) out.push('A same-metric comparison showing the claimed advantage disappears or reverses.');
    if(deps.some(d=>d.type==='motive_dependency')) out.push('Evidence that the actor had a different intent, lacked knowledge, or acted under another constraint.');
    if(has(claim,P.selfSealing)) out.push('The speaker refusing to name any possible falsifier weakens the claim structure itself.');
    return unique(out);
  }

  function classify(claim,flags,deps){
    const high=flags.filter(f=>f.severity==='high');
    const evidence=has(claim,P.evidence);
    let primary='coherent';
    const tags=[];
    if(flags.some(f=>f.type==='self_sealing')) primary='self-sealing';
    else if(flags.some(f=>f.type==='internal_contradiction_pressure')) primary='contradicted';
    else if(flags.some(f=>f.type==='motive_overclaim')) primary='motive-overclaim';
    else if(evidence && !high.length && flags.length<=1) primary='evidence-backed';
    else if(deps.length || flags.length) primary='unresolved';
    if(has(claim,P.predicate)) tags.push('coherent-form');
    if(evidence) tags.push('evidence-referenced');
    if(deps.length) tags.push('dependency-loaded');
    for(const f of flags) tags.push(f.type.replace(/_/g,'-'));
    const rationale={ coherent:'The claim has a readable assertion form, but support still depends on supplied evidence.', unresolved:'The claim has open dependencies that should remain visible instead of being treated as settled.', contradicted:'Contradiction pressure was detected. This does not resolve which subclaim is false.', 'evidence-backed':'The claim references evidence and has no high-severity overclaim flag from this pass.', 'self-sealing':'The claim structure protects itself from falsification or disagreement.', 'motive-overclaim':'The claim jumps from event, benefit, or disagreement to intent without separate motive evidence.' }[primary];
    return { primary, tags:unique(tags), rationale };
  }

  function nextQuestion(classification,deps,claim){
    if(classification.primary==='self-sealing') return 'What specific evidence would count against this claim?';
    if(classification.primary==='contradicted') return 'Which exact subclaim is being tested first, and what evidence would separate mistake, scope shift, partial truth, and deception?';
    if(classification.primary==='motive-overclaim') return 'What evidence proves intent rather than mere benefit, pressure, or disagreement?';
    if(deps.some(d=>d.type==='comparison_dependency')) return 'What metric, baseline, and time window make this comparison testable?';
    if(deps.some(d=>d.type==='causal_dependency')) return 'What mechanism and alternative-cause check would support the causal link?';
    if(deps.some(d=>d.type==='definition_dependency')) return 'Which key term needs a stable definition before the claim can be tested?';
    if(!has(claim,P.evidence)) return 'What is the strongest concrete evidence for this claim?';
    return 'What would weaken this claim if discovered?';
  }

  function semanticFor(claim,classification,flags,deps){
    if(!claim) return {a:0,s:0,b:0};
    let a=0.08,s=0.12,b=0.1;
    if(has(claim,P.evidence)){ s+=0.45; b+=0.2; }
    if(has(claim,P.causal) || has(claim,P.comparative)) a+=0.12;
    if(deps.some(d=>d.type==='definition_dependency')) b+=0.12;
    for(const f of flags){ if(f.severity==='high') s-=0.85; else if(f.severity==='medium') s-=0.42; else s-=0.18; }
    if(classification.primary==='evidence-backed') s+=0.25;
    if(classification.primary==='coherent') s+=0.12;
    if(classification.primary==='unresolved') s-=0.18;
    if(classification.primary==='self-sealing'){ s-=0.35; b-=0.1; }
    return { a:clamp(a,-3,3), s:clamp(s,-3,3), b:clamp(b,-3,3) };
  }

  function kernelPacket(report){
    if(!report.extracted_claim) return null;
    const confidence={ 'evidence-backed':0.62, coherent:0.5, unresolved:0.42, 'motive-overclaim':0.34, contradicted:0.28, 'self-sealing':0.22 }[report.classification.primary] ?? 0.4;
    const observations=[];
    for(const f of report.overclaim_flags) observations.push({ text:`${f.type}: ${f.text}`, status:f.pressure||'unresolved', reason:f.repair||'Preserve pressure until evidence is supplied.' });
    for(const d of report.dependencies) observations.push({ text:`${d.type}: ${d.text}`, status:d.pressure||'unresolved', reason:'Dependency from claim-challenge workflow.' });
    const gate_events=[];
    if(report.classification.primary==='self-sealing') gate_events.push({ gate:'G6_non_self_sealing', direction:'negative', strength:'strong', confidence:0.9, evidence:report.extracted_claim, reason:'Claim challenge detected self-sealing structure.', scope:'claim' });
    if(report.classification.primary==='motive-overclaim') gate_events.push({ gate:'G1_counter_consideration', direction:'negative', strength:'weak', confidence:0.65, evidence:report.extracted_claim, reason:'Claim challenge detected motive attribution without separate motive evidence.', scope:'claim' });
    if(report.classification.tags.includes('evidence-referenced')) gate_events.push({ gate:'G5_reality_contact', direction:'positive', strength:'weak', confidence:0.62, evidence:report.extracted_claim, reason:'Claim references an evidence path; verification is still external.', scope:'claim' });
    if(report.classification.primary==='contradicted') gate_events.push({ gate:'G4_contradiction_handling', direction:'positive', strength:'moderate', confidence:0.72, evidence:report.extracted_claim, reason:'Contradiction pressure detected and preserved; not resolved.', scope:'contradiction' });
    return { command_type:'epistemic_kernel_command', created_by:'claim-challenge-v0.1', commands:[{ op:'import_packet', packet:{ packet_type:'epistemic_extraction_packet', packet_version:'claim_challenge_v0_1', source:'claim_challenge_workflow', claims:[{ client_id:'challenged_claim_1', text:report.extracted_claim, subject:'external_speaker', object:'challenged_claim', scope:'claim', confidence, status:report.classification.primary==='evidence-backed'?'active':'unresolved' }], evidence:[], principles:[], dependencies:[], observations, questions:[{ text:report.next_open_question, links:{ client_id:'challenged_claim_1', source:'claim_challenge_v0_1' } }], gate_events, meta:{ does_not_promote_rules:true, contradiction_detection_is_not_resolution:true, preserve_unresolved_pressure:true } } }] };
  }

  function analyze(input,options={}){
    const raw_input=clean(input);
    const extracted_claim=extractClaimText(raw_input);
    const low=lowSignalReason(extracted_claim);
    if(low){ const projection=projectSemanticTriple(0,0,0); return { packet_type:'42ndMind_claim_challenge_report', version:VERSION, created_at:new Date().toISOString(), raw_input, extracted_claim:'', low_signal:true, low_signal_reason:low, dependencies:[], evidence_needed_to_support:[], evidence_that_would_weaken:[], overclaim_flags:[], classification:{ primary:'no-claim', tags:['null-origin'], rationale:low }, next_open_question:'What exact claim is being made?', unresolved_pressure:[], octahedron:{ semantic:{a:0,s:0,b:0}, point:projection.point, debug:projection.debug }, guardrails:{ null_origin_preserved:true, active_surface_equation_preserved:false, contradiction_detection_is_not_resolution:true, rules_promoted_automatically:false, unresolved_pressure_visible:false }, epistemic_kernel_command:null }; }
    const dependencies=dependenciesFor(extracted_claim);
    const overclaim_flags=flagsFor(extracted_claim,dependencies);
    const classification=classify(extracted_claim,overclaim_flags,dependencies);
    const next_open_question=nextQuestion(classification,dependencies,extracted_claim);
    const semantic=semanticFor(extracted_claim,classification,overclaim_flags,dependencies);
    const projection=projectSemanticTriple(semantic.a,semantic.s,semantic.b);
    const unresolved_pressure=[...dependencies.map(d=>({ type:d.type, text:d.text, pressure:d.pressure })), ...overclaim_flags.map(f=>({ type:f.type, text:f.text, pressure:f.pressure, severity:f.severity }))];
    const report={ packet_type:'42ndMind_claim_challenge_report', version:VERSION, created_at:new Date().toISOString(), raw_input, extracted_claim, low_signal:false, dependencies, evidence_needed_to_support:supportEvidenceFor(extracted_claim,dependencies), evidence_that_would_weaken:weakenEvidenceFor(extracted_claim,dependencies), overclaim_flags, classification, next_open_question, unresolved_pressure, octahedron:{ semantic, point:projection.point, debug:projection.debug }, guardrails:{ null_origin_preserved:false, active_surface_equation_preserved:Math.abs((Math.abs(projection.point.x)+Math.abs(projection.point.y)+Math.abs(projection.point.z))-1)<1e-9, contradiction_detection_is_not_resolution:true, rules_promoted_automatically:false, unresolved_pressure_visible:unresolved_pressure.length>0 } };
    report.epistemic_kernel_command = options.includeKernelCommand === false ? null : kernelPacket(report);
    return report;
  }

  function exampleClaims(){ return ['Anyone who disagrees with this only proves they are brainwashed.','He lied on purpose because the outcome helped him.','This index outperforms the S&P 500.','I submitted the form before the deadline. Actually, I submitted it this morning, but the deadline was yesterday.','According to the timestamped receipt, the package was submitted before the posted deadline.']; }
  global.ClaimChallengeV01={ VERSION, analyze, projectSemanticTriple, exampleClaims };
})(typeof window !== 'undefined' ? window : globalThis);
