import { query } from '../config/database';
import { Assessment, AssessmentQuestion } from '../types';
import { AppError } from '../middleware/error.middleware';

// Sample questions for assessments (in production, these would come from a database)
const sampleQuestions: Record<string, AssessmentQuestion[]> = {
  'Web Development': [
    { id: 1, questionText: 'What is the purpose of the DOCTYPE declaration in HTML?', options: [{ id: 'a', text: 'To define the document type and HTML version' }, { id: 'b', text: 'To include CSS styles' }, { id: 'c', text: 'To add JavaScript' }, { id: 'd', text: 'To create links' }], difficulty: 'easy', topic: 'HTML Basics' },
    { id: 2, questionText: 'Which CSS property is used to change the background color?', options: [{ id: 'a', text: 'color' }, { id: 'b', text: 'bgcolor' }, { id: 'c', text: 'background-color' }, { id: 'd', text: 'background' }], difficulty: 'easy', topic: 'CSS Basics' },
    { id: 3, questionText: 'What is a closure in JavaScript?', options: [{ id: 'a', text: 'A way to close browser windows' }, { id: 'b', text: 'A function that has access to its outer scope variables' }, { id: 'c', text: 'A method to end loops' }, { id: 'd', text: 'A type of error handling' }], difficulty: 'medium', topic: 'JavaScript Fundamentals' },
    { id: 4, questionText: 'What does the useEffect hook do in React?', options: [{ id: 'a', text: 'Manages component state' }, { id: 'b', text: 'Performs side effects in function components' }, { id: 'c', text: 'Creates new components' }, { id: 'd', text: 'Handles form submissions' }], difficulty: 'medium', topic: 'React' },
    { id: 5, questionText: 'What is the event loop in Node.js?', options: [{ id: 'a', text: 'A loop that handles DOM events' }, { id: 'b', text: 'A mechanism that handles async operations' }, { id: 'c', text: 'A for loop variant' }, { id: 'd', text: 'A testing framework' }], difficulty: 'hard', topic: 'Node.js' },
  ],
};

const correctAnswers: Record<number, string> = {
  1: 'a', 2: 'c', 3: 'b', 4: 'b', 5: 'b',
};

export class AssessmentService {
  private activeAssessments: Map<string, { questions: AssessmentQuestion[]; answers: Record<number, { answerId: string; timeSpent: number }> }> = new Map();

  async startAssessment(userId: number, subjectId: number, subjectName: string): Promise<{ assessmentId: number; totalQuestions: number; estimatedMinutes: number; firstQuestion: AssessmentQuestion }> {
    const questions = sampleQuestions[subjectName] || sampleQuestions['Web Development'];
    
    // Create assessment record
    const result = await query(
      `INSERT INTO user_skill_assessments 
       (user_id, subject_id, questions_answered, correct_answers, time_spent_seconds, skill_scores)
       VALUES ($1, $2, 0, 0, 0, '{}')
       RETURNING id`,
      [userId, subjectId]
    );

    const assessmentId = result.rows[0].id;
    this.activeAssessments.set(`${userId}-${assessmentId}`, { questions, answers: {} });

    return {
      assessmentId,
      totalQuestions: questions.length,
      estimatedMinutes: questions.length * 2,
      firstQuestion: questions[0],
    };
  }

  async submitAnswer(userId: number, assessmentId: number, questionId: number, answerId: string, timeSpentSeconds: number): Promise<{ isCorrect: boolean; nextQuestion?: AssessmentQuestion; progress: { answeredQuestions: number; totalQuestions: number; percentComplete: number } }> {
    const key = `${userId}-${assessmentId}`;
    const session = this.activeAssessments.get(key);
    
    if (!session) {
      throw new AppError('Assessment session not found', 404);
    }

    session.answers[questionId] = { answerId, timeSpent: timeSpentSeconds };
    const isCorrect = correctAnswers[questionId] === answerId;
    
    const answeredQuestions = Object.keys(session.answers).length;
    const totalQuestions = session.questions.length;
    const nextQuestion = session.questions[answeredQuestions];

    return {
      isCorrect,
      nextQuestion,
      progress: {
        answeredQuestions,
        totalQuestions,
        percentComplete: Math.round((answeredQuestions / totalQuestions) * 100),
      },
    };
  }

  async completeAssessment(userId: number, assessmentId: number): Promise<{ assessmentId: number; skillScores: Record<string, number>; overallScore: number; strengths: string[]; weaknesses: string[]; recommendedRoadmap: { focus: string[]; estimatedWeeks: number } }> {
    const key = `${userId}-${assessmentId}`;
    const session = this.activeAssessments.get(key);
    
    if (!session) {
      throw new AppError('Assessment session not found', 404);
    }

    // Calculate scores by topic
    const topicScores: Record<string, { correct: number; total: number }> = {};
    let totalCorrect = 0;
    let totalTimeSpent = 0;

    for (const question of session.questions) {
      const answer = session.answers[question.id];
      if (!topicScores[question.topic]) {
        topicScores[question.topic] = { correct: 0, total: 0 };
      }
      topicScores[question.topic].total++;
      
      if (answer && correctAnswers[question.id] === answer.answerId) {
        topicScores[question.topic].correct++;
        totalCorrect++;
      }
      if (answer) {
        totalTimeSpent += answer.timeSpent;
      }
    }

    const skillScores: Record<string, number> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const [topic, scores] of Object.entries(topicScores)) {
      const score = Math.round((scores.correct / scores.total) * 100);
      skillScores[topic] = score;
      if (score >= 70) strengths.push(topic);
      else weaknesses.push(topic);
    }

    const overallScore = Math.round((totalCorrect / session.questions.length) * 100);

    // Update database
    await query(
      `UPDATE user_skill_assessments 
       SET questions_answered = $1, correct_answers = $2, time_spent_seconds = $3, 
           skill_scores = $4, completed_at = NOW()
       WHERE id = $5 AND user_id = $6`,
      [session.questions.length, totalCorrect, totalTimeSpent, JSON.stringify(skillScores), assessmentId, userId]
    );

    this.activeAssessments.delete(key);

    return {
      assessmentId,
      skillScores,
      overallScore,
      strengths,
      weaknesses,
      recommendedRoadmap: {
        focus: weaknesses,
        estimatedWeeks: Math.max(4, weaknesses.length * 3),
      },
    };
  }

  async getAssessmentHistory(userId: number): Promise<Assessment[]> {
    const result = await query(
      `SELECT id, user_id, subject_id, questions_answered, correct_answers, 
              time_spent_seconds, skill_scores, completed_at
       FROM user_skill_assessments
       WHERE user_id = $1
       ORDER BY completed_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

export default new AssessmentService();
