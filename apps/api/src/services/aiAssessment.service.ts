/**
 * AI-Powered Assessment Service using Ollama
 * Generates questions, evaluates answers, and provides feedback
 */

import { query } from '../config/database'
import logger from '../config/logger'
import ollamaService from './ollama.service'
import { AppError } from '../middleware/error.middleware'

export interface GenerateQuestionsRequest {
  subject: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  numQuestions: number
  topics?: string[]
}

export interface AssessmentQuestion {
  id: string
  question: string
  options: string[]
  /** 0-based index of correct option for frontend */
  correctAnswer: number
  explanation: string
  topic: string
  difficulty: string
}

export interface EvaluateAnswerRequest {
  questionId: string
  userAnswer: string
  correctAnswer: string
}

export interface EvaluateAnswerResponse {
  isCorrect: boolean
  score: number
  feedback: string
  detailedExplanation: string
}

export class AIAssessmentService {
  /**
   * Generate assessment questions using AI
   */
  async generateQuestions(request: GenerateQuestionsRequest): Promise<AssessmentQuestion[]> {
    const topicsStr = request.topics?.length
      ? ` Topic: ${request.topics.join(', ')}.`
      : ''
    const n = Math.min(request.numQuestions, 5) // Cap at 5 for fast response

    const prompt = `Output ONLY a JSON array of exactly ${n} multiple-choice questions for ${request.subject}${topicsStr}. Difficulty: ${request.difficulty}. Each item: {"question":"...?","options":["A: ...","B: ...","C: ...","D: ..."],"correctAnswer":"A"|"B"|"C"|"D","explanation":"one sentence","topic":"..."}. No other text.`

    logger.debug('[AIAssessment] generateQuestions', { subject: request.subject, difficulty: request.difficulty, numQuestions: n })

    try {
      const response = await ollamaService.generate({
        prompt,
        temperature: 0.5,
        max_tokens: 1200,
      })

      const questions = this.parseQuestionsFromResponse(response, request)
      logger.debug('[AIAssessment] Parsed questions count', { count: questions.length })

      if (questions.length > 0) {
        return questions
      }
      logger.warn('[AIAssessment] Parse returned 0 questions; using fallback')
      throw new Error('No valid questions parsed from AI response')
    } catch (error) {
      logger.error('[AIAssessment] Question generation failed', { error: error instanceof Error ? error.message : String(error) })
      logger.warn('[AIAssessment] Using fallback questions (Ollama unavailable or invalid response)')
      return this.getFallbackQuestions(request)
    }
  }

  /** Extract and parse JSON array from AI response (handles markdown code blocks and trailing text) */
  private parseQuestionsFromResponse(
    response: string,
    request: GenerateQuestionsRequest
  ): AssessmentQuestion[] {
    let jsonStr: string | null = null
    const codeBlock = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlock) {
      jsonStr = codeBlock[1].trim()
    }
    if (!jsonStr) {
      const bracketMatch = response.match(/\[[\s\S]*\]/)
      if (bracketMatch) jsonStr = bracketMatch[0]
    }
    if (!jsonStr) {
      logger.warn('[AIAssessment] parse: no JSON array found in response')
      return []
    }

    try {
      const raw = JSON.parse(jsonStr) as any[]
      if (!Array.isArray(raw) || raw.length === 0) {
        logger.warn('[AIAssessment] parse: JSON is not a non-empty array')
        return []
      }

      return raw.map((q: any, idx: number) => {
        const rawOptions = Array.isArray(q.options) ? q.options : []
        const options = rawOptions.map((opt: string) => this.normalizeOption(opt))
        const correctLetter = String(q.correctAnswer || 'A').trim().toUpperCase()
        const correctIndex = correctLetter.charCodeAt(0) - 65
        const safeCorrectIndex = Math.max(0, Math.min(correctIndex, options.length - 1))
        return {
          id: `q${idx + 1}`,
          question: String(q.question || '').trim() || `Question ${idx + 1}`,
          options: options.length >= 2 ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: safeCorrectIndex,
          explanation: String(q.explanation || ''),
          topic: String(q.topic || request.subject),
          difficulty: request.difficulty,
        }
      })
    } catch (parseErr) {
      logger.error('[AIAssessment] parse: JSON.parse failed', { error: parseErr instanceof Error ? parseErr.message : String(parseErr) })
      return []
    }
  }

  /** Strip "A: ", "B: " prefix from option text for cleaner display */
  private normalizeOption(opt: string): string {
    const s = String(opt).trim()
    const letterPrefix = /^[A-D][:.)]\s*/i
    return s.replace(letterPrefix, '').trim() || s
  }

  /** Fallback questions when Ollama is unavailable or returns invalid JSON */
  private getFallbackQuestions(request: GenerateQuestionsRequest): AssessmentQuestion[] {
    const topic = request.topics?.[0] || request.subject
    const count = Math.min(request.numQuestions, 5)
    const opts = this.getFallbackOptionsForTopic(topic)
    const qs = this.getFallbackQuestionTextForTopic(topic)
    const fallback = [
      { question: qs[0], options: opts[0], correctIndex: 0, explanation: 'AI was unavailable. Enable Ollama for real quizzes.', topic },
      { question: qs[1], options: opts[1], correctIndex: 0, explanation: 'Review the material for more context.', topic },
      { question: qs[2], options: opts[2], correctIndex: 0, explanation: 'When AI is available, you will get personalized questions.', topic },
      { question: qs[3], options: opts[3], correctIndex: 0, explanation: 'Sample question. Enable Ollama for AI-generated assessments.', topic },
      { question: qs[4], options: opts[4], correctIndex: 0, explanation: 'Try again later for AI-generated questions.', topic },
    ]
    return fallback.slice(0, count).map((q, idx) => ({
      id: `q${idx + 1}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctIndex,
      explanation: q.explanation,
      topic: q.topic,
      difficulty: request.difficulty,
    }))
  }

  /** Topic-specific placeholder options so fallback doesn't show "Option A/B" */
  private getFallbackOptionsForTopic(topic: string): string[][] {
    const t = topic.toLowerCase()
    if (t.includes('flutter') || t.includes('dart')) {
      return [
        ['Dart language', 'Widget tree', 'setState()', 'Hot reload'],
        ['A reactive UI framework', 'A database', 'A backend only', 'A design tool'],
        ['State management', 'Syntax only', 'Deployment', 'Nothing'],
        ['Read docs first', 'Skip basics', 'Only watch videos', 'Copy-paste only'],
        ['Use widgets', 'Avoid widgets', 'Use only CSS', 'Ignore layout'],
      ]
    }
    if (t.includes('react')) {
      return [
        ['Components', 'Templates', 'Styles only', 'Backend APIs'],
        ['A UI library', 'A database', 'A language', 'An OS'],
        ['useState and useEffect', 'Only HTML', 'Only CSS', 'Nothing'],
        ['Component tree', 'Skip JSX', 'Ignore hooks', 'Avoid state'],
        ['Reusable components', 'Inline everything', 'No state', 'Server only'],
      ]
    }
    if (t.includes('python') || t.includes('javascript')) {
      return [
        ['Variables and types', 'Only comments', 'Only strings', 'Nothing'],
        ['A programming language', 'A database', 'A browser', 'A framework'],
        ['Loops and conditionals', 'Only print', 'Only input', 'Nothing'],
        ['Read docs and practice', 'Skip basics', 'Only copy code', 'Avoid functions'],
        ['Functions and modules', 'Only one file', 'No functions', 'Hardcode only'],
      ]
    }
    if (t.includes('algorithm') || t.includes('data structure')) {
      return [
        ['Time and space complexity', 'Only syntax', 'Only names', 'Nothing'],
        ['Arrays and hash maps', 'Only variables', 'Only loops', 'Nothing'],
        ['Big O notation', 'Only code', 'Only comments', 'Nothing'],
        ['Practice problems', 'Skip theory', 'Only read', 'Avoid practice'],
        ['Sorting and searching', 'Only input', 'Only output', 'Nothing'],
      ]
    }
    if (t.includes('mechanic')) {
      return [
        ['Newton\'s first law', 'Only velocity', 'Only mass', 'Only time'],
        ['Force = mass × acceleration', 'F = mv', 'F = ma²', 'F = m/v'],
        ['Inertia', 'Friction only', 'Gravity only', 'None'],
        ['Conservation of momentum', 'Only kinetic energy', 'Only potential', 'Neither'],
        ['Vector quantity', 'Scalar only', 'Constant only', 'Unit only'],
      ]
    }
    if (t.includes('thermodynamic') || t.includes('heat')) {
      return [
        ['First law: energy conservation', 'Only temperature', 'Only pressure', 'Only volume'],
        ['Entropy', 'Only heat', 'Only work', 'Only mass'],
        ['Kelvin scale', 'Celsius only', 'Fahrenheit only', 'No scale'],
        ['Heat transfer', 'Only conduction', 'Only radiation', 'None'],
        ['Internal energy', 'Only kinetic', 'Only potential', 'Neither'],
      ]
    }
    if (t.includes('electromagnet')) {
      return [
        ['Maxwell\'s equations', 'Only Ohm\'s law', 'Only Coulomb', 'None'],
        ['Electric field', 'Magnetic only', 'Gravity only', 'None'],
        ['Faraday\'s law of induction', 'Only Ampere', 'Only Gauss', 'None'],
        ['EM waves', 'Only DC', 'Only AC', 'Neither'],
        ['Right-hand rule', 'Left-hand only', 'No rule', 'Vector only'],
      ]
    }
    if (t.includes('algebra')) {
      return [
        ['Solve for x', 'Only constants', 'Only integers', 'No solution'],
        ['Linear equations', 'Only quadratics', 'Only polynomials', 'None'],
        ['Factoring', 'Only expanding', 'Only graphing', 'Neither'],
        ['Slope and intercept', 'Only slope', 'Only intercept', 'Neither'],
        ['Systems of equations', 'Single only', 'No systems', 'Inequalities only'],
      ]
    }
    if (t.includes('calculus')) {
      return [
        ['Derivative = rate of change', 'Only slope', 'Only area', 'Only limit'],
        ['Integral = area under curve', 'Only derivative', 'Only sum', 'Neither'],
        ['Chain rule', 'Product only', 'Quotient only', 'None'],
        ['Fundamental theorem', 'Only FTC part 1', 'Only FTC part 2', 'Neither'],
        ['Limits', 'Only continuity', 'Only differentiability', 'Neither'],
      ]
    }
    if (t.includes('statistic')) {
      return [
        ['Mean, median, mode', 'Only mean', 'Only median', 'Only mode'],
        ['Standard deviation', 'Only variance', 'Only range', 'Only mean'],
        ['Normal distribution', 'Only uniform', 'Only binomial', 'None'],
        ['Hypothesis testing', 'Only p-value', 'Only confidence', 'Neither'],
        ['Correlation vs causation', 'Only correlation', 'Only causation', 'Neither'],
      ]
    }
    if (t.includes('organic')) {
      return [
        ['Carbon-based compounds', 'Only inorganic', 'Only metals', 'Only gases'],
        ['Functional groups', 'Only hydrocarbons', 'Only bonds', 'Neither'],
        ['Nomenclature', 'Only formulas', 'Only structures', 'Neither'],
        ['Isomers', 'Only same formula', 'Only different formula', 'Neither'],
        ['Reaction mechanisms', 'Only products', 'Only reactants', 'Neither'],
      ]
    }
    if (t.includes('inorganic') || (t.includes('physical') && t.includes('chem'))) {
      return [
        ['Periodic table trends', 'Only metals', 'Only nonmetals', 'Neither'],
        ['Stoichiometry', 'Only moles', 'Only mass', 'Neither'],
        ['Bonding (ionic, covalent)', 'Only ionic', 'Only covalent', 'Neither'],
        ['Equilibrium', 'Only kinetics', 'Only thermodynamics', 'Neither'],
        ['Acids and bases', 'Only pH', 'Only concentration', 'Neither'],
      ]
    }
    if (t.includes('cell') || t.includes('genetic') || t.includes('ecology')) {
      return [
        ['Cell structure and function', 'Only nucleus', 'Only membrane', 'Neither'],
        ['DNA and RNA', 'Only DNA', 'Only RNA', 'Neither'],
        ['Natural selection', 'Only mutation', 'Only drift', 'Neither'],
        ['Ecosystem and food webs', 'Only producers', 'Only consumers', 'Neither'],
        ['Mitosis and meiosis', 'Only mitosis', 'Only meiosis', 'Neither'],
      ]
    }
    if (t.includes('aws') || t.includes('azure') || t.includes('docker') || t.includes('kubernetes')) {
      return [
        ['IAM and security', 'Only EC2', 'Only S3', 'Neither'],
        ['Containers vs VMs', 'Only containers', 'Only VMs', 'Neither'],
        ['Scaling (horizontal/vertical)', 'Only horizontal', 'Only vertical', 'Neither'],
        ['CI/CD pipelines', 'Only build', 'Only deploy', 'Neither'],
        ['Infrastructure as code', 'Only manual', 'Only scripts', 'Neither'],
      ]
    }
    return [
      ['Key definition or principle', 'Common misconception', 'Related but wrong', 'Unrelated distractor'],
      ['Correct application', 'Partial application', 'Wrong context', 'Opposite meaning'],
      ['Main takeaway', 'Secondary point', 'Edge case only', 'Irrelevant'],
      ['Best practice', 'Acceptable alternative', 'Outdated approach', 'Wrong approach'],
      ['Critical concept', 'Supporting detail', 'Optional topic', 'Off-topic'],
    ]
  }

  /** Topic-specific fallback question text (real concepts, not placeholders) */
  private getFallbackQuestionTextForTopic(topic: string): string[] {
    const t = topic.toLowerCase()
    if (t.includes('mechanic')) {
      return [
        'Which law states that an object at rest stays at rest unless acted on by a force?',
        'What is the relationship between force, mass, and acceleration?',
        'What property of matter resists changes in motion?',
        'When two objects collide and no external force acts, what is conserved?',
        'Is force a vector or a scalar quantity?',
      ]
    }
    if (t.includes('thermodynamic') || t.includes('heat')) {
      return [
        'What does the first law of thermodynamics state?',
        'What quantity tends to increase in isolated systems?',
        'Which temperature scale has absolute zero at 0?',
        'What are the three modes of heat transfer?',
        'What type of energy is the sum of kinetic and potential at molecular level?',
      ]
    }
    if (t.includes('electromagnet')) {
      return [
        'Which equations unify electricity and magnetism?',
        'What is the region around a charged object called?',
        'Which law describes induced EMF from changing magnetic flux?',
        'What do oscillating electric and magnetic fields form?',
        'Which rule gives the direction of magnetic force on a current?',
      ]
    }
    if (t.includes('algebra')) {
      return [
        'What is the goal when solving a linear equation in one variable?',
        'What type of equation has the form ax + b = 0?',
        'What technique rewrites a polynomial as a product of factors?',
        'In y = mx + b, what do m and b represent?',
        'What do we call two or more equations with shared variables?',
      ]
    }
    if (t.includes('calculus')) {
      return [
        'What does the derivative represent geometrically?',
        'What does a definite integral compute?',
        'Which rule is used for derivative of f(g(x))?',
        'What theorem links derivatives and integrals?',
        'What concept describes the value a function approaches?',
      ]
    }
    if (t.includes('flutter') || t.includes('react') || t.includes('python') || t.includes('javascript')) {
      return [
        `What is a fundamental concept in ${topic}?`,
        `Which best describes ${topic}?`,
        `What is important to remember when working with ${topic}?`,
        `How would you approach learning ${topic}?`,
        `What is a common best practice in ${topic}?`,
      ]
    }
    return [
      `What is a key concept in ${topic}?`,
      `Which best describes ${topic}?`,
      `In ${topic}, what is important to remember?`,
      `How would you approach learning ${topic}?`,
      `What is a common practice in ${topic}?`,
    ]
  }

  /**
   * Evaluate user answer and provide feedback
   */
  async evaluateAnswer(req: EvaluateAnswerRequest): Promise<EvaluateAnswerResponse> {
    const isCorrect = req.userAnswer.trim().toUpperCase() === req.correctAnswer.trim().toUpperCase()

    const prompt = `A student answered "${req.userAnswer}" to a question where the correct answer is "${req.correctAnswer}".

The answer is ${isCorrect ? 'CORRECT' : 'INCORRECT'}.

Provide:
1. A brief feedback message (1-2 sentences) ${isCorrect ? 'praising the correct answer' : 'explaining why the answer is wrong'}
2. A detailed explanation of the correct answer and the concept (2-3 sentences)

Format as JSON:
{
  "feedback": "Brief feedback here",
  "detailedExplanation": "Detailed explanation here"
}`

    try {
      const response = await ollamaService.generate({
        prompt,
        temperature: 0.7,
        max_tokens: 300,
      })

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        feedback: isCorrect ? 'Correct!' : 'Incorrect answer.',
        detailedExplanation: 'Please review the material.',
      }

      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        feedback: parsed.feedback,
        detailedExplanation: parsed.detailedExplanation,
      }
    } catch (error) {
      logger.error('[AIAssessment] Answer evaluation failed', { error: error instanceof Error ? error.message : String(error) })
      // Fallback to simple evaluation
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect
          ? 'Correct! Well done.'
          : `Incorrect. The correct answer is ${req.correctAnswer}.`,
        detailedExplanation: 'Review the material to understand this concept better.',
      }
    }
  }

  /**
   * Generate personalized skill assessment
   */
  async generatePersonalizedAssessment(userId: number, subject: string): Promise<any> {
    // Get user's existing skill data
    const userTags = await query(
      'SELECT tag_name, rating_score FROM app_user_tags WHERE user_id = $1 AND tag_name ILIKE $2',
      [userId, `%${subject}%`]
    )

    const userSkills = userTags.rows.map((row) => ({
      skill: row.tag_name,
      level: row.rating_score,
    }))

    const difficulty = this.determineDifficulty(userSkills)
    const topics = userSkills.map((s) => s.skill)

    return this.generateQuestions({
      subject,
      difficulty,
      numQuestions: 10,
      topics: topics.length > 0 ? topics : undefined,
    })
  }

  /**
   * Analyze assessment results and provide recommendations
   */
  async analyzeResults(userId: number, assessmentId: number): Promise<any> {
    const assessment = await query(
      'SELECT skill_scores, questions_answered, correct_answers FROM user_skill_assessments WHERE id = $1 AND user_id = $2',
      [assessmentId, userId]
    )

    if (assessment.rows.length === 0) {
      throw new AppError('Assessment not found', 404)
    }

    const { skill_scores, questions_answered, correct_answers } = assessment.rows[0]
    const accuracy = (correct_answers / questions_answered) * 100

    const prompt = `A student completed an assessment with ${accuracy.toFixed(1)}% accuracy (${correct_answers}/${questions_answered} correct).

Their skill scores: ${JSON.stringify(skill_scores)}

Provide:
1. A performance summary (2-3 sentences)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Recommended next steps

Format as JSON:
{
  "summary": "Performance summary here",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "recommendations": ["step1", "step2", "step3"]
}`

    try {
      const response = await ollamaService.generate({
        prompt,
        temperature: 0.7,
        max_tokens: 500,
      })

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('Failed to parse AI response')
    } catch (error) {
      logger.error('[AIAssessment] Results analysis failed', { error: error instanceof Error ? error.message : String(error) })
      return {
        summary: `You scored ${accuracy.toFixed(1)}% on this assessment.`,
        strengths: ['Completed the assessment'],
        improvements: ['Review incorrect answers'],
        recommendations: ['Practice more', 'Review course material', 'Try another assessment'],
      }
    }
  }

  private determineDifficulty(skills: any[]): 'beginner' | 'intermediate' | 'advanced' {
    if (skills.length === 0) return 'beginner'
    const avgScore = skills.reduce((sum, s) => sum + (s.level || 0), 0) / skills.length
    if (avgScore < 4) return 'beginner'
    if (avgScore < 7) return 'intermediate'
    return 'advanced'
  }
}

export default new AIAssessmentService()
