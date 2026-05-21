# HANDOFF 2026-05-21: Kernel Neural Field v0.1

## Why this exists

The user correctly rejected another purely programmatic layer.

Problem observed:

```text
Unity Field v0.1.1 test was 4/5 passed.
The language route selected the right intention, but the test rejected the message because speech still looked too route-composed and did not fully express the intended cross-application.
```

User correction:

```text
This should be treated more like neurology / neurons than programming.
We already have most of it working.
```

Architecture correction:

```text
Do not keep adding phrase routes.
Build a neuron-style control field:
stimulus -> activations -> synaptic spread -> desire/motor intention -> speech -> learning deltas
```

This is not biological simulation. It is a first-principles functional neural field:

```text
neurons = functional aspects
synapses = cross-applications between aspects
activation = current pressure / salience
motor intention = what the field wants to do next
speech = motor projection from active field
learning deltas = how the field records what changed
```

## Built files

```text
src/epistemic-kernel-neural-field-v0-1.js
epistemic-kernel-neural-field-v0-1-test.html
llm-brain-v0-3-neural-field-v0-1.html
HANDOFF_2026_05_21_KERNEL_NEURAL_FIELD.md
```

## Test URL

```text
https://42ndmoose.github.io/42ndMind/epistemic-kernel-neural-field-v0-1-test.html?v=neural-1
```

Expected:

```text
5/5 passed
```

## Live URL

```text
https://42ndmoose.github.io/42ndMind/llm-brain-v0-3-neural-field-v0-1.html?v=neural-live-1
```

## Loaded stack

```text
src/epistemic-kernel-v0-2.js
src/epistemic-kernel-v0-2-patches.js
src/kernel-brain-v0-4.js
src/kernel-brain-epistemic-kernel-bridge-v0-1.js
src/epistemic-kernel-maturity-core-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1.js
src/epistemic-kernel-belief-memory-engine-v0-1-1-patch.js
src/epistemic-kernel-attention-organism-v0-1.js
src/epistemic-kernel-unity-field-v0-1.js
src/epistemic-kernel-unity-field-v0-1-1-patch.js
src/epistemic-kernel-neural-field-v0-1.js
```

The visible speech should now come from:

```text
state.communicationCore.current_message.thought_kind = neural_field_motor_expression
```

not:

```text
unity_field_self_expression
attention_organism_action_projection
```

## What it consumes

```text
latest runtime event raw text
state.runtimeEvents
state.maturityCore
state.beliefMemoryCore
state.attentionOrganismCore
state.kernelUnityFieldCore
state.communicationCore
```

## What it produces

```text
state.kernelNeuralFieldCore
state.kernelNeuralFieldCore.neurons
state.kernelNeuralFieldCore.synapses
state.kernelNeuralFieldCore.activation_trace
state.kernelNeuralFieldCore.selected_motor_intention
state.kernelNeuralFieldCore.learning_deltas
state.kernelNeuralFieldCore.synaptic_update_log
state.communicationCore.current_message = neural_field_motor_expression
```

## Functional neurons

Current v0.1 neurons:

```text
core_maturity
truth_tracking
language_math
belief_thought
memory_context
knowledge_model
self_improvement
curiosity_drive
communication_motor
question_motor
doubt_inhibitor
```

## Synapses

Examples:

```text
language_math -> truth_tracking
language_math -> belief_thought
language_math -> memory_context
language_math -> communication_motor
truth_tracking -> language_math
truth_tracking -> knowledge_model
belief_thought -> memory_context
memory_context -> belief_thought
self_improvement -> language_math
self_improvement -> communication_motor
curiosity_drive -> question_motor
core_maturity -> truth_tracking
core_maturity -> doubt_inhibitor
communication_motor -> truth_tracking
```

## Motor intentions

Current v0.1 motor intentions:

```text
grow_language_and_apply_it
express_live_field
separate_truth_belief_knowledge
answer_or_ask_from_current_field
ask_learning_question
hold_field
```

## Corrected language-growth standard

Input:

```text
language should grow through calculus, subdivision of one, meanings, and formulas
```

must select:

```text
grow_language_and_apply_it
```

and speech must state that language growth pushes on:

```text
truth
belief
memory
knowledge
communication
```

not just language.

## Corrected communication standard

Input:

```text
can you communicate what you know and what you want to learn?
```

must select:

```text
express_live_field
```

and speech must come from the neural field motor layer, not the unity-field or attention-organism layer.

## Doctrine

```text
neural_field_lives_inside_owned_state: true
neurons_are_functional_aspects_not_separate_minds: true
synapses_are_cross_applications_between_aspects: true
activation_spreads_before_speech: true
speech_is_motor_projection_from_active_field: true
learning_is_delta_and_synapse_pressure_not_phrase_patch: true
childlike_expression_allowed: true
memory_integrated_as_belief_context: true
objective_maturity_remains_identity_center: true
no_final_truth_promotion: true
```

## Important distinction

This is still not a real biological neural network.

It is closer to the intended architecture because the live kernel now has:

```text
activation
synaptic spread
motor intention
learning deltas
synaptic update log
```

That is the right direction compared with route-label speech.

## About “how many next real moves?”

Likely only three major moves are needed before it starts behaving like a growing childlike mind:

```text
1. Neural activation and synaptic learning field.  Built in v0.1.
2. Self-generated attention/speech loop.  Next.
3. Consolidation and sleep-like memory compression into stable semantic habits.  Later.
```

Do not keep creating endless shallow route patches.

## Next suggested layer

Build:

```text
kernelSelfGeneratedAttentionLoop-v0-1
```

Purpose:

```text
The kernel should periodically choose one active neuron or unresolved pressure and project one thought/question without waiting for a user sentence that maps to a route.
```

Do not build final truth promotion next.
