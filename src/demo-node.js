const { EpistemicKernel } = require('./epistemic-kernel.js');

const kernel = new EpistemicKernel();

const c1 = kernel.addClaim({
  text: 'I submitted the form before the deadline.',
  subject: 'user',
  object: 'form',
  confidence: 0.65,
});

const c2 = kernel.addClaim({
  text: 'Actually, I submitted it this morning, but the deadline was yesterday.',
  subject: 'user',
  object: 'form',
  confidence: 0.7,
});

kernel.addEvidence({
  text: 'The timestamp shows the form was submitted after the posted deadline.',
  relation: 'attacks',
  claimId: c1.id,
  strength: 'strong',
  confidence: 0.9,
});

console.log(JSON.stringify({
  octahedron: kernel.snapshot().octahedron,
  semantic: kernel.snapshot().semantic,
  contradictions: kernel.snapshot().contradictions,
  answer_about_first_claim: kernel.answerAboutClaim(c1.id),
  open_questions: kernel.snapshot().questions.filter(q => q.status === 'open').map(q => q.text),
}, null, 2));
