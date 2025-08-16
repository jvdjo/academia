import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { getFirestore } from '../services/localdb.js';

const router = express.Router();

// GET /api/users/profile - Buscar perfil do usuário
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists()) {
            // Criar perfil padrão se não existir
            const defaultProfile = {
                email: req.user.email,
                createdAt: new Date().toISOString(),
                preferences: {
                    theme: 'dark',
                    notifications: true
                }
            };

            await db.collection('users').doc(req.user.uid).set(defaultProfile);

            return res.json({
                success: true,
                data: defaultProfile,
                message: 'Perfil criado com sucesso'
            });
        }

        res.json({
            success: true,
            data: userDoc.data(),
            message: 'Perfil encontrado'
        });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar perfil do usuário'
        });
    }
});

// PUT /api/users/profile - Atualizar perfil do usuário
router.put('/profile', authenticateUser, async (req, res) => {
    try {
        const db = getFirestore();
        const { preferences, personalInfo } = req.body;

        const updateData = {
            ...(preferences && { preferences }),
            ...(personalInfo && { personalInfo }),
            updatedAt: new Date().toISOString()
        };

        await db.collection('users').doc(req.user.uid).update(updateData);

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao atualizar perfil'
        });
    }
});

export default router;
