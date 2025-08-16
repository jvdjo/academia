import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Caminho correto para o banco local em produção e desenvolvimento
const DB_FILE = process.env.DB_PATH || path.join(process.cwd(), 'backend/src/database/db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'academia-pro-local-secret-key';

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

export const initializeLocalDB = () => {
    try {
        db = new LocalDatabase();
        console.log('✅ Banco de dados local inicializado com sucesso');
        return db;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco local:', error);
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
