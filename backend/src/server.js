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
import { initializeLocalDB } from './services/firebase.js';

// Configuração do ambiente
dotenv.config();

// Inicializar banco local
initializeLocalDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://172.23.16.1:8080', 'http://192.168.0.144:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware adicional para CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

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
        service: 'Academia Pro Backend - Local Version (No Firebase)'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Academia Pro API - Local Version',
        version: '1.0.0',
        description: 'Backend local sem Firebase - usando JSON Server e localStorage',
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
    console.log(`💾 Versão: SEM Firebase - 100% Local`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});

export default app;
