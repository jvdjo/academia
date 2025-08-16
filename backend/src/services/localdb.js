import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

// Resolve path relative to this file to avoid depending on process.cwd()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho correto para o banco local em produção e desenvolvimento
const DB_FILE = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'academia-pro-local-secret-key';
const DATABASE_URL = process.env.DATABASE_URL;

// Local database service (substitui uso do serviço externo anterior)
class LocalDatabase {
    constructor() {
        this.ensureDbFile();
    }

    ensureDbFile() {
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
        } catch (error) {
            console.error('Erro ao criar banco de dados:', error);
        }
    }

    readData() {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Erro ao ler banco local:', error);
            return { users: [], workouts: [], exercises: [], userProfiles: [] };
        }
    }

    writeData(data) {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Erro ao escrever no banco local:', error);
            throw error;
        }
    }

    // Collection-like methods to mimic Firestore API
    collection(name) {
        return {
            doc: (id) => ({
                get: () => {
                    const data = this.readData();
                    const item = data[name]?.find(item => item.id === id);
                    return {
                        exists: () => !!item,
                        data: () => item,
                        id: id
                    };
                },
                set: (docData, options = {}) => {
                    const data = this.readData();
                    if (!data[name]) data[name] = [];
                    
                    const existingIndex = data[name].findIndex(item => item.id === id);
                    
                    if (options.merge && existingIndex >= 0) {
                        // Merge with existing data
                        data[name][existingIndex] = {
                            ...data[name][existingIndex],
                            ...docData,
                            updatedAt: new Date().toISOString()
                        };
                    } else {
                        const newDoc = { ...docData, id, updatedAt: new Date().toISOString() };
                        
                        if (existingIndex >= 0) {
                            data[name][existingIndex] = newDoc;
                        } else {
                            newDoc.createdAt = new Date().toISOString();
                            data[name].push(newDoc);
                        }
                    }
                    
                    this.writeData(data);
                    return data[name].find(item => item.id === id);
                },
                update: (updateData) => {
                    const data = this.readData();
                    if (!data[name]) data[name] = [];
                    
                    const existingIndex = data[name].findIndex(item => item.id === id);
                    if (existingIndex >= 0) {
                        data[name][existingIndex] = {
                            ...data[name][existingIndex],
                            ...updateData,
                            updatedAt: new Date().toISOString()
                        };
                        this.writeData(data);
                        return data[name][existingIndex];
                    }
                    throw new Error('Documento não encontrado');
                },
                delete: () => {
                    const data = this.readData();
                    if (!data[name]) return;
                    
                    data[name] = data[name].filter(item => item.id !== id);
                    this.writeData(data);
                },
                collection: (subCollectionName) => {
                    const subCollectionKey = `${name}_${id}_${subCollectionName}`;
                    return this.collection(subCollectionKey);
                }
            }),
            get: () => {
                const data = this.readData();
                const docs = (data[name] || []).map(item => ({
                    id: item.id,
                    data: () => item,
                    exists: () => true
                }));
                return { docs };
            },
            add: (docData) => {
                const data = this.readData();
                if (!data[name]) data[name] = [];
                
                const id = 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const newDoc = {
                    ...docData,
                    id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                data[name].push(newDoc);
                this.writeData(data);
                
                return { id, data: () => newDoc };
            },
            where: (field, operator, value) => ({
                get: () => {
                    const data = this.readData();
                    let filteredDocs = data[name] || [];
                    
                    switch (operator) {
                        case '==':
                            filteredDocs = filteredDocs.filter(doc => doc[field] === value);
                            break;
                        case '!=':
                            filteredDocs = filteredDocs.filter(doc => doc[field] !== value);
                            break;
                        case '>':
                            filteredDocs = filteredDocs.filter(doc => doc[field] > value);
                            break;
                        case '>=':
                            filteredDocs = filteredDocs.filter(doc => doc[field] >= value);
                            break;
                        case '<':
                            filteredDocs = filteredDocs.filter(doc => doc[field] < value);
                            break;
                        case '<=':
                            filteredDocs = filteredDocs.filter(doc => doc[field] <= value);
                            break;
                        case 'array-contains':
                            filteredDocs = filteredDocs.filter(doc => 
                                Array.isArray(doc[field]) && doc[field].includes(value)
                            );
                            break;
                    }
                    
                    const docs = filteredDocs.map(item => ({
                        id: item.id,
                        data: () => item,
                        exists: () => true
                    }));
                    
                    return { docs };
                }
            })
        };
    }
}

let db;

// Postgres-backed database mimicking the minimal API we use
class PostgresDatabase {
    constructor(pool) {
        this.pool = pool;
    }

    async ensureTables() {
        const client = await this.pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                  id TEXT PRIMARY KEY,
                  email TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL,
                  display_name TEXT,
                  preferences JSONB,
                  personal_info JSONB,
                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS user_workouts (
                  uid TEXT PRIMARY KEY,
                  plan JSONB NOT NULL,
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `);
        } finally {
            client.release();
        }
    }

    collection(name) {
        if (name === 'users') {
            return {
                where: (field, operator, value) => ({
                    get: async () => {
                        if (operator !== '==') throw new Error('Operador não suportado no Postgres adapter');
                        const { rows } = await this.pool.query(`SELECT * FROM users WHERE ${field} = $1`, [value]);
                        const docs = rows.map(r => ({
                            id: r.id,
                            data: () => ({
                                email: r.email,
                                password: r.password,
                                displayName: r.display_name,
                                preferences: r.preferences || {},
                                personalInfo: r.personal_info,
                                createdAt: r.created_at?.toISOString?.() || r.created_at,
                                updatedAt: r.updated_at?.toISOString?.() || r.updated_at
                            }),
                            exists: () => true
                        }));
                        return { docs };
                    }
                }),
                doc: (id) => ({
                    get: async () => {
                        const { rows } = await this.pool.query('SELECT * FROM users WHERE id=$1', [id]);
                        const r = rows[0];
                        return {
                            exists: () => !!r,
                            id,
                            data: () => r ? ({
                                email: r.email,
                                password: r.password,
                                displayName: r.display_name,
                                preferences: r.preferences || {},
                                personalInfo: r.personal_info,
                                createdAt: r.created_at?.toISOString?.() || r.created_at,
                                updatedAt: r.updated_at?.toISOString?.() || r.updated_at
                            }) : undefined
                        };
                    },
                    set: async (docData) => {
                        await this.pool.query(`
                            INSERT INTO users (id, email, password, display_name, preferences, personal_info)
                            VALUES ($1,$2,$3,$4,$5,$6)
                            ON CONFLICT (id) DO UPDATE SET
                              email=EXCLUDED.email,
                              password=EXCLUDED.password,
                              display_name=EXCLUDED.display_name,
                              preferences=EXCLUDED.preferences,
                              personal_info=EXCLUDED.personal_info,
                              updated_at=NOW();
                        `, [
                            docData.id || id,
                            docData.email,
                            docData.password,
                            docData.displayName,
                            docData.preferences || {},
                            docData.personalInfo || null
                        ]);
                    },
                    update: async (updateData) => {
                        // Build dynamic update for allowed fields
                        const fields = [];
                        const values = [];
                        let idx = 1;
                        if (updateData.email) { fields.push(`email=$${idx++}`); values.push(updateData.email); }
                        if (updateData.password) { fields.push(`password=$${idx++}`); values.push(updateData.password); }
                        if (updateData.displayName) { fields.push(`display_name=$${idx++}`); values.push(updateData.displayName); }
                        if (updateData.preferences) { fields.push(`preferences=$${idx++}`); values.push(updateData.preferences); }
                        if (updateData.personalInfo) { fields.push(`personal_info=$${idx++}`); values.push(updateData.personalInfo); }
                        if (!fields.length) return;
                        const sql = `UPDATE users SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`;
                        values.push(id);
                        await this.pool.query(sql, values);
                    }
                })
            };
        }

        if (name === 'userWorkouts') {
            return {
                doc: (uid) => ({
                    get: async () => {
                        const { rows } = await this.pool.query('SELECT plan FROM user_workouts WHERE uid=$1', [uid]);
                        const r = rows[0];
                        return {
                            exists: () => !!r,
                            id: uid,
                            data: () => r ? r.plan : undefined
                        };
                    },
                    set: async (plan) => {
                        await this.pool.query(`
                            INSERT INTO user_workouts (uid, plan, updated_at)
                            VALUES ($1,$2,NOW())
                            ON CONFLICT (uid) DO UPDATE SET plan=EXCLUDED.plan, updated_at=NOW();
                        `, [uid, plan]);
                    },
                    update: async (updateData) => {
                        // merge update: read current plan, shallow merge, set
                        const { rows } = await this.pool.query('SELECT plan FROM user_workouts WHERE uid=$1', [uid]);
                        const current = rows[0]?.plan || {};
                        const next = { ...current, ...updateData };
                        await this.pool.query(`
                            INSERT INTO user_workouts (uid, plan, updated_at)
                            VALUES ($1,$2,NOW())
                            ON CONFLICT (uid) DO UPDATE SET plan=EXCLUDED.plan, updated_at=NOW();
                        `, [uid, next]);
                    }
                }),
                get: async () => ({ docs: [] })
            };
        }

        // Unsupported collections fallback
        return {
            doc: () => ({ get: async () => ({ exists: () => false }), set: async () => {}, update: async () => {} }),
            where: () => ({ get: async () => ({ docs: [] }) }),
            get: async () => ({ docs: [] })
        };
    }
}

export const initializeLocalDB = async () => {
    try {
        if (DATABASE_URL) {
            const { Pool } = await import('pg');
            const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
            const pgdb = new PostgresDatabase(pool);
            await pgdb.ensureTables();
            db = pgdb;
            console.log('✅ Banco Postgres inicializado com sucesso');
            return db;
        }
        db = new LocalDatabase();
        console.log('✅ Banco de dados local (JSON) inicializado com sucesso');
        return db;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        throw error;
    }
};

export const getFirestore = () => {
    if (!db) {
        throw new Error('Banco local não foi inicializado');
    }
    return db;
};

export const verifyIdToken = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Token inválido');
    }
};

export const generateToken = (userData) => {
    return jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
};
