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
  
ConnectToDB()

const app: Application = express();
const PORT = process.env.PORT || 7000;

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


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
