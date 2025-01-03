import express, { Application, urlencoded } from 'express';
import {config} from 'dotenv';
import issueRoutes from './routes/issueRoutes';
import goscRoutes from './routes/gsoc';
import dataRoutes from './routes/data';
import cors from 'cors';
import cookieParser from "cookie-parser";

// Load environment variables
config({
    path: "./.env",
  });
  

export const app: Application = express();

// Middleware
app.use((cookieParser()));
app.use(express.json());
app.use(urlencoded({ extended: true }));

const allowedOrigins = [process.env.FRONTEND_URL!, "http://localhost:3000"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));

// Routes
app.get('/', async (req, res) => {
    res.send('Server is working!');
});

app.use('/api/issues', issueRoutes);
app.use('/api/gsoc', goscRoutes);
app.use('/api/data', dataRoutes);



