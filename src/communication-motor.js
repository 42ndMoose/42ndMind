/* 42ndMind Communication Motor
 * The only organ allowed to project visible speech.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }

  function ensure(state) {
    if (!state.communication) state.communication = { current_output: null, output_history: [], updated_at: now() };
    return state.communication;
  }

  function select(state) {
    const comm = ensure(state);
    const event = state.events[state.events.length - 1];
    const neural = state.neural || {};
    const truth = state.truth || {};
    let output = null;
    if (event && /\?\s*$/.test(event.text || '')) output = 'I register a question. I should answer from owned state or admit what is still unknown.';
    else if (truth.pressure && truth.pressure.verification_need > 0) output = 'I can hold that as a truth candidate, but not final truth.';
    else if (neural.selected_motor_intention && neural.selected_motor_intention.kind === 'communication_pressure') output = 'I can report the current state pressure without pretending certainty.';
    comm.current_output = output ? { text: output, at: now(), source: 'communication_motor' } : null;
    if (comm.current_output) comm.output_history.unshift(comm.current_output);
    comm.output_history = comm.output_history.slice(0, 80);
    comm.updated_at = now();
    return comm.current_output;
  }

  global.FortySecondMindCommunicationMotor = Object.freeze({ ensure, select });
})(typeof window !== 'undefined' ? window : globalThis);
