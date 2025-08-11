import express from 'express';
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

// GET /api/workouts - Listar todos os treinos
router.get('/', async (req, res) => {
    try {
        const db = await readDatabase();
        const { userId, dayOfWeek } = req.query;
        
        let workouts = db.workouts || [];
        
        // Filtros opcionais
        if (userId) {
            workouts = workouts.filter(workout => workout.userId === userId);
        }
        if (dayOfWeek) {
            workouts = workouts.filter(workout => workout.dayOfWeek === dayOfWeek);
        }
        
        res.json({
            success: true,
            data: workouts,
            total: workouts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar treinos',
            error: error.message
        });
    }
});

// GET /api/workouts/:id - Buscar treino por ID
router.get('/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const workout = db.workouts?.find(w => w.id === req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Treino não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: workout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar treino',
            error: error.message
        });
    }
});

// POST /api/workouts - Criar novo treino
router.post('/', async (req, res) => {
    try {
        const db = await readDatabase();
        const newWorkout = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (!db.workouts) db.workouts = [];
        db.workouts.push(newWorkout);
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao salvar treino');
        }
        
        res.status(201).json({
            success: true,
            message: 'Treino criado com sucesso',
            data: newWorkout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar treino',
            error: error.message
        });
    }
});

// PUT /api/workouts/:id - Atualizar treino
router.put('/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const workoutIndex = db.workouts?.findIndex(w => w.id === req.params.id);
        
        if (workoutIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Treino não encontrado'
            });
        }
        
        db.workouts[workoutIndex] = {
            ...db.workouts[workoutIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao atualizar treino');
        }
        
        res.json({
            success: true,
            message: 'Treino atualizado com sucesso',
            data: db.workouts[workoutIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar treino',
            error: error.message
        });
    }
});

// DELETE /api/workouts/:id - Deletar treino
router.delete('/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const workoutIndex = db.workouts?.findIndex(w => w.id === req.params.id);
        
        if (workoutIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Treino não encontrado'
            });
        }
        
        db.workouts.splice(workoutIndex, 1);
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao deletar treino');
        }
        
        res.json({
            success: true,
            message: 'Treino deletado com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar treino',
            error: error.message
        });
    }
});

// POST /api/workouts/:id/complete - Marcar exercício como completo
router.post('/:id/complete', async (req, res) => {
    try {
        const { exerciseId } = req.body;
        const db = await readDatabase();
        const workout = db.workouts?.find(w => w.id === req.params.id);
        
        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Treino não encontrado'
            });
        }
        
        const exercise = workout.exercises?.find(ex => ex.id === exerciseId);
        if (exercise) {
            exercise.completed = true;
        }
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao marcar exercício como completo');
        }
        
        res.json({
            success: true,
            message: 'Exercício marcado como completo',
            data: workout
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao marcar exercício como completo',
            error: error.message
        });
    }
});

export default router;
