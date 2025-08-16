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
import { initializeLocalDB } from './backend/src/services/localdb.js';

// Utilidades
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do ambiente
dotenv.config();

// Inicializar banco (JSON local ou Postgres)
await initializeLocalDB();

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

// Servir arquivos estáticos do frontend (React build)
const resolveFrontendDist = () => {
    const override = process.env.FRONTEND_DIST_DIR ? path.resolve(process.env.FRONTEND_DIST_DIR) : null;
    const candidates = [
        override,
        path.join(__dirname, 'frontend', 'dist'),
        path.resolve(process.cwd(), 'frontend', 'dist')
    ].filter(Boolean);
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return candidates[0] || path.join(__dirname, 'frontend', 'dist');
};

const frontendDist = resolveFrontendDist();
if (fs.existsSync(frontendDist)) {
    console.log('🗂️ Servindo frontend estático de:', frontendDist);
    app.use(express.static(frontendDist));
} else {
    console.warn('⚠️ Pasta de build do frontend não encontrada:', frontendDist);
}

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
    const indexFile = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).send('Frontend não construído. Execute "npm run build:frontend".');
    }
});

// Endpoint de debug (opcional)
if (process.env.NODE_ENV !== 'production') {
    app.get('/__debug/frontend', (req, res) => {
        const files = fs.existsSync(frontendDist) ? fs.readdirSync(frontendDist) : [];
        res.json({
            frontendDist,
            exists: fs.existsSync(frontendDist),
            files
        });
    });
}

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
