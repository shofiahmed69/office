import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class AIAssistantService {
  async askQuestion(userId: number, sessionId: number, question: string, context?: string[]): Promise<{
    question: string;
    answer: string;
    confidence: number;
    sources: { title: string; url: string }[];
  }> {
    // In production, this would call Ollama or another LLM
    // For now, provide a simulated response
    
    // Store the question and answer
    await query(
      `INSERT INTO study_session_ai_assistance 
       (session_id, user_id, question_text, ai_response_text, context_used, response_confidence)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sessionId,
        userId,
        question,
        this.generateSimulatedAnswer(question),
        JSON.stringify(context || []),
        0.85,
      ]
    );

    return {
      question,
      answer: this.generateSimulatedAnswer(question),
      confidence: 0.85,
      sources: [
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
        { title: 'Official Documentation', url: 'https://docs.example.com' },
      ],
    };
  }

  private generateSimulatedAnswer(question: string): string {
    // Simulated AI responses based on common questions
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('useeffect')) {
      return 'useEffect is a React Hook that lets you synchronize a component with an external system. It runs after every render by default, but you can control when it runs using the dependency array. The cleanup function runs before the component unmounts or before the effect runs again.';
    }
    if (lowerQuestion.includes('closure')) {
      return 'A closure is a function that has access to variables from its outer (enclosing) scope, even after that outer function has returned. This is possible because functions in JavaScript form closures around the data they reference.';
    }
    if (lowerQuestion.includes('async') || lowerQuestion.includes('await')) {
      return 'Async/await is syntactic sugar built on top of Promises. The async keyword makes a function return a Promise, and await pauses execution until the Promise resolves. This makes asynchronous code easier to read and write.';
    }
    
    return 'That is a great question. Based on the context of your study session, I recommend reviewing the fundamentals of this topic and practicing with hands-on examples. Consider breaking down the concept into smaller parts to better understand each component.';
  }

  async transcribeAudio(sessionId: number, userId: number, audioData: Buffer): Promise<{
    transcriptId: number;
    text: string;
    confidence: number;
    languageDetected: string;
    insights: { currentTopic: string; suggestedResources: { title: string; url: string }[] };
  }> {
    // In production, this would call Whisper or another speech-to-text service
    // For now, simulate transcription
    
    const simulatedText = 'This is a simulated transcription of the audio content.';
    
    // Get current sequence number
    const seqResult = await query(
      `SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_seq 
       FROM study_session_transcription_chunks WHERE session_id = $1`,
      [sessionId]
    );
    const sequenceNumber = seqResult.rows[0].next_seq;

    const result = await query(
      `INSERT INTO study_session_transcription_chunks 
       (session_id, speaker_user_id, transcript_text, sequence_number, confidence_score, language_detected)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [sessionId, userId, simulatedText, sequenceNumber, 0.94, 'en']
    );

    return {
      transcriptId: result.rows[0].id,
      text: simulatedText,
      confidence: 0.94,
      languageDetected: 'en',
      insights: {
        currentTopic: 'General Discussion',
        suggestedResources: [
          { title: 'Related Tutorial', url: 'https://example.com/tutorial' },
        ],
      },
    };
  }

  async getSessionAssistanceHistory(sessionId: number, userId: number): Promise<any[]> {
    const sessionCheck = await query(
      `SELECT 1 FROM study_sessions WHERE id = $1 AND (host_user_id = $2 OR study_buddy_user_id = $2)`,
      [sessionId, userId]
    );
    if (sessionCheck.rows.length === 0) {
      throw new AppError('Session not found or access denied', 404);
    }
    const result = await query(
      `SELECT ssaa.*, u.username
       FROM study_session_ai_assistance ssaa
       JOIN app_users u ON ssaa.user_id = u.id
       WHERE ssaa.session_id = $1
       ORDER BY ssaa.asked_at ASC`,
      [sessionId]
    );
    return result.rows;
  }

  async rateResponse(assistanceId: number, wasHelpful: boolean, userId: number): Promise<void> {
    const assistance = await query(
      `SELECT session_id FROM study_session_ai_assistance WHERE id = $1`,
      [assistanceId]
    );
    if (assistance.rows.length === 0) {
      throw new AppError('Assistance record not found', 404);
    }
    const sessionId = assistance.rows[0].session_id;
    const sessionCheck = await query(
      `SELECT 1 FROM study_sessions WHERE id = $1 AND (host_user_id = $2 OR study_buddy_user_id = $2)`,
      [sessionId, userId]
    );
    if (sessionCheck.rows.length === 0) {
      throw new AppError('Access denied to this assistance record', 403);
    }
    await query(
      `UPDATE study_session_ai_assistance SET was_helpful = $1 WHERE id = $2`,
      [wasHelpful, assistanceId]
    );
  }
}

export default new AIAssistantService();
