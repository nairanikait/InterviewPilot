/**
 * AI Service — wraps LLM API calls using standard OpenAI-compatible REST API.
 *
 * This allows seamless replacement of API providers (like OpenRouter, OpenAI, Groq).
 * Requires LLM_API_KEY and allows overriding LLM_MODEL and LLM_BASE_URL.
 *
 * Two operations are exposed:
 *   generateQuestions(resumeText, count?)  → string[]
 *   evaluateAnswer(question, answer)       → { score, feedback }
 */

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'google/gemini-2.5-flash';
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Low-level helper — sends a prompt and returns the text response.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
const callLLM = async (prompt) => {
  if (!LLM_API_KEY) {
    throw new Error('LLM_API_KEY is not configured.');
  }

  const response = await fetch(LLM_BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LLM_API_KEY}`
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from LLM API.');
  return text.trim();
};

/**
 * Normalizes varied AI outputs (Array<Question>, Array<String>, or multiline String)
 * into a consistent array of { id, question } objects.
 */
const normalizeQuestions = (input, count) => {
  let strings = [];
  if (typeof input === 'string') {
    strings = input.split('\n');
  } else if (Array.isArray(input)) {
    input.forEach((item) => {
      if (typeof item === 'string') {
        strings.push(...item.split('\n'));
      } else if (item && typeof item === 'object' && item.question) {
        strings.push(...String(item.question).split('\n'));
      }
    });
  }

  let parsed = [];
  strings.forEach((s) => {
    // split numbered lists and trim
    const cleaned = s.replace(/^[\d\-\*\.\s"]+/, '').replace(/[",]+$/, '').trim();
    if (cleaned.length > 0) {
      parsed.push(cleaned);
    }
  });

  return parsed.slice(0, count).map((q, i) => ({ id: i + 1, question: q }));
};

/**
 * Generates interview questions based on resume text.
 * @param {string} resumeText  - Extracted resume plain text
 * @param {number} count       - Number of questions (default 5)
 * @returns {Promise<string[]>}
 */
const generateQuestions = async (resumeText, count = 5) => {
  const prompt = `You are an expert technical interviewer.
Based on the following resume, generate exactly ${count} thoughtful, specific interview questions that probe the candidate's experience and skills.

Resume:
---
${resumeText.slice(0, 4000)}
---

Rules:
- Return ONLY a JSON array of question strings. No extra text, no markdown.
- Example format: ["Question 1?", "Question 2?", ...]
- Make questions technical and relevant to the resume content.`;

  const raw = await callLLM(prompt);

  // Strip possible markdown code fences
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let parsedRaw;
  try {
    parsedRaw = JSON.parse(cleaned);
  } catch {
    parsedRaw = cleaned;
  }

  const normalized = normalizeQuestions(parsedRaw, count);
  const questions = normalized.map((n) => n.question);

  if (questions.length === 0) {
    throw new Error('Failed to parse questions from AI response.');
  }

  return questions;
};

/**
 * Evaluates a candidate's answer to an interview question.
 * @param {string} question
 * @param {string} answer
 * @returns {Promise<{ score: number, feedback: string }>}
 */
const evaluateAnswer = async (question, answer) => {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: ${question}

Candidate's Answer: ${answer || '(No answer provided)'}

Evaluate the answer strictly and fairly. Return ONLY a JSON object with exactly two fields:
- "score": integer from 0 to 10 (10 = perfect, 0 = completely wrong/no answer)
- "feedback": 2-3 sentence constructive feedback string

Example: {"score": 7, "feedback": "Good explanation of X but missed Y. Consider elaborating on Z."}

Return only the JSON object, no markdown.`;

  const raw = await callLLM(prompt);
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse evaluation from AI response.');
  }

  const score = Math.min(10, Math.max(0, Math.round(Number(result.score))));
  const feedback = String(result.feedback || '').trim();

  return { score, feedback };
};

module.exports = { generateQuestions, evaluateAnswer };
