import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import workoutRoutes from './routes/workouts.js';
import userRoutes from './routes/users.js';
import exerciseRoutes from './routes/exercises.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeLocalDB } from './services/localdb.js';

// Configuração do ambiente
dotenv.config();

// Inicializar banco (JSON local ou Postgres)
await initializeLocalDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// Disable CSP completely to allow YouTube embeds
app.use(helmet({
    contentSecurityPolicy: false
}));

// CORS configuration (dev-friendly)
const isDev = (process.env.NODE_ENV || 'development') !== 'production';
const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
const envOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultDevOrigins].filter(Boolean)));

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like curl, postman)
        if (!origin) return callback(null, true);
        if (isDev) {
            // in dev allow the whitelist OR any localhost origin
            if (allowedOrigins.includes(origin) || /^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
                return callback(null, true);
            }
        } else {
            if (allowedOrigins.includes(origin)) return callback(null, true);
        }
        return callback(new Error('CORS policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control']
}));

// Enable preflight for all routes
app.options('*', cors());

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Academia Pro Backend - Local Version'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Academia Pro API - Local Version',
        version: '1.0.0',
        description: 'Backend local - usando JSON local e armazenamento local',
        docs: '/api/docs'
    });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint não encontrado',
        path: req.originalUrl 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Servidor Academia Pro Local rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Versão: 100% Local`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});

export default app;
