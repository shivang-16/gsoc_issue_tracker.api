import express, { Application } from 'express';
import {config} from 'dotenv';
import issueRoutes from './routes/issueRoutes';
import goscRoutes from './routes/gsoc';
import dataRoutes from './routes/data';
import cors from 'cors';
import ConnectToDB from './db/db';

// Load environment variables
config({
    path: "./.env",
  });
  

export const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin:[process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Routes
app.get('/', async (req, res) => {
    res.send('Server is working!');
});

app.use('/api/issues', issueRoutes);
app.use('/api/gsoc', goscRoutes);
app.use('/api/data', dataRoutes);



