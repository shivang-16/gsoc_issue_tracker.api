import express, { Application } from 'express';
import {config} from 'dotenv';
import issueRoutes from './routes/issueRoutes';
import { scrapeOrganizations } from './utils/scraper';
import axios from 'axios';
import fs from 'fs';

// Load environment variables
config({
    path: "./.env",
  });
  

const app: Application = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(express.json());

// Routes
app.get('/', async (req, res) => {
    res.send('Server is working!');
});

app.use('/api/issues', issueRoutes);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
