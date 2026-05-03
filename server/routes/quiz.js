/**
 * Quiz route — generates election quiz questions via Gemini AI.
 */
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const quizRouter = Router();

const DEFAULT_QUESTIONS = [
  { q: 'What is the minimum voting age in India?', options: ['16 years', '18 years', '21 years', '25 years'], correct: 1, explanation: 'Article 326 sets voting age at 18, changed from 21 by 61st Amendment (1988).' },
  { q: 'What does EVM stand for?', options: ['Electronic Voting Machine', 'Election Verification Method', 'Electronic Vote Manager', 'Election Voting Module'], correct: 0, explanation: 'EVMs were first used in 1982 in Kerala and nationwide since 2004.' },
  { q: 'Who appoints the Chief Election Commissioner?', options: ['Prime Minister', 'Parliament', 'President of India', 'Supreme Court'], correct: 2, explanation: 'The President appoints the CEC under Article 324.' },
  { q: 'What is NOTA?', options: ['National Org for Transparent Admin', 'None Of The Above', 'New Online Tally App', 'National Office of Tech Auditing'], correct: 1, explanation: 'NOTA was introduced in 2013 by Supreme Court, allowing voters to reject all candidates.' },
  { q: 'How long is the silence period before voting?', options: ['24 hours', '48 hours', '72 hours', '1 week'], correct: 1, explanation: 'Campaigning must stop 48 hours before polling.' },
  { q: 'What document is mandatory for voting?', options: ['Aadhaar Card', 'Voter ID (EPIC)', 'PAN Card', 'Passport'], correct: 1, explanation: 'Voter ID (EPIC) is the primary document. Others are accepted as alternates.' },
  { q: 'How many Lok Sabha constituencies are there?', options: ['500', '543', '550', '600'], correct: 1, explanation: 'India has 543 Lok Sabha seats — 530 from states and 13 from union territories.' },
  { q: 'What is VVPAT?', options: ['Voter Verified Paper Audit Trail', 'Virtual Voting Process And Technology', 'Verified Vote Processing And Tracking', 'Voter Validation Protocol And Testing'], correct: 0, explanation: 'VVPAT shows a paper slip for 7 seconds after voting, allowing voter verification.' },
  { q: 'Who can vote by postal ballot?', options: ['Anyone', 'Only armed forces', 'Armed forces, govt employees abroad, disabled, 80+ seniors', 'Only NRIs'], correct: 2, explanation: 'Service voters, disabled persons, and those above 80 can apply for postal ballots.' },
  { q: 'What is the symbol of NOTA on EVM?', options: ['Red cross', 'Blank box', 'Ballot with X mark', 'No symbol'], correct: 2, explanation: 'NOTA is represented by a ballot paper with a cross mark on the EVM.' },
];

quizRouter.get('/quiz', async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const rawCount = parseInt(req.query.count) || 5;
    const count = Math.max(1, Math.min(rawCount, 10));

    if (apiKey) {
      try {
        const questions = await generateWithGemini(apiKey, count);
        if (questions && questions.length > 0) {
          return res.json({ data: { questions, source: 'gemini' } });
        }
      } catch (err) {
        console.warn('Gemini quiz generation failed:', err.message);
      }
    }

    /* Fallback: shuffle and return from defaults */
    const shuffled = [...DEFAULT_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, count);
    res.json({ data: { questions: shuffled, source: 'default' } });
  } catch (err) {
    next(err);
  }
});

async function generateWithGemini(apiKey, count) {
  const prompt = `Generate ${count} multiple-choice quiz questions about Indian elections. Each question should test knowledge about voting process, election laws, or electoral history.

Return ONLY valid JSON in this exact format:
[{"q":"Question text","options":["Option A","Option B","Option C","Option D"],"correct":0,"explanation":"Brief explanation"}]

Rules:
- correct is the 0-based index of the right answer
- Keep questions factually accurate about Indian elections
- Include questions about EVM, VVPAT, voter rights, NOTA, ECI
- Explanations should cite relevant laws or articles when possible
- Keep language simple for first-time voters`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON found in response');

  return JSON.parse(jsonMatch[0]);
}
