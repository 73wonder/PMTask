import apisRequest from './api.js';

class LoginManager {
    constructor() {
        this.form = document.getElementById('login-form');
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.themeText = this.themeToggle.querySelector('span');
        
        this.init();
    }

    init() {
        // Carregar tema salvo
        this.loadSavedTheme();
        
        // Event Listeners
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            const user = await apisRequest.GetPrsonByEmail(email);
            
            if (user) {
                // Salvar dados do usuário
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userId', user.Id);
                
                // Redirecionar para a página de boards
                window.location.href = 'board.html';
            } else {
                this.showError('Usuário não encontrado');
            }
        } catch (error) {
            this.showError('Erro ao fazer login');
            console.error(error);
        }
    }

    showError(message) {
        // Criar elemento de erro se não existir
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            this.form.insertBefore(errorDiv, this.form.firstChild);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.opacity = '1';
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
        }, 3000);
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        
        // Atualizar ícone e texto
        this.themeIcon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
        this.themeText.textContent = isDark ? 'Modo Escuro' : 'Modo Claro';
        
        // Salvar preferência
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        
        // Se houver um usuário logado, salvar na API
        const userId = localStorage.getItem('userId');
        if (userId) {
            apisRequest.PersonConfigTheme(userId, isDark ? 'light' : 'dark')
                .catch(error => console.error('Erro ao salvar tema:', error));
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Atualizar ícone e texto
        this.themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        this.themeText.textContent = savedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
    }
}

// Inicializar
new LoginManager();

