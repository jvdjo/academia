import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { getFirestore, generateToken } from '../services/firebase.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    displayName: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.details
            });
        }

        const { email, password, displayName } = value;
        const db = getFirestore();

        // Check if user already exists
        const existingUsers = await db.collection('users').where('email', '==', email).get();
        if (existingUsers.docs.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'E-mail já cadastrado'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const userData = {
            email,
            password: hashedPassword,
            displayName: displayName || email.split('@')[0],
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };

        await db.collection('users').doc(userId).set(userData);

        // Generate token
        const token = generateToken({
            uid: userId,
            email: email,
            displayName: userData.displayName
        });

        // Remove password from response
        const { password: _, ...userResponse } = userData;

        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            data: {
                user: { ...userResponse, uid: userId },
                token
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.details
            });
        }

        const { email, password } = value;
        const db = getFirestore();

        // Find user by email
        const users = await db.collection('users').where('email', '==', email).get();
        if (users.docs.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'E-mail ou senha incorretos'
            });
        }

        const userDoc = users.docs[0];
        const userData = userDoc.data();

        // Verify password
        const isValidPassword = await bcrypt.compare(password, userData.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'E-mail ou senha incorretos'
            });
        }

        // Generate token
        const token = generateToken({
            uid: userDoc.id,
            email: userData.email,
            displayName: userData.displayName
        });

        // Remove password from response
        const { password: _, ...userResponse } = userData;

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                user: { ...userResponse, uid: userDoc.id },
                token
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// POST /api/auth/demo - Demo login (for testing)
router.post('/demo', async (req, res) => {
    try {
        const demoUser = {
            uid: 'demo_user_123',
            email: 'demo@academiaapp.com',
            displayName: 'Usuário Demo',
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };

        const token = generateToken({
            uid: demoUser.uid,
            email: demoUser.email,
            displayName: demoUser.displayName
        });

        res.json({
            success: true,
            message: 'Login demo realizado com sucesso',
            data: {
                user: demoUser,
                token
            }
        });
    } catch (error) {
        console.error('Erro no login demo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

export default router;
