(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory();
  else root.FortySecondMindMathLanguageCore=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function norm(rows){
    const list = rows.map(r => ({axis:r.axis, weight:Number(r.weight)||0})).filter(r => r.axis && r.weight !== 0);
    const total = list.reduce((s,r)=>s+Math.abs(r.weight),0) || 1;
    let used = 0;
    return list.map((r,i)=>{
      const w = i === list.length-1 ? Math.max(0, 1-used) : Math.abs(r.weight)/total;
      used += w;
      return {axis:r.axis, weight:Number(w.toFixed(6))};
    });
  }

  const concepts = {
    discernment: {
      aliases:['discernment','discern','judgment filter','distinguish'],
      field:norm([
        {axis:'separate_signal_from_noise',weight:4},
        {axis:'hold_contrast_without_collapse',weight:3},
        {axis:'rank_by_reality_contact',weight:3},
        {axis:'delay_promotion_until_stable',weight:2}
      ]),
      form:'D = Σ(|contrast| + |reality_contact| + |stability_gate|) = 1',
      plain:'Discernment is the ability to separate signal from noise without collapsing contrast too early.'
    },
    knowledge: {
      aliases:['knowledge','know','known'],
      field:norm([
        {axis:'retained_structure',weight:3},
        {axis:'tested_recurrence',weight:3},
        {axis:'accessible_memory',weight:2},
        {axis:'external_constraint',weight:2}
      ]),
      form:'K = Σ(|tested_structure| + |memory| + |constraint|) = 1',
      plain:'Knowledge is retained tested structure constrained by recurrence and reality contact.'
    },
    wisdom: {
      aliases:['wisdom','wise'],
      field:norm([
        {axis:'timed_application',weight:3},
        {axis:'integrated_consequence',weight:3},
        {axis:'contextual_fit',weight:2},
        {axis:'non_overclaim',weight:2}
      ]),
      form:'W = Σ(|timing| + |consequence| + |context_fit| + |non_overclaim|) = 1',
      plain:'Wisdom is integrated application under context and consequence. It is not the same as peak judgment.'
    },
    empathy: {
      aliases:['empathy','empathetic'],
      field:norm([
        {axis:'model_other_state',weight:3},
        {axis:'preserve_other_in_view',weight:3},
        {axis:'injury_awareness',weight:2},
        {axis:'non_self_centering',weight:2}
      ]),
      form:'E = Σ(|other_state| + |injury_awareness| + |non_self_centering|) = 1',
      plain:'Empathy is keeping another subject state inside the model without replacing truth with emotion.'
    },
    practicality: {
      aliases:['practicality','practical','utility'],
      field:norm([
        {axis:'action_constraint',weight:3},
        {axis:'resource_fit',weight:2},
        {axis:'implementation_path',weight:3},
        {axis:'failure_cost',weight:2}
      ]),
      form:'P = Σ(|action_constraint| + |resource_fit| + |implementation_path| + |failure_cost|) = 1',
      plain:'Practicality is action under constraints, resources, implementation path, and failure cost.'
    },
    peak: {
      aliases:['peak','best judgement','best judgment','objective maturity','philosophical maturity'],
      field:norm([
        {axis:'integrated_empathy',weight:2},
        {axis:'integrated_practicality',weight:2},
        {axis:'integrated_knowledge',weight:2},
        {axis:'integrated_wisdom',weight:2},
        {axis:'max_epistemic_stability',weight:4}
      ]),
      form:'Peak = E⊕P⊕K⊕W under y=1, with no passive lateral destabilization',
      plain:'Peak is best judgment: integrated empathy, practicality, knowledge, and wisdom under maximum epistemic stability.'
    },
    null: {
      aliases:['null','origin','pre philosophical','pre-philosophical'],
      field:norm([
        {axis:'no_active_worldview',weight:4},
        {axis:'uncommitted_latent_capacity',weight:3},
        {axis:'not_collapse',weight:3}
      ]),
      form:'Null = (0,0,0), absence of active worldview, not collapse',
      plain:'Null is the origin: no active worldview yet. It is not collapse and not peak.'
    },
    collapse: {
      aliases:['collapse','epistemic collapse'],
      field:norm([
        {axis:'negative_stability',weight:4},
        {axis:'distortion_locked',weight:3},
        {axis:'false_closure',weight:3}
      ]),
      form:'Collapse = (0,-1,0), maximal active negative stability',
      plain:'Collapse is maximal active negative stability: distortion becomes locked as if it were certainty.'
    }
  };

  function findConcept(text){
    const q = String(text || '').toLowerCase();
    let best = null;
    Object.keys(concepts).forEach(key => {
      const c = concepts[key];
      c.aliases.forEach(alias => {
        const a = String(alias).toLowerCase();
        if(q.includes(a) && (!best || a.length > best.alias.length)) best = {key, alias:a, concept:c};
      });
    });
    return best;
  }

  return Object.freeze({VERSION:'0.1.0',concepts,findConcept,norm});
});
