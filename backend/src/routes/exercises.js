import express from 'express';
import { exerciseData } from '../models/exercises.js';
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

// GET /api/exercises - Listar todos os exercícios
router.get('/', async (req, res) => {
    try {
        // Retorna dados do modelo estático por padrão
        res.json({
            success: true,
            data: exerciseData,
            message: 'Exercícios listados com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar exercícios'
        });
    }
});

// GET /api/exercises/database - Listar exercícios do banco de dados JSON
router.get('/database', async (req, res) => {
    try {
        const db = await readDatabase();
        const { muscleGroup, equipment, difficulty } = req.query;
        
        let exercises = db.exercises || [];
        
        // Filtros opcionais
        if (muscleGroup) {
            exercises = exercises.filter(ex => ex.muscleGroup === muscleGroup);
        }
        if (equipment) {
            exercises = exercises.filter(ex => ex.equipment === equipment);
        }
        if (difficulty) {
            exercises = exercises.filter(ex => ex.difficulty === difficulty);
        }
        
        res.json({
            success: true,
            data: exercises,
            total: exercises.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar exercícios',
            error: error.message
        });
    }
});

// GET /api/exercises/:group - Listar exercícios por grupo muscular
router.get('/:group', (req, res) => {
    try {
        const { group } = req.params;
        const groupData = exerciseData[group];

        if (!groupData) {
            return res.status(404).json({
                success: false,
                error: 'Grupo muscular não encontrado'
            });
        }

        res.json({
            success: true,
            data: groupData,
            message: `Exercícios do grupo ${group} listados com sucesso`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar exercícios do grupo'
        });
    }
});

// GET /api/exercises/:group/:portion - Listar exercícios por porção específica
router.get('/:group/:portion', (req, res) => {
    try {
        const { group, portion } = req.params;
        const groupData = exerciseData[group];

        if (!groupData) {
            return res.status(404).json({
                success: false,
                error: 'Grupo muscular não encontrado'
            });
        }

        const portionData = groupData[portion];

        if (!portionData) {
            return res.status(404).json({
                success: false,
                error: 'Porção não encontrada'
            });
        }

        res.json({
            success: true,
            data: portionData,
            message: `Exercícios de ${portion} do grupo ${group} listados com sucesso`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar exercícios da porção'
        });
    }
});

// POST /api/exercises - Criar novo exercício personalizado
router.post('/', async (req, res) => {
    try {
        const db = await readDatabase();
        const newExercise = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            custom: true
        };
        
        if (!db.exercises) db.exercises = [];
        db.exercises.push(newExercise);
        
        const success = await writeDatabase(db);
        if (!success) {
            throw new Error('Falha ao salvar exercício');
        }
        
        res.status(201).json({
            success: true,
            message: 'Exercício criado com sucesso',
            data: newExercise
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao criar exercício',
            error: error.message
        });
    }
});

export default router;
