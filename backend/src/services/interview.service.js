const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');
const { generateQuestions, evaluateAnswer } = require('./ai/llm.service');

/**
 * Starts a new interview session for the given user and resume.
 * Generates AI questions from the resume text.
 * @param {string} userId
 * @param {string} resumeId
 * @param {number} [questionCount=5]
 * @returns {Promise<InterviewSession>}
 */
const startSession = async (userId, resumeId, questionCount = 5) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw Object.assign(new Error('Resume not found or does not belong to this user.'), { statusCode: 404 });
  }

  const questionTexts = await generateQuestions(resume.extractedText, questionCount);

  const session = await InterviewSession.create({
    userId,
    resumeId,
    status: 'in_progress',
    questions: questionTexts.map((q) => ({ question: q })),
  });

  return session;
};

/**
 * Evaluates all provided answers for a session.
 * Answers array must align with the session's questions by index.
 * @param {string} sessionId
 * @param {string} userId
 * @param {Array<{ questionIndex: number, answer: string }>} answers
 * @returns {Promise<InterviewSession>}
 */
const evaluateSession = async (sessionId, userId, answers) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw Object.assign(new Error('Session not found or does not belong to this user.'), { statusCode: 404 });
  }
  if (session.status === 'completed') {
    throw Object.assign(new Error('This session has already been evaluated.'), { statusCode: 400 });
  }

  // Evaluate each submitted answer in parallel
  const evalPromises = answers.map(async ({ questionIndex, answer }) => {
    const qObj = session.questions[questionIndex];
    if (!qObj) return; // skip out-of-bounds indices

    const { score, feedback } = await evaluateAnswer(qObj.question, answer);
    session.questions[questionIndex].answer = answer;
    session.questions[questionIndex].score = score;
    session.questions[questionIndex].feedback = feedback;
  });

  await Promise.all(evalPromises);

  // Calculate overall score (average of evaluated questions)
  const evaluated = session.questions.filter((q) => q.score !== null);
  if (evaluated.length > 0) {
    const total = evaluated.reduce((sum, q) => sum + q.score, 0);
    session.overallScore = Math.round((total / evaluated.length) * 10) / 10;
  }

  session.overallFeedback = buildOverallFeedback(session.overallScore);
  session.status = 'completed';

  await session.save();
  return session;
};

/**
 * Returns a simple textual summary based on score.
 */
const buildOverallFeedback = (score) => {
  if (score === null) return 'Evaluation incomplete.';
  if (score >= 9) return 'Outstanding performance! You demonstrated deep expertise across all areas.';
  if (score >= 7) return 'Strong performance. A few areas have room for improvement.';
  if (score >= 5) return 'Decent performance. Focus on strengthening weaker areas before your interview.';
  return 'Needs significant improvement. Review the feedback for each question carefully.';
};

module.exports = { startSession, evaluateSession };
