import { query } from '../config/database'
import { Roadmap, RoadmapModule } from '../types'
import { AppError } from '../middleware/error.middleware'
import logger from '../config/logger'
import ollamaService from './ollama.service'

/**
 * Generate a full curriculum (basic to pro) with proper subtopics using AI.
 * Falls back to null on failure so caller can use buildModulesFromAssessment.
 */
async function generateCurriculumWithAI(
  subject: string,
  learningGoal: string,
  weakPoints: string[],
  conceptsTested: string[]
): Promise<RoadmapModule[] | null> {
  const weakStr = weakPoints.length > 0 ? `Weak areas to focus on: ${weakPoints.join(', ')}.` : ''
  const conceptsStr = conceptsTested.length > 0 ? `Concepts already tested: ${conceptsTested.join(', ')}.` : ''

  const system = `You are an expert curriculum designer. Output ONLY valid JSON. No markdown, no explanation, no other text.`
  const prompt = `Create a complete learning roadmap from beginner to professional for: ${subject}.
Learning goal: ${learningGoal}
${conceptsStr}
${weakStr}

Output a JSON array of 5 to 8 modules. Each module must have exactly:
- "name": string (e.g. "Foundations", "Core Programming", "Data Structures", "Advanced Topics")
- "description": string (one sentence what the learner will master)
- "difficulty": "beginner" | "intermediate" | "advanced"
- "topics": array of 6 to 12 specific subtopic names (real concepts only, e.g. "Variables and Data Types", "Conditionals and Loops", "Functions and Scope", "OOP: Classes and Inheritance", "File I/O and Exceptions", "Testing and Debugging", "APIs and REST", "Design Patterns"). Do NOT use generic words like "Practice", "Apply", "Exercises", "Review" as topic names. Use concrete concept names for ${subject}.
- "estimatedHours": number (8 to 25 per module)

Order: first 1-2 modules beginner, then 2-3 intermediate, then 1-2 advanced. Cover every important concept from basics to pro. Output only the JSON array.`

  try {
    const response = await ollamaService.generate({
      prompt,
      system,
      temperature: 0.4,
      max_tokens: 2400,
    })

    const jsonStr = extractJsonArray(response)
    if (!jsonStr) {
      logger.warn('[Roadmap AI] No JSON array found in response')
      return null
    }

    const raw = JSON.parse(jsonStr) as unknown[]
    if (!Array.isArray(raw) || raw.length === 0) {
      logger.warn('[Roadmap AI] Parsed JSON is not a non-empty array')
      return null
    }

    const modules: RoadmapModule[] = raw.slice(0, 10).map((m: unknown, idx: number) => {
      const mod = m as Record<string, unknown>
      const name = String(mod?.name ?? `Module ${idx + 1}`).trim()
      const description = String(mod?.description ?? '').trim() || `Learn ${name.toLowerCase()}`
      const difficulty = ['beginner', 'intermediate', 'advanced'].includes(String(mod?.difficulty ?? '').toLowerCase())
        ? (String(mod.difficulty).toLowerCase() as 'beginner' | 'intermediate' | 'advanced')
        : (idx < 2 ? 'beginner' : idx < 4 ? 'intermediate' : 'advanced')
      let topics: string[] = Array.isArray(mod.topics) ? (mod.topics as string[]).filter((t) => typeof t === 'string' && t.trim().length > 0) : []
      if (topics.length === 0) topics = [name, 'Key concepts', 'Hands-on']
      if (topics.length < 4) {
        const extra = ['Core concepts', 'Practice', 'Apply'].filter((x) => !topics.some((t) => t.toLowerCase().includes(x.toLowerCase())))
        topics = [...topics, ...extra].slice(0, 8)
      }
      const estimatedHours = Math.max(6, Math.min(30, Number(mod?.estimatedHours) || 10))

      return {
        id: idx + 1,
        name,
        description,
        topics,
        estimatedHours,
        difficulty,
        prerequisites: idx === 0 ? [] : [idx],
        contentIds: [],
        sequenceOrder: idx + 1,
        status: 'not_started' as const,
      }
    })

    logger.info('[Roadmap AI] Generated modules', { count: modules.length, topics: modules.reduce((s, m) => s + m.topics.length, 0) })
    return modules
  } catch (err) {
    logger.warn('[Roadmap AI] Generation failed', { error: err instanceof Error ? err.message : err })
    return null
  }
}

function extractJsonArray(response: string): string | null {
  if (!response?.trim()) return null
  const trimmed = response.trim()
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) return codeBlock[1].trim()
  const bracketMatch = trimmed.match(/\[[\s\S]*\]/)
  return bracketMatch ? bracketMatch[0] : null
}

/** Detect old-format modules (single "Core concepts", or "Practice"/"Apply" only) so we can upgrade existing roadmaps */
function needsModulesUpgrade(modules: RoadmapModule[] | undefined): boolean {
  if (!Array.isArray(modules) || modules.length === 0) return false
  const first = modules[0]
  const topics = first?.topics ?? []
  if (topics.length <= 2) return true
  const hasOnlyGeneric = topics.every((t) => {
    const lower = t.toLowerCase()
    return lower === 'core concepts' || lower === 'practice' || lower === 'apply' || lower === 'exercises' || lower === 'review' || lower === 'mini-project' || lower === 'capstone'
  })
  if (hasOnlyGeneric && topics.length <= 4) return true
  return modules.some((m) => {
    const t = (m.topics ?? []) as string[]
    return t.length === 3 && t.some((x) => x === 'Practice') && t.some((x) => x === 'Apply')
  })
}

/** Extract weak points from existing "Review: X" module names for upgrade */
function extractWeakPointsFromModules(modules: RoadmapModule[]): string[] {
  const weak: string[] = []
  for (const m of modules) {
    const name = (m.name ?? '').trim()
    if (name.startsWith('Review: ')) weak.push(name.replace(/^Review:\s*/i, '').trim())
  }
  return weak.filter(Boolean)
}

/** Upgrade roadmap's modules to new curriculum (AI or fallback), update DB, return updated roadmap row */
async function upgradeRoadmapModules(roadmap: Record<string, unknown>): Promise<Record<string, unknown>> {
  const subject = String(roadmap.subject ?? 'Subject').trim() || 'Learning'
  const learningGoal = String(roadmap.learning_goal ?? roadmap.learningGoal ?? '').trim()
  const roadmapData = (roadmap.roadmap_data ?? roadmap.roadmapData) as { modules?: RoadmapModule[]; milestones?: unknown[] } | undefined
  const oldModules = roadmapData?.modules ?? []
  const weakPoints = extractWeakPointsFromModules(oldModules)
  const conceptsTested = (oldModules[0]?.topics ?? []) as string[]
  const skillGaps: Record<string, number> = (roadmap.skill_gaps ?? roadmap.skillGaps) as Record<string, number> ?? {}

  let newModules: RoadmapModule[] = await generateCurriculumWithAI(subject, learningGoal, weakPoints, conceptsTested)
  if (!newModules || newModules.length === 0) {
    newModules = buildModulesFromAssessment(subject, weakPoints, conceptsTested, skillGaps)
  }
  const totalHours = newModules.reduce((sum, m) => sum + m.estimatedHours, 0)
  const hoursPerWeek = Number(roadmap.hours_per_week ?? roadmap.hoursPerWeek ?? 10) || 10
  const estimatedWeeks = Math.ceil(totalHours / hoursPerWeek)
  const newRoadmapData = {
    modules: newModules,
    milestones: roadmapData?.milestones ?? [
      { week: Math.ceil(estimatedWeeks * 0.25), name: 'Foundation Complete', description: 'Complete basics module' },
      { week: Math.ceil(estimatedWeeks * 0.5), name: 'Intermediate Complete', description: 'Build first small project' },
      { week: Math.ceil(estimatedWeeks * 0.75), name: 'Advanced Concepts', description: 'Complete advanced topics' },
      { week: estimatedWeeks, name: 'Course Complete', description: 'Finish capstone project' },
    ],
  }

  const roadmapId = Number(roadmap.id)
  const userId = Number(roadmap.user_id ?? roadmap.userId)
  await query(
    `UPDATE user_learning_roadmaps SET roadmap_data = $1, estimated_weeks = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4`,
    [JSON.stringify(newRoadmapData), estimatedWeeks, roadmapId, userId]
  )
  return { ...roadmap, roadmap_data: newRoadmapData, roadmapData: newRoadmapData, estimated_weeks: estimatedWeeks, estimatedWeeks }
}

/** Subject/topic-specific subtopics (basic → pro) when AI is not used */
function getSubtopicsForSubject(subject: string, topic?: string): string[] {
  const s = (subject || '').toLowerCase()
  const t = (topic || '').toLowerCase()
  const python = ['Variables and Data Types', 'Conditionals and Loops', 'Functions and Scope', 'Data Structures (lists, dicts)', 'File I/O and Exceptions', 'OOP: Classes and Inheritance', 'Modules and Packages', 'Testing and Debugging']
  const cs = ['Algorithms and Complexity', 'Data Structures', 'Programming Paradigms', 'Computer Architecture', 'Operating Systems', 'Networks', 'Databases', 'Software Engineering']
  const web = ['HTML/CSS Basics', 'JavaScript Fundamentals', 'DOM and Events', 'Async and APIs', 'Frameworks (React/Vue)', 'State Management', 'Testing and Deployment']
  const math = ['Algebra and Equations', 'Functions and Graphs', 'Calculus Basics', 'Linear Algebra', 'Probability', 'Statistics', 'Proofs and Logic']
  const physics = ['Kinematics', 'Forces and Newton\'s Laws', 'Energy and Momentum', 'Waves and Optics', 'Electricity and Magnetism', 'Thermodynamics', 'Modern Physics']
  if (t.includes('python') || s.includes('python')) return python
  if (s.includes('computer science') || s.includes('cs ') || s === 'cs') return cs
  if (s.includes('web') || s.includes('frontend') || s.includes('javascript')) return web
  if (s.includes('math')) return math
  if (s.includes('physics')) return physics
  return ['Fundamentals', 'Core Concepts', 'Intermediate Topics', 'Advanced Concepts', 'Practice', 'Projects']
}

function buildModulesFromAssessment(
  subject: string,
  weakPoints: string[],
  conceptsTested: string[],
  skillGaps: Record<string, number>
): RoadmapModule[] {
  const hasAssessmentData = weakPoints.length > 0 || conceptsTested.length > 0 || Object.keys(skillGaps).length > 0
  if (!hasAssessmentData) {
    const coreTopics = getSubtopicsForSubject(subject).slice(0, 8)
    return [
      { id: 1, name: 'Foundations', description: 'Core concepts and fundamentals from basics to intermediate', topics: coreTopics.slice(0, 6), estimatedHours: 12, difficulty: 'beginner', prerequisites: [], contentIds: [], sequenceOrder: 1, status: 'not_started' },
      { id: 2, name: 'Intermediate Concepts', description: 'Building on the basics with real-world patterns', topics: coreTopics.slice(4, 10).length ? coreTopics.slice(4, 10) : ['Functions', 'Objects', 'Control Flow', 'Data Structures', 'Error Handling'], estimatedHours: 15, difficulty: 'intermediate', prerequisites: [1], contentIds: [], sequenceOrder: 2, status: 'not_started' },
      { id: 3, name: 'Advanced Topics', description: 'Advanced techniques and professional patterns', topics: ['Design Patterns', 'Performance', 'Testing', 'APIs', 'Deployment', 'Best Practices'], estimatedHours: 20, difficulty: 'advanced', prerequisites: [2], contentIds: [], sequenceOrder: 3, status: 'not_started' },
      { id: 4, name: 'Projects & Portfolio', description: 'Hands-on projects to demonstrate mastery', topics: ['Mini-project', 'Capstone Project', 'Code Review', 'Documentation', 'Portfolio'], estimatedHours: 25, difficulty: 'advanced', prerequisites: [3], contentIds: [], sequenceOrder: 4, status: 'not_started' },
    ]
  }
  const modules: RoadmapModule[] = []
  let seq = 1
  const coreSubtopics = [...(conceptsTested.length > 0 ? conceptsTested : getSubtopicsForSubject(subject).slice(0, 8))]
  if (coreSubtopics.length < 4) coreSubtopics.push('Key Concepts', 'Hands-on Practice', 'Summary')
  modules.push({
    id: seq,
    name: `${subject} – Core`,
    description: 'Concepts covered in your assessment – fundamentals to intermediate',
    topics: coreSubtopics.slice(0, 10),
    estimatedHours: 12,
    difficulty: 'beginner',
    prerequisites: [],
    contentIds: [],
    sequenceOrder: seq,
    status: 'not_started',
  })
  seq++
  const weak = weakPoints.length > 0 ? weakPoints : Object.keys(skillGaps)
  for (const topic of weak.slice(0, 5)) {
    const reviewSubtopics = getSubtopicsForSubject(subject, topic)
    const topicsForReview = reviewSubtopics.length >= 4 ? reviewSubtopics.slice(0, 8) : [topic, `${topic} Fundamentals`, `${topic} Practice`, 'Apply to Projects']
    modules.push({
      id: seq,
      name: `Review: ${topic}`,
      description: `Strengthen your understanding of ${topic} with detailed subtopics and practice.`,
      topics: topicsForReview,
      estimatedHours: 10,
      difficulty: 'intermediate',
      prerequisites: [1],
      contentIds: [],
      sequenceOrder: seq,
      status: 'not_started',
    })
    seq++
  }
  const practiceSubtopics = ['Exercises', 'Mini-project', 'Code Review', 'Documentation', 'Portfolio Piece', 'Summary']
  modules.push({
    id: seq,
    name: 'Practice & Apply',
    description: 'Hands-on practice and projects. Combine concepts from all modules.',
    topics: practiceSubtopics,
    estimatedHours: 15,
    difficulty: 'intermediate',
    prerequisites: modules.map((m) => m.id),
    contentIds: [],
    sequenceOrder: seq,
    status: 'not_started',
  })
  return modules
}

export class RoadmapService {
  async generateRoadmap(userId: number, data: {
    assessmentId?: number
    learningGoal: string
    subject: string
    hoursPerWeek: number
    preferredLearningStyle?: string
  }): Promise<Roadmap> {
    const skillGaps: Record<string, number> = {}
    let weakPoints: string[] = []
    let conceptsTested: string[] = []

    if (data.assessmentId) {
      let assessment: { rows: unknown[] }
      try {
        assessment = await query(
          `SELECT skill_scores, weak_points, concepts_tested FROM user_skill_assessments WHERE id = $1 AND user_id = $2`,
          [data.assessmentId, userId]
        )
      } catch {
        assessment = await query(
          `SELECT skill_scores FROM user_skill_assessments WHERE id = $1 AND user_id = $2`,
          [data.assessmentId, userId]
        )
      }
      if (assessment.rows.length > 0) {
        const row = assessment.rows[0] as { skill_scores?: Record<string, number>; weak_points?: string[]; concepts_tested?: string[] }
        const scores = row.skill_scores ?? {}
        for (const [skill, score] of Object.entries(scores)) {
          if (score < 70) skillGaps[skill] = 70 - score
        }
        weakPoints = Array.isArray(row.weak_points) ? row.weak_points : []
        conceptsTested = Array.isArray(row.concepts_tested) ? row.concepts_tested : []
        if (weakPoints.length === 0 && conceptsTested.length === 0 && Object.keys(skillGaps).length > 0) {
          weakPoints = Object.keys(skillGaps)
        }
      }
    }

    let modules: RoadmapModule[] = await generateCurriculumWithAI(
      data.subject,
      data.learningGoal,
      weakPoints,
      conceptsTested
    )
    if (!modules || modules.length === 0) {
      logger.info('[Roadmap] Using fallback curriculum (AI unavailable or empty)')
      modules = buildModulesFromAssessment(data.subject, weakPoints, conceptsTested, skillGaps)
    }

    const totalHours = modules.reduce((sum, m) => sum + m.estimatedHours, 0);
    const estimatedWeeks = Math.ceil(totalHours / data.hoursPerWeek);

    const roadmapData = {
      modules,
      milestones: [
        { week: Math.ceil(estimatedWeeks * 0.25), name: 'Foundation Complete', description: 'Complete basics module' },
        { week: Math.ceil(estimatedWeeks * 0.5), name: 'Intermediate Complete', description: 'Build first small project' },
        { week: Math.ceil(estimatedWeeks * 0.75), name: 'Advanced Concepts', description: 'Complete advanced topics' },
        { week: estimatedWeeks, name: 'Course Complete', description: 'Finish capstone project' },
      ],
    };

    const result = await query(
      `INSERT INTO user_learning_roadmaps 
       (user_id, subject, learning_goal, skill_gaps, roadmap_data, hours_per_week, estimated_weeks, status, progress_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 0)
       RETURNING *`,
      [userId, data.subject, data.learningGoal, JSON.stringify(skillGaps), JSON.stringify(roadmapData), data.hoursPerWeek, estimatedWeeks]
    );

    return result.rows[0];
  }

  async getRoadmap(userId: number, roadmapId: number): Promise<Roadmap> {
    const result = await query(
      'SELECT * FROM user_learning_roadmaps WHERE id = $1 AND user_id = $2',
      [roadmapId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Roadmap not found', 404);
    }
    let row = result.rows[0] as Record<string, unknown>;
    const roadmapData = row.roadmap_data ?? row.roadmapData as { modules?: RoadmapModule[] } | undefined;
    const modules = roadmapData?.modules ?? [];
    if (needsModulesUpgrade(modules)) {
      logger.info('[Roadmap] Upgrading existing roadmap', { roadmapId })
      row = await upgradeRoadmapModules(row) as Roadmap;
    }
    return row as Roadmap;
  }

  async getUserRoadmaps(userId: number): Promise<Roadmap[]> {
    const result = await query(
      'SELECT * FROM user_learning_roadmaps WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const rows = result.rows as Record<string, unknown>[];
    const out: Roadmap[] = [];
    for (const row of rows) {
      const roadmapData = row.roadmap_data ?? row.roadmapData as { modules?: RoadmapModule[] } | undefined;
      const modules = roadmapData?.modules ?? [];
      if (needsModulesUpgrade(modules)) {
        logger.info('[Roadmap] Upgrading roadmap to new curriculum (list)', { roadmapId: row.id })
        const upgraded = await upgradeRoadmapModules(row);
        out.push(upgraded as Roadmap);
      } else {
        out.push(row as Roadmap);
      }
    }
    return out;
  }

  async updateModuleProgress(userId: number, roadmapId: number, moduleId: number, status: 'not_started' | 'in_progress' | 'completed'): Promise<Roadmap> {
    const roadmap = await this.getRoadmap(userId, roadmapId);
    // Handle both camelCase and snake_case property naming from DB
    const roadmapData = roadmap.roadmapData ?? (roadmap as unknown as { roadmap_data?: typeof roadmap.roadmapData }).roadmap_data;

    if (!roadmapData) {
      throw new AppError('Roadmap data is missing', 500);
    }

    const module = roadmapData.modules.find((m: RoadmapModule) => m.id === moduleId);
    if (!module) {
      throw new AppError('Module not found', 404);
    }

    module.status = status;
    if (status === 'completed') {
      module.completedAt = new Date().toISOString();
    } else if (status === 'in_progress') {
      module.startedAt = new Date().toISOString();
    }

    // Calculate overall progress
    const completedModules = roadmapData.modules.filter((m: RoadmapModule) => m.status === 'completed').length;
    const progressPercentage = Math.round((completedModules / roadmapData.modules.length) * 100);

    const result = await query(
      `UPDATE user_learning_roadmaps 
       SET roadmap_data = $1, progress_percentage = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [JSON.stringify(roadmapData), progressPercentage, roadmapId, userId]
    );

    return result.rows[0];
  }

  async updateRoadmapStatus(userId: number, roadmapId: number, status: 'active' | 'paused' | 'completed' | 'archived'): Promise<Roadmap> {
    const result = await query(
      `UPDATE user_learning_roadmaps SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, roadmapId, userId]
    );
    if (result.rows.length === 0) {
      throw new AppError('Roadmap not found', 404);
    }
    return result.rows[0];
  }
}

export default new RoadmapService();
