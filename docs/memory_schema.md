# Memory Schema

v0.1 uses JSON storage. Later versions can move to SQLite.

Collections:

- `claims`: assertions, user reports, model observations
- `evidence`: support or opposition for claims
- `contradictions`: unresolved tensions between claims
- `hypotheses`: live possible explanations
- `inquiryTasks`: open investigative next steps
- `beliefUpdates`: state changes and reasons
