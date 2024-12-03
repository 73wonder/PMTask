import { ThemeManager } from './theme.js';
import apisRequest from './api.js';

class LoginManager {
    constructor() {
        this.form = document.getElementById('login-form');
        this.themeToggle = document.getElementById('theme-toggle');
        
        ThemeManager.init();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        this.themeToggle.addEventListener('click', () => ThemeManager.toggle());
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
}

// Inicializar
new LoginManager();

