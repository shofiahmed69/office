import { Router } from 'express';
import { generateCourse } from '../controllers/courses.js';

export const coursesRoutes = Router();

coursesRoutes.post('/generate', generateCourse);
