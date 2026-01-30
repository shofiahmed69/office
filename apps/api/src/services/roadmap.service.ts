import { query } from '../config/database';
import { Roadmap, RoadmapModule } from '../types';
import { AppError } from '../middleware/error.middleware';

export class RoadmapService {
  async generateRoadmap(userId: number, data: {
    assessmentId?: number;
    learningGoal: string;
    subject: string;
    hoursPerWeek: number;
    preferredLearningStyle?: string;
  }): Promise<Roadmap> {
    // Generate roadmap based on assessment results or default
    const skillGaps: Record<string, number> = {};
    
    if (data.assessmentId) {
      const assessment = await query(
        'SELECT skill_scores FROM user_skill_assessments WHERE id = $1 AND user_id = $2',
        [data.assessmentId, userId]
      );
      if (assessment.rows.length > 0) {
        const scores = assessment.rows[0].skill_scores;
        for (const [skill, score] of Object.entries(scores as Record<string, number>)) {
          if (score < 70) {
            skillGaps[skill] = 70 - score;
          }
        }
      }
    }

    // Generate modules based on skill gaps or default curriculum
    const modules: RoadmapModule[] = [
      { id: 1, name: 'Foundations', description: 'Core concepts and fundamentals', topics: ['Basics', 'Syntax', 'Data Types'], estimatedHours: 10, difficulty: 'beginner', prerequisites: [], contentIds: [], sequenceOrder: 1, status: 'not_started' },
      { id: 2, name: 'Intermediate Concepts', description: 'Building on the basics', topics: ['Functions', 'Objects', 'Control Flow'], estimatedHours: 15, difficulty: 'intermediate', prerequisites: [1], contentIds: [], sequenceOrder: 2, status: 'not_started' },
      { id: 3, name: 'Advanced Topics', description: 'Advanced techniques and patterns', topics: ['Async/Await', 'Design Patterns', 'Performance'], estimatedHours: 20, difficulty: 'advanced', prerequisites: [2], contentIds: [], sequenceOrder: 3, status: 'not_started' },
      { id: 4, name: 'Projects', description: 'Hands-on practice projects', topics: ['Project 1', 'Project 2', 'Capstone'], estimatedHours: 25, difficulty: 'advanced', prerequisites: [3], contentIds: [], sequenceOrder: 4, status: 'not_started' },
    ];

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
    return result.rows[0];
  }

  async getUserRoadmaps(userId: number): Promise<Roadmap[]> {
    const result = await query(
      'SELECT * FROM user_learning_roadmaps WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async updateModuleProgress(userId: number, roadmapId: number, moduleId: number, status: 'not_started' | 'in_progress' | 'completed'): Promise<Roadmap> {
    const roadmap = await this.getRoadmap(userId, roadmapId);
    const roadmapData = roadmap.roadmap_data || roadmap.roadmapData;
    
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
