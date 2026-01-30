import { Router } from 'express';
import {
  getCountries,
  getStates,
  getCities,
  getTimezones,
  getLanguages,
  getHubs,
  getTagGroups,
  getTagCategories,
  getTags,
  getAiModels,
  getAiPrompts,
} from '../controllers/master.js';

export const masterRoutes = Router();

masterRoutes.get('/countries', getCountries);
masterRoutes.get('/states', getStates);
masterRoutes.get('/cities', getCities);
masterRoutes.get('/timezones', getTimezones);
masterRoutes.get('/languages', getLanguages);
masterRoutes.get('/hubs', getHubs);
masterRoutes.get('/tags/groups', getTagGroups);
masterRoutes.get('/tags/categories', getTagCategories);
masterRoutes.get('/tags', getTags);
masterRoutes.get('/ai-models', getAiModels);
masterRoutes.get('/ai-prompts', getAiPrompts);
