import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar módulos do backend
import authRoutes from './backend/src/routes/auth.js';
import workoutRoutes from './backend/src/routes/workouts.js';
import userRoutes from './backend/src/routes/users.js';
import exerciseRoutes from './backend/src/routes/exercises.js';
import { errorHandler } from './backend/src/middleware/errorHandler.js';

// Importar e configurar o banco local
import fs from 'fs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do ambiente
dotenv.config();

// Função para inicializar banco local (copiada do firebase.js)
const DB_FILE = process.env.DB_PATH || path.join(process.cwd(), 'backend/src/database/db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'academia-pro-production-secret';

const initializeLocalDB = () => {
    try {
        // Criar diretório se não existir
        const dbDir = path.dirname(DB_FILE);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Criar arquivo se não existir
        if (!fs.existsSync(DB_FILE)) {
            const initialData = {
                users: [],
                workouts: [],
                exercises: [],
                userProfiles: [],
                userWorkouts: []
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            console.log('Banco de dados local criado:', DB_FILE);
        }
        console.log('✅ Banco de dados local inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco local:', error);
        throw error;
    }
};

// Inicializar banco local
initializeLocalDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança para produção
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'"]
        }
    }
}));

// CORS configurado para produção
app.use(cors({
    origin: process.env.FRONTEND_URL || true,
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Academia Pro - Production',
        environment: process.env.NODE_ENV || 'production'
    });
});

// Servir o frontend para todas as rotas não-API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Academia Pro rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'production'}`);
    console.log(`💾 Versão: Local + Produção`);
    console.log(`📍 URL: https://your-app.onrender.com`);
});

export default app;
