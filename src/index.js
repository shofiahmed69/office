import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { masterRoutes } from './routes/master.js';
import { coursesRoutes } from './routes/courses.js';

const app = express();

app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());

app.use('/api/master', masterRoutes);
app.use('/api/courses', coursesRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
});
