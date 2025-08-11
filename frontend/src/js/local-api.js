// Configuração do Storage Local - Substituindo Firebase
// Sistema de autenticação e armazenamento usando backend local + localStorage

class LocalAuthService {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'academia_pro_user';
        this.tokenKey = 'academia_pro_token';
        // Detectar se está em produção ou desenvolvimento
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : `${window.location.origin}/api`;
        this.authCallbacks = [];
        this.loadCurrentUser();
    }

    // Adicionar callback para mudanças de autenticação
    addAuthCallback(callback) {
        this.authCallbacks.push(callback);
    }

    // Notificar todos os callbacks
    notifyAuthChange() {
        console.log('🔔 Notificando mudança de autenticação para', this.authCallbacks.length, 'callbacks');
        console.log('👤 Estado atual do usuário:', this.currentUser);
        
        this.authCallbacks.forEach((callback, index) => {
            try {
                console.log(`📞 Executando callback ${index + 1}...`);
                callback(this.currentUser);
            } catch (error) {
                console.error(`❌ Erro no callback ${index + 1}:`, error);
            }
        });
    }

    // Carregar usuário do localStorage
    loadCurrentUser() {
        const userData = localStorage.getItem(this.storageKey);
        const token = localStorage.getItem(this.tokenKey);
        if (userData && token) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        const token = localStorage.getItem(this.tokenKey);
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Registrar novo usuário
    async register(email, password, displayName = '') {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, displayName })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro no registro');
            }

            // Salvar token e dados do usuário
            localStorage.setItem(this.tokenKey, data.data.token);
            localStorage.setItem(this.storageKey, JSON.stringify(data.data.user));
            this.currentUser = data.data.user;

            // Notificar mudança de autenticação
            this.notifyAuthChange();

            return data.data.user;
        } catch (error) {
            throw new Error(error.message || 'Erro ao registrar usuário');
        }
    }

    // Fazer login
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro no login');
            }

            // Salvar token e dados do usuário
            localStorage.setItem(this.tokenKey, data.data.token);
            localStorage.setItem(this.storageKey, JSON.stringify(data.data.user));
            this.currentUser = data.data.user;

            // Notificar mudança de autenticação
            this.notifyAuthChange();

            return data.data.user;
        } catch (error) {
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    // Fazer logout
    async logout() {
        console.log('🚪 Iniciando logout...');
        console.log('👤 Usuário antes do logout:', this.currentUser);
        
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.tokenKey);
        
        console.log('🗑️ localStorage limpo');
        console.log('👤 Usuário após logout:', this.currentUser);
        
        // Notificar mudança de autenticação
        console.log('🔔 Notificando logout...');
        this.notifyAuthChange();
        
        console.log('✅ Logout concluído');
    }

    // Login com Google (simulado/demo)
    async loginWithGoogle() {
        console.log('🔄 Iniciando login Google/Demo...');
        
        try {
            const response = await fetch(`${this.apiUrl}/auth/demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Resposta da API recebida:', response.status);
            
            const data = await response.json();
            console.log('📦 Dados da resposta:', data);

            if (!data.success) {
                throw new Error(data.error || 'Erro no login demo');
            }

            // Salvar token e dados do usuário
            localStorage.setItem(this.tokenKey, data.data.token);
            localStorage.setItem(this.storageKey, JSON.stringify(data.data.user));
            this.currentUser = data.data.user;

            console.log('✅ Login Google/Demo realizado com sucesso!');
            console.log('👤 Usuário logado:', this.currentUser);

            // Notificar mudança de autenticação
            this.notifyAuthChange();

            return data.data.user;
        } catch (error) {
            console.error('❌ Erro no login Google/Demo:', error);
            throw new Error(error.message || 'Erro ao fazer login demo');
        }
    }

    // Observar mudanças de autenticação
    onAuthStateChanged(callback) {
        // Adicionar callback à lista
        this.addAuthCallback(callback);
        
        // Callback imediato com estado atual
        setTimeout(() => callback(this.currentUser), 100);
        
        // Observar mudanças no storage (quando vem de outras abas)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.loadCurrentUser();
                callback(this.currentUser);
            }
        });
    }
}

// Serviço de dados locais - agora usando backend
class LocalDataService {
    constructor() {
        // Detectar se está em produção ou desenvolvimento
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : `${window.location.origin}/api`;
    }

    // Get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('academia_pro_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Salvar plano de treino
    async saveWorkoutPlan(userId, dayKey, dayPlan) {
        try {
            const response = await fetch(`${this.apiUrl}/workouts/${dayKey}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(dayPlan)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro ao salvar treino');
            }

            // Disparar evento personalizado para atualizar UI
            window.dispatchEvent(new CustomEvent('workoutPlanUpdated', {
                detail: { userId, dayKey, dayPlan }
            }));

            return data;
        } catch (error) {
            throw new Error(error.message || 'Erro ao salvar plano de treino');
        }
    }

    // Obter plano de treino
    async getWorkoutPlan(userId) {
        try {
            const response = await fetch(`${this.apiUrl}/workouts`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro ao buscar treinos');
            }

            return data.data || {};
        } catch (error) {
            console.error('Erro ao buscar plano:', error);
            return {};
        }
    }

    // Observar mudanças no plano
    onWorkoutPlanSnapshot(userId, callback) {
        // Callback inicial
        this.getWorkoutPlan(userId).then(initialData => {
            callback({ 
                exists: () => Object.keys(initialData).length > 0, 
                data: () => initialData 
            });
        });

        // Escutar mudanças
        window.addEventListener('workoutPlanUpdated', (e) => {
            if (e.detail.userId === userId) {
                this.getWorkoutPlan(userId).then(updatedData => {
                    callback({ 
                        exists: () => true, 
                        data: () => updatedData 
                    });
                });
            }
        });
    }

    // Deletar treino de um dia
    async deleteWorkoutDay(dayKey) {
        try {
            const response = await fetch(`${this.apiUrl}/workouts/${dayKey}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro ao deletar treino');
            }

            return data;
        } catch (error) {
            throw new Error(error.message || 'Erro ao deletar treino');
        }
    }

    // Obter estatísticas
    async getWorkoutStats() {
        try {
            const response = await fetch(`${this.apiUrl}/workouts/stats`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Erro ao buscar estatísticas');
            }

            return data.data;
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalWorkoutDays: 0,
                totalExercises: 0,
                muscleGroups: {},
                weekCompletion: 0
            };
        }
    }
}

// Exportar serviços globalmente
window.LocalAuth = new LocalAuthService();
window.LocalData = new LocalDataService();

// Debug - Console logging for troubleshooting
console.log('🚀 Local API carregado');
console.log('LocalAuth instance:', window.LocalAuth);
console.log('LocalData instance:', window.LocalData);
