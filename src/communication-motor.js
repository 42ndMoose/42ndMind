/* 42ndMind Communication Motor
 * The only organ allowed to project visible speech.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }
  function arr(v) { return global.FortySecondMindBrainState.arr(v); }

  function ensure(state) {
    if (!state.communication) state.communication = { current_output: null, output_history: [], selected_action: null, updated_at: now() };
    return state.communication;
  }

  function select(state) {
    const comm = ensure(state);
    const event = state.events[state.events.length - 1];
    const neural = state.neural || {};
    const truth = state.truth || {};
    const focus = state.semanticFocus || {};
    let output = null;
    let action = 'say_nothing';

    if (arr(focus.admitted).length || arr(focus.rejected).length) {
      action = 'report_semantic_growth_state';
      output = 'Semantic growth updated owned state: admitted ' + arr(focus.admitted_terms).join(', ') + '; rejected ' + arr(focus.rejected_terms).join(', ') + '.';
    } else if (arr(focus.activated).length) {
      action = 'report_semantic_reactivation_state';
      output = 'Known semantic meaning reactivated: ' + arr(focus.activated_terms).join(', ') + '.';
    } else if (event && /\?\s*$/.test(event.text || '')) {
      action = 'answer_or_admit_unknown';
      output = 'I register a question. I should answer from owned state or admit what is still unknown.';
    } else if (truth.pressure && truth.pressure.verification_need > 0) {
      action = 'hold_truth_candidate';
      output = 'I can hold that as a truth candidate, but not final truth.';
    } else if (neural.selected_motor_intention && neural.selected_motor_intention.kind === 'communication_pressure') {
      action = 'report_state_pressure';
      output = 'I can report the current state pressure without pretending certainty.';
    }

    comm.selected_action = { action, source: 'communication_motor', at: now() };
    comm.current_output = output ? { text: output, at: now(), source: 'communication_motor', action } : null;
    if (comm.current_output) comm.output_history.unshift(comm.current_output);
    comm.output_history = comm.output_history.slice(0, 80);
    comm.updated_at = now();
    return comm.current_output;
  }

  global.FortySecondMindCommunicationMotor = Object.freeze({ ensure, select });
})(typeof window !== 'undefined' ? window : globalThis);
