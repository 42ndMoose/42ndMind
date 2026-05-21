/* 42ndMind Neural Field
 * Activation and motor-intention pressure. No speech generation here.
 */
(function (global) {
  'use strict';

  const NEURONS = ['core_maturity', 'truth_tracking', 'language_math', 'belief_memory', 'knowledge_model', 'self_improvement', 'curiosity_drive', 'communication_motor', 'doubt_inhibitor'];
  const SYNAPSES = [
    ['language_math', 'truth_tracking', 0.72],
    ['truth_tracking', 'language_math', 0.70],
    ['belief_memory', 'truth_tracking', 0.50],
    ['core_maturity', 'truth_tracking', 0.80],
    ['core_maturity', 'doubt_inhibitor', 0.68],
    ['curiosity_drive', 'communication_motor', 0.45],
    ['self_improvement', 'language_math', 0.64]
  ];

  function now() { return global.FortySecondMindBrainState.now(); }
  function clamp(n) { return global.FortySecondMindBrainState.clamp01(n); }

  function ensure(state) {
    if (!state.neural) state.neural = { neurons: {}, synapses: SYNAPSES, selected_motor_intention: null, activation_trace: [], updated_at: now() };
    NEURONS.forEach(n => { if (state.neural.neurons[n] == null) state.neural.neurons[n] = 0; });
    return state.neural;
  }

  function activate(state, pressure) {
    const neural = ensure(state);
    Object.keys(pressure || {}).forEach(k => { if (neural.neurons[k] != null) neural.neurons[k] = clamp(neural.neurons[k] + Number(pressure[k] || 0)); });
    SYNAPSES.forEach(([from, to, weight]) => { neural.neurons[to] = clamp(neural.neurons[to] + neural.neurons[from] * weight * 0.12); });
    const top = Object.entries(neural.neurons).sort((a, b) => b[1] - a[1])[0];
    neural.selected_motor_intention = { kind: top && top[0] === 'communication_motor' ? 'communication_pressure' : 'hold_or_update_state', top_neuron: top && top[0], activation: top && Number(top[1].toFixed(3)), at: now() };
    neural.activation_trace.unshift({ at: now(), pressure, top_neuron: neural.selected_motor_intention.top_neuron });
    neural.activation_trace = neural.activation_trace.slice(0, 80);
    neural.updated_at = now();
    return neural;
  }

  global.FortySecondMindNeuralField = Object.freeze({ NEURONS, SYNAPSES, ensure, activate });
})(typeof window !== 'undefined' ? window : globalThis);
