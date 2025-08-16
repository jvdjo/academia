import express from 'express';
import Joi from 'joi';
import { authenticateUser } from '../middleware/auth.js';
import { getFirestore } from '../services/localdb.js';

const router = express.Router();

// Validação dos dados do treino
const workoutSchema = Joi.object({
    day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
    muscles: Joi.array().items(Joi.string()).required(),
    exercises: Joi.array().items(Joi.string()).required(),
    notes: Joi.string().optional()
});

// GET /api/workouts - Buscar plano semanal do usuário
router.get('/', authenticateUser, async (req, res) => {
    try {
        const db = getFirestore();
        const userWorkouts = db.collection('userWorkouts').doc(req.user.uid);
        const workoutDoc = await userWorkouts.get();

        if (!workoutDoc.exists()) {
            return res.json({
                success: true,
                data: {},
                message: 'Nenhum plano encontrado'
            });
        }

        res.json({
            success: true,
            data: workoutDoc.data(),
            message: 'Plano semanal encontrado'
        });
    } catch (error) {
        console.error('Erro ao buscar treinos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar plano semanal'
        });
    }
});

// POST /api/workouts/:day - Criar/atualizar treino de um dia específico
router.post('/:day', authenticateUser, async (req, res) => {
    try {
        const { day } = req.params;
        const workoutData = { day, ...req.body };

        // Validar dados
        const { error, value } = workoutSchema.validate(workoutData);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.details
            });
        }

        const db = getFirestore();
        const userWorkouts = db.collection('userWorkouts').doc(req.user.uid);

        // Buscar plano existente ou criar um novo
        let currentPlan = {};
        try {
            const existingDoc = await userWorkouts.get();
            if (existingDoc.exists()) {
                currentPlan = existingDoc.data();
            }
        } catch (err) {
            console.log('Criando novo plano para usuário:', req.user.uid);
        }

        // Atualizar apenas o dia específico
        currentPlan[day] = {
            muscles: value.muscles,
            exercises: value.exercises,
            notes: value.notes || '',
            updatedAt: new Date().toISOString()
        };

        // Salvar plano atualizado
        await userWorkouts.set(currentPlan);

        res.json({
            success: true,
            message: `Treino de ${day} salvo com sucesso`
        });
    } catch (error) {
        console.error('Erro ao salvar treino:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao salvar treino',
            details: error.message
        });
    }
});

// DELETE /api/workouts/:day - Remover treino de um dia específico
router.delete('/:day', authenticateUser, async (req, res) => {
    try {
        const { day } = req.params;
        const db = getFirestore();
        const userWorkouts = db.collection('userWorkouts').doc(req.user.uid);

        // Buscar plano atual
        const planDoc = await userWorkouts.get();
        if (planDoc.exists()) {
            const currentData = planDoc.data();
            delete currentData[day];
            await userWorkouts.set(currentData);
        }

        res.json({
            success: true,
            message: `Treino de ${day} removido com sucesso`
        });
    } catch (error) {
        console.error('Erro ao remover treino:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao remover treino'
        });
    }
});

// GET /api/workouts/stats - Estatísticas dos treinos
router.get('/stats', authenticateUser, async (req, res) => {
    try {
        const db = getFirestore();
        const userWorkouts = db.collection('userWorkouts').doc(req.user.uid);
        const planDoc = await userWorkouts.get();

        if (!planDoc.exists()) {
            return res.json({
                success: true,
                data: {
                    totalWorkoutDays: 0,
                    totalExercises: 0,
                    muscleGroups: {},
                    weekCompletion: 0
                },
                message: 'Nenhum plano para calcular estatísticas'
            });
        }

        const planData = planDoc.data();
        const stats = {
            totalWorkoutDays: 0,
            totalExercises: 0,
            muscleGroups: {},
            weekCompletion: 0
        };

        Object.values(planData).forEach(dayPlan => {
            if (dayPlan.exercises && dayPlan.exercises.length > 0) {
                stats.totalWorkoutDays++;
                stats.totalExercises += dayPlan.exercises.length;

                dayPlan.muscles.forEach(muscle => {
                    stats.muscleGroups[muscle] = (stats.muscleGroups[muscle] || 0) + 1;
                });
            }
        });

        stats.weekCompletion = Math.round((stats.totalWorkoutDays / 7) * 100);

        res.json({
            success: true,
            data: stats,
            message: 'Estatísticas calculadas com sucesso'
        });
    } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao calcular estatísticas'
        });
    }
});

export default router;
