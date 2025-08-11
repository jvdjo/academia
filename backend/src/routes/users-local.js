import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../database/db.json');

// Função para ler dados do arquivo JSON
const readDatabase = async () => {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler banco de dados:', error);
        return { exercises: [], users: [], workouts: [], progress: [] };
    }
};

// Função para escrever dados no arquivo JSON
const writeDatabase = async (data) => {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao escrever no banco de dados:', error);
        return false;
    }
};

// POST /api/users/register - Registrar novo usuário
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }
        
        const db = await readDatabase();
        
        // Verificar se usuário já existe
        const existingUser = db.users?.find(user => user.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email já está em uso'
            });
        }
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'light',
                language: 'pt-BR'
            }
        };
        
        if (!db.users) db.users = [];
        db.users.push(newUser);
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao salvar usuário');
        }
        
        // Gerar token JWT
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'academia-pro-secret',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    preferences: newUser.preferences
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar usuário',
            error: error.message
        });
    }
});

// POST /api/users/login - Login do usuário
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        
        const db = await readDatabase();
        const user = db.users?.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        
        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
        
        // Gerar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'academia-pro-secret',
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    preferences: user.preferences
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao fazer login',
            error: error.message
        });
    }
});

// GET /api/users/profile - Buscar perfil do usuário
router.get('/profile/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const user = db.users?.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                preferences: user.preferences,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar perfil',
            error: error.message
        });
    }
});

// PUT /api/users/profile/:id - Atualizar perfil do usuário
router.put('/profile/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const userIndex = db.users?.findIndex(u => u.id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        const { name, preferences } = req.body;
        
        if (name) db.users[userIndex].name = name;
        if (preferences) db.users[userIndex].preferences = { ...db.users[userIndex].preferences, ...preferences };
        db.users[userIndex].updatedAt = new Date().toISOString();
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao atualizar perfil');
        }
        
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            data: {
                id: db.users[userIndex].id,
                name: db.users[userIndex].name,
                email: db.users[userIndex].email,
                preferences: db.users[userIndex].preferences
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar perfil',
            error: error.message
        });
    }
});

// GET /api/users - Listar todos os usuários (admin)
router.get('/', async (req, res) => {
    try {
        const db = await readDatabase();
        const users = db.users?.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        })) || [];
        
        res.json({
            success: true,
            data: users,
            total: users.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários',
            error: error.message
        });
    }
});

export default router;
