// App principal do Academia Pro - Versão 100% Local

// --- App Config ---
const auth = window.LocalAuth;
const dataService = window.LocalData;

// --- State ---
let isLoginMode = true, currentEditingDay = null, currentUserId = null, unsubscribePlan = null;
let weeklyPlanData = {}, tempWorkoutList = [];

// --- DOM Elements ---
const [loginView, appView, loadingOverlay, authForm, authBtn, googleLoginBtn, toggleFormBtn, formTitle, toggleText, errorMessageDiv, errorText, logoutBtn, userEmailSpan, weeklyPlanner, modal, modalTitle, modalBody, saveWorkoutBtn, cancelWorkoutBtn, saveStatus] = ['login-view', 'app-view', 'loading-overlay', 'auth-form', 'auth-btn', 'google-login-btn', 'toggle-form-btn', 'form-title', 'toggle-text', 'error-message', 'error-text', 'logout-btn', 'user-email-display', 'weekly-planner', 'workout-modal', 'modal-title', 'modal-body', 'save-workout-btn', 'cancel-workout-btn', 'save-status'].map(id => document.getElementById(id));

// --- UI Functions ---
const showLoading = show => loadingOverlay.classList.toggle('hidden', !show);
const showError = msg => { errorText.textContent = msg; errorMessageDiv.classList.remove('hidden'); };
const hideError = () => errorMessageDiv.classList.add('hidden');

const toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    authForm.reset();
    hideError();
    formTitle.textContent = isLoginMode ? 'Seu planejador de treinos baseado em ciência.' : 'Crie sua conta e comece a treinar.';
    authBtn.textContent = isLoginMode ? 'Entrar' : 'Cadastrar';
    toggleText.textContent = isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?';
    toggleFormBtn.textContent = isLoginMode ? 'Cadastre-se' : 'Entrar';
};

const renderWeeklyPlanner = () => {
    weeklyPlanner.innerHTML = daysOfWeek.map(day => {
        const dayPlan = weeklyPlanData[day.key] || { muscles: [], exercises: [] };
        const hasWorkout = dayPlan.exercises.length > 0;
        const muscleText = dayPlan.muscles.length > 0 ? dayPlan.muscles.join(', ') : 'Descanso';
        const exerciseCount = dayPlan.exercises.length;
        
        return `
        <div class="bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col border-2 ${hasWorkout ? 'border-blue-500/50 bg-gradient-to-br from-gray-800 to-gray-900' : 'border-gray-700'} hover:border-blue-400/70 transition-all duration-300 workout-card">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-xl text-white">${day.name}</h3>
                ${hasWorkout ? '<div class="w-3 h-3 bg-green-500 rounded-full"></div>' : '<div class="w-3 h-3 bg-gray-500 rounded-full"></div>'}
            </div>
            
            <div class="flex-grow min-h-[100px] mb-4">
                <p class="font-semibold text-base ${hasWorkout ? 'text-blue-400' : 'text-gray-500'} mb-2">${muscleText}</p>
                ${hasWorkout ? `
                    <div class="space-y-1">
                        <p class="text-gray-400 text-sm">${exerciseCount} exercício${exerciseCount !== 1 ? 's' : ''}</p>
                        <div class="max-h-16 overflow-y-auto custom-scrollbar">
                            ${dayPlan.exercises.slice(0, 3).map(ex => `<p class="text-xs text-gray-500">• ${ex}</p>`).join('')}
                            ${dayPlan.exercises.length > 3 ? `<p class="text-xs text-gray-500">... e mais ${dayPlan.exercises.length - 3}</p>` : ''}
                        </div>
                    </div>
                ` : '<p class="text-gray-500 text-sm">Clique para planejar seu treino</p>'}
            </div>
            
            <button data-day="${day.key}" class="edit-workout-btn w-full p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${hasWorkout ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transform hover:scale-105">
                ${hasWorkout ? '✏️ Editar Treino' : '➕ Montar Treino'}
            </button>
        </div>`;
    }).join('');
    document.querySelectorAll('.edit-workout-btn').forEach(btn => btn.addEventListener('click', () => openWorkoutModal(btn.dataset.day)));
};

const openWorkoutModal = (dayKey) => {
    currentEditingDay = dayKey;
    const dayName = daysOfWeek.find(d => d.key === dayKey).name;
    modalTitle.textContent = `🏋️ Treino de ${dayName}`;
    tempWorkoutList = [...(weeklyPlanData[currentEditingDay]?.exercises || [])];
    renderModalView('groups');
    modal.classList.remove('hidden');
    setTimeout(updateWorkoutSummary, 100);
};

const closeModal = () => {
    modal.classList.add('hidden');
    const exerciseCountEl = document.getElementById('exercise-count');
    const muscleGroupsEl = document.getElementById('muscle-groups');
    if (exerciseCountEl) exerciseCountEl.textContent = '0 exercícios selecionados';
    if (muscleGroupsEl) muscleGroupsEl.innerHTML = '';
};

const renderModalView = (viewName, context = {}) => {
    let html = '';
    switch(viewName) {
        case 'groups':
            html = `
            <div class="text-center mb-6">
                <h3 class="text-2xl font-semibold mb-3 text-white">🎯 Selecione o Grupo Muscular</h3>
                <p class="text-gray-400">Escolha qual grupo muscular você quer treinar hoje</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                ${Object.keys(exerciseData).map(group => {
                    const icons = {
                        'Peitoral': '💪',
                        'Ombros': '🔥',
                        'Costas': '🏋️',
                        'Braços': '💥',
                        'Pernas': '🦵',
                        'Core': '⚡'
                    };
                    return `
                    <button class="modal-nav-btn group p-6 border-2 border-gray-600 rounded-xl text-center hover:bg-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105" data-view="portions" data-group="${group}">
                        <div class="text-3xl mb-2">${icons[group] || '🎯'}</div>
                        <div class="text-white font-semibold">${group}</div>
                    </button>`;
                }).join('')}
            </div>`;
            break;
        case 'portions':
            html = `
            <button class="modal-nav-btn mb-6 flex items-center text-blue-400 hover:text-blue-300 transition" data-view="groups">
                <span class="mr-2">←</span> Voltar aos grupos
            </button>
            <div class="text-center mb-6">
                <h3 class="text-2xl font-semibold mb-3 text-white">🔍 Porções de <span class="text-blue-400">${context.group}</span></h3>
                <p class="text-gray-400">Selecione a porção específica que deseja trabalhar</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${Object.keys(exerciseData[context.group]).map(portion => `
                <button class="modal-nav-btn p-5 border-2 border-gray-600 rounded-xl text-center hover:bg-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105" data-view="exercises" data-group="${context.group}" data-portion="${portion}">
                    <div class="text-white font-semibold mb-2">${portion}</div>
                    <div class="text-sm text-gray-400">${exerciseData[context.group][portion].length} exercícios</div>
                </button>`).join('')}
            </div>`;
            break;
        case 'exercises':
            const selectedExercises = tempWorkoutList.filter(ex => exerciseData[context.group][context.portion].includes(ex));
            html = `
            <button class="modal-nav-btn mb-6 flex items-center text-blue-400 hover:text-blue-300 transition" data-view="portions" data-group="${context.group}">
                <span class="mr-2">←</span> Voltar às porções
            </button>
            <div class="text-center mb-6">
                <h3 class="text-2xl font-semibold mb-3 text-white">💪 Exercícios para <span class="text-blue-400">${context.portion}</span></h3>
                <p class="text-gray-400">Selecione os exercícios que deseja incluir no treino</p>
                ${selectedExercises.length > 0 ? `<p class="text-green-400 mt-2">✅ ${selectedExercises.length} exercício${selectedExercises.length !== 1 ? 's' : ''} selecionado${selectedExercises.length !== 1 ? 's' : ''}</p>` : ''}
            </div>
            <div class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                ${exerciseData[context.group][context.portion].map(ex => `
                <label class="flex items-center p-4 rounded-lg hover:bg-gray-700/50 cursor-pointer border border-gray-700 hover:border-gray-600 transition-all duration-200">
                    <input type="checkbox" data-exercise="${ex}" class="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-2" ${tempWorkoutList.includes(ex) ? 'checked' : ''}>
                    <span class="ml-4 text-gray-300 flex-grow">${ex}</span>
                    ${tempWorkoutList.includes(ex) ? '<span class="text-green-400 text-sm">✓</span>' : ''}
                </label>`).join('')}
            </div>
            <div class="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <p class="text-sm text-gray-400 mb-2">💡 <strong>Dica:</strong> Baseado no Guia Mestre de Hipertrofia</p>
                <p class="text-xs text-gray-500">Combine exercícios compostos (força) com isolamentos (hipertrofia) para resultados otimizados.</p>
            </div>`;
            break;
    }
    modalBody.innerHTML = html;
    modalBody.querySelectorAll('.modal-nav-btn').forEach(btn => btn.addEventListener('click', e => renderModalView(e.currentTarget.dataset.view, e.currentTarget.dataset)));
    modalBody.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.addEventListener('change', handleExerciseSelection));
    setTimeout(updateWorkoutSummary, 50);
};

const handleExerciseSelection = (e) => {
    const { exercise } = e.target.dataset;
    if (e.target.checked) {
        if (!tempWorkoutList.includes(exercise)) tempWorkoutList.push(exercise);
    } else {
        tempWorkoutList = tempWorkoutList.filter(ex => ex !== exercise);
    }
    updateWorkoutSummary();
};

const updateWorkoutSummary = () => {
    const exerciseCountEl = document.getElementById('exercise-count');
    const muscleGroupsEl = document.getElementById('muscle-groups');
    
    if (exerciseCountEl) {
        const count = tempWorkoutList.length;
        exerciseCountEl.textContent = `${count} exercício${count !== 1 ? 's' : ''} selecionado${count !== 1 ? 's' : ''}`;
    }
    
    if (muscleGroupsEl) {
        const muscleGroups = [...new Set(tempWorkoutList.flatMap(ex => 
            Object.keys(exerciseData).filter(group => 
                Object.values(exerciseData[group]).flat().includes(ex)
            )
        ))];
        
        if (muscleGroups.length > 0) {
            muscleGroupsEl.innerHTML = `<span class="text-blue-400">Grupos: ${muscleGroups.join(', ')}</span>`;
        } else {
            muscleGroupsEl.innerHTML = '';
        }
    }
};

// --- Backend API Logic ---
const handleAuthAction = async (e) => {
    e.preventDefault();
    hideError();
    showLoading(true);
    const email = authForm.email.value;
    const password = authForm.password.value;
    
    try {
        if (isLoginMode) {
            await auth.login(email, password);
        } else {
            await auth.register(email, password);
        }
    } catch (error) { 
        showError(error.message); 
    } finally { 
        showLoading(false); 
    }
};

const handleGoogleLogin = async () => {
    hideError();
    showLoading(true);
    try { 
        await auth.loginWithGoogle(); 
    } catch (error) { 
        showError(error.message); 
    } finally { 
        showLoading(false); 
    }
};

const handleLogout = async () => {
    console.log('🚪 Botão de logout clicado');
    showLoading(true);
    
    try {
        await auth.logout();
        console.log('✅ Logout executado com sucesso');
        
        weeklyPlanData = {};
        if (unsubscribePlan) unsubscribePlan();
        
        console.log('🧹 Dados da aplicação limpos');
    } catch (error) {
        console.error('❌ Erro durante logout:', error);
    } finally {
        showLoading(false);
    }
};

const saveWorkoutToLocal = async () => {
    if (!currentEditingDay || !currentUserId) return;
    showLoading(true);
    
    const muscleGroups = [...new Set(tempWorkoutList.flatMap(ex => 
        Object.keys(exerciseData).filter(group => 
            Object.values(exerciseData[group]).flat().includes(ex)
        )
    ))];
    
    const newDayPlan = { 
        muscles: muscleGroups, 
        exercises: tempWorkoutList 
    };
    
    try {
        await dataService.saveWorkoutPlan(currentUserId, currentEditingDay, newDayPlan);
        saveStatus.classList.remove('hidden');
        setTimeout(() => saveStatus.classList.add('hidden'), 2000);
        closeModal();
    } catch (error) { 
        console.error("Erro ao salvar treino:", error); 
        alert("Erro ao salvar treino."); 
    } finally { 
        showLoading(false); 
    }
};

const listenToPlanUpdates = (userId) => {
    if (unsubscribePlan) unsubscribePlan();
    
    dataService.onWorkoutPlanSnapshot(userId, (docSnap) => {
        weeklyPlanData = docSnap.exists() ? docSnap.data() : {};
        renderWeeklyPlanner();
    });
    
    // Simular unsubscribe function
    unsubscribePlan = () => {
        // Remove event listeners se necessário
        console.log('Unsubscribed from plan updates');
    };
};

// --- Auth State & App Init ---
auth.onAuthStateChanged(user => {
    console.log('🔔 onAuthStateChanged disparado:', user);
    
    if (user) {
        console.log('✅ Usuário logado detectado:', user.email);
        currentUserId = user.uid;
        loginView.classList.remove('active');
        appView.classList.add('active');
        userEmailSpan.textContent = user.email || 'Usuário';
        listenToPlanUpdates(user.uid);
    } else {
        console.log('🚪 Usuário deslogado detectado');
        currentUserId = null;
        appView.classList.remove('active');
        loginView.classList.add('active');
        if (unsubscribePlan) unsubscribePlan();
    }
});

const initializeApp = async () => {
    showLoading(true);
    try {
        // Inicialização simples para localStorage
        console.log('🚀 Academia Pro inicializado com localStorage');
    } catch (error) { 
        console.error("Erro na inicialização:", error); 
    } finally { 
        showLoading(false); 
    }
};

// --- Event Listeners ---
console.log('🔧 Configurando event listeners...');
console.log('logoutBtn element:', logoutBtn);

toggleFormBtn.addEventListener('click', toggleAuthMode);
authForm.addEventListener('submit', handleAuthAction);
googleLoginBtn.addEventListener('click', handleGoogleLogin);

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
    console.log('✅ Event listener do logout configurado');
} else {
    console.error('❌ Elemento logout-btn não encontrado!');
}

modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
cancelWorkoutBtn.addEventListener('click', closeModal);
saveWorkoutBtn.addEventListener('click', saveWorkoutToLocal);

// --- Initialize App ---
initializeApp();
renderWeeklyPlanner();
