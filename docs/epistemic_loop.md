
# Epistemic Loop

The guiding rule:

```text
Unresolved tension should create investigative pressure.
```

In v0.3, investigative pressure appears as:

- unresolved tension records
- contradiction records
- live hypotheses
- inquiry tasks
- evidence intake
- belief updates
- confidence changes

This version still does not perform external investigation. It creates and updates the state that tells the system what to investigate next.


## v0.4 change

The system can now treat evidence as structurally relevant to contradictions, not only as isolated support for a single claim.


## v0.5 change

The system now separates claim confidence from explanation confidence. This is the first step toward motive/context modeling.


## v0.6 change

The system now creates motive/context hypotheses for contradictions. This is the first explicit step toward modeling deception, correction, memory failure, and wording shifts as separate possibilities.


## v0.7 change

The system now moves from passive memory to active planning. It can generate the next investigation step based on unresolved motive/context uncertainty.


## v0.8 change

The system now acts on investigation plans by creating a concrete next question. It can store the answer for later classification.


## v0.9 change

The system now turns an investigation answer into state revision. This closes the loop:

```text
plan → action → answer → classification → belief/motive update
```


## v1.0 change

The system can now turn runtime behavior into training traces. This creates a bridge from external epistemic structure to future model fine-tuning.


## v1.1 change

The system now creates a training-ready alignment dataset, not just raw trace records.


## v1.2 change

The system now exports not only the desired trajectory, but also known failure modes as rejected examples.


## v1.3 change

The system now supports a practical handoff from epistemic runtime traces to an alignment training repo.


## v1.4 change

The system can now run a batch of built-in scenarios and produce combined SFT/preference datasets.


## v1.5 change

The system can now run external scenario files through the full epistemic loop, then export combined SFT and preference datasets.


## v1.6 change

The system now closes or supersedes inquiry tasks after an action answer resolves the relevant contradiction.


## v1.7 change

The system can now judge whether a completed scenario is clean enough to export as training material.


## v1.8 change

The system now protects dataset quality by combining only scenarios that pass both dataset validation and epistemic quality audit.
