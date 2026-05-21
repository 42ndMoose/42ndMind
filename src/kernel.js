/* 42ndMind Clean Kernel
 * One brain. Separate organs. Communication motor owns visible output.
 */
(function (global) {
  'use strict';

  function now() { return global.FortySecondMindBrainState.now(); }

  function createKernel(seed) {
    const state = global.FortySecondMindBrainState.createBrainState(seed || {});
    global.FortySecondMindMaturityCore.ensure(state);
    global.FortySecondMindLanguageField.ensure(state);
    global.FortySecondMindNeuralField.ensure(state);
    global.FortySecondMindBeliefMemoryField.ensure(state);
    global.FortySecondMindTruthField.ensure(state);
    global.FortySecondMindCommunicationMotor.ensure(state);
    global.FortySecondMindAutoplasticity.ensure(state);
    return {
      state,
      ingest(text, meta) {
        const event = { id: 'event_' + (state.events.length + 1), text: String(text || ''), meta: meta || {}, at: now() };
        state.events.push(event);
        global.FortySecondMindMaturityCore.ensure(state);
        global.FortySecondMindLanguageField.ingest(state, event);
        global.FortySecondMindNeuralField.activate(state, pressureFromEvent(event));
        global.FortySecondMindBeliefMemoryField.ingest(state, event);
        global.FortySecondMindTruthField.ingest(state, event);
        global.FortySecondMindAutoplasticity.observe(state);
        const output = global.FortySecondMindCommunicationMotor.select(state);
        state.updated_at = now();
        return { event, output, state };
      },
      snapshot() { return global.FortySecondMindBrainState.clone(state); }
    };
  }

  function pressureFromEvent(event) {
    const text = String(event && event.text || '').toLowerCase();
    return {
      language_math: /\b(language|meaning|truth|belief|memory|communication|formula|unit)\b/.test(text) ? 0.25 : 0.05,
      truth_tracking: /\b(true|truth|fact|evidence|verify|false|because)\b/.test(text) ? 0.25 : 0.05,
      communication_motor: /\?\s*$|\b(answer|say|ask|communicate)\b/.test(text) ? 0.25 : 0.02,
      curiosity_drive: /\?\s*$/.test(text) ? 0.18 : 0.03,
      core_maturity: 0.1,
      doubt_inhibitor: 0.08
    };
  }

  global.FortySecondMindKernel = Object.freeze({ createKernel, pressureFromEvent });
})(typeof window !== 'undefined' ? window : globalThis);
