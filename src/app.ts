import express, { Application, urlencoded } from 'express';
import {config} from 'dotenv';
import goscRoutes from './routes/gsoc';
import dataRoutes from './routes/data';
import cors from 'cors';
import cookieParser from "cookie-parser";
import expressWinston from "express-winston";
import winston from "winston";

// Load environment variables
config({
    path: "./.env",
  });
  

export const app: Application = express();
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli()
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
  })
);


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

app.use('/api/gsoc', goscRoutes);
app.use('/api/data', dataRoutes);



